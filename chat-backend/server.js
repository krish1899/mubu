require("dotenv").config();
const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const { Redis } = require("@upstash/redis");
const webpush = require("web-push");
const bodyParser = require("body-parser");

// ---------------------- APP SETUP ----------------------
const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  })
);
app.use(bodyParser.json());

const PORT = process.env.PORT || 5050;
const server = app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

// ---------------------- REDIS SETUP ----------------------
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

// ---------------------- PUSH NOTIFICATIONS ----------------------
webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

let subscribers = [];

// Add new subscriber
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscribers.push(subscription);
  console.log("📬 New subscriber added");
  res.status(201).json({ message: "Subscribed successfully" });
});

// ---------------------- WEBSOCKET CHAT ----------------------
const MESSAGE_LIST = "chat_messages";
let activeUsers = new Set();

const wss = new WebSocket.Server({ server });

// Broadcast message to all connected clients
function broadcast(msg) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });
}

// Sample news titles for push notifications
const NEWS_TITLES = [
  "Breaking: Tech trends shaping the week ahead",
  "Update: Global markets show mixed reactions",
  "Flash: Scientists unveil new breakthrough",
  "Insight: AI tools transforming communication",
  "Top story: Startups redefining remote work",
  "Hot news: Economic reforms spark innovation",
  "Latest: Cloud computing adoption skyrockets",
  "Trending: Apps improving productivity worldwide",
];

wss.on("connection", async (ws) => {
  console.log("👤 New client connected");

  // ---------------------- SEND LAST 5 MESSAGES ----------------------
  try {
    const lastMessages = await redis.lrange(MESSAGE_LIST, -5, -1);
    lastMessages.forEach((msg) => {
      try {
        ws.send(typeof msg === "string" ? msg : JSON.stringify(msg));
      } catch (err) {
        console.error("❌ Failed to replay message:", msg);
      }
    });
  } catch (err) {
    console.error("❌ Failed to fetch messages:", err);
  }

  // ---------------------- HANDLE INCOMING MESSAGES ----------------------
  ws.on("message", async (raw) => {
    try {
      const parsed = JSON.parse(raw.toString());
      if (parsed.type === "ping") return;

      // User login
      if (parsed.type === "login") {
        ws.username = parsed.username;
        activeUsers.add(parsed.username);
        broadcast(JSON.stringify({ type: "online", users: [...activeUsers] }));
        return;
      }

      // Chat message
      if (parsed.type === "message") {
        const msgObj = {
          type: "message",
          id: parsed.id || uuidv4(),
          sender: parsed.sender,
          text: parsed.text,
          createdAt: parsed.createdAt || Date.now(),
        };

        const msgString = JSON.stringify(msgObj);

        broadcast(msgString);
        await redis.rpush(MESSAGE_LIST, msgString);
        await redis.ltrim(MESSAGE_LIST, -500, -1);

        // Push notifications
        const randomTitle =
          NEWS_TITLES[Math.floor(Math.random() * NEWS_TITLES.length)];
        const payload = JSON.stringify({
          title: randomTitle,
          body: "Tap to read more inside the app.",
          icon: "/jujo.jpg",
        });

        subscribers.forEach((sub) =>
          webpush.sendNotification(sub, payload).catch((err) =>
            console.error("❌ Push error:", err)
          )
        );

        return;
      }

      // Delete message
      if (parsed.type === "delete") {
        broadcast(JSON.stringify({ type: "delete", id: parsed.id }));
        return;
      }

      // Typing indicator
      if (parsed.type === "typing") {
        broadcast(JSON.stringify({ type: "typing", sender: parsed.sender }));
        return;
      }
    } catch (err) {
      console.error("❌ WS Error:", err);
    }
  });

  // ---------------------- HANDLE CLIENT DISCONNECT ----------------------
  ws.on("close", () => {
    if (ws.username) {
      activeUsers.delete(ws.username);
      broadcast(JSON.stringify({ type: "online", users: [...activeUsers] }));
      console.log("👋 Disconnected:", ws.username);
    }
  });
});
