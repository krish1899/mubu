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
app.use(cors());
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
// Generate once: npx web-push generate-vapid-keys
// Put them in your .env:
// VAPID_PUBLIC_KEY=xxx
// VAPID_PRIVATE_KEY=xxx
webpush.setVapidDetails(
  "mailto:tinkupinky824@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

let subscribers = [];

app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscribers.push(subscription);
  console.log("📬 New subscriber added");
  res.status(201).json({ message: "Subscribed successfully" });
});

// Sample news headlines for disguise
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

// ---------------------- WEBSOCKET SETUP ----------------------
const MESSAGE_LIST = "chat_messages";
let activeUsers = new Set();

const wss = new WebSocket.Server({ server });

function broadcast(msg) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

wss.on("connection", async (ws) => {
  console.log("👤 New client connected");

  // Send last 5 messages
  try {
    const lastMessages = await redis.lrange(MESSAGE_LIST, -5, -1);
    lastMessages.forEach(msg => {
      try {
        const parsed = JSON.parse(msg);
        parsed.type = "message";
        ws.send(JSON.stringify(parsed));
      } catch (err) {
        console.error("❌ Failed to parse stored message:", msg);
      }
    });
  } catch (err) {
    console.error("❌ Failed to fetch messages:", err);
  }

  ws.on("message", async (raw) => {
    const str = raw.toString();

    try {
      const parsed = JSON.parse(str);
      if (parsed.type === "ping") return;

      if (parsed.type === "login") {
        ws.username = parsed.username;
        activeUsers.add(parsed.username);
        broadcast(JSON.stringify({ type: "online", users: [...activeUsers] }));
        return;
      }

      if (parsed.type === "message") {
        const msgObj = {
          type: "message",
          id: parsed.id || uuidv4(),
          sender: parsed.sender,
          text: parsed.text,
          createdAt: parsed.createdAt || Date.now(),
        };

        const msgString = JSON.stringify(msgObj);

        // Broadcast message to all users
        broadcast(msgString);

        // Save to Redis
        await redis.rpush(MESSAGE_LIST, msgString);
        await redis.ltrim(MESSAGE_LIST, -500, -1);

        // Send disguised news notification
        const randomTitle =
          NEWS_TITLES[Math.floor(Math.random() * NEWS_TITLES.length)];

        const payload = JSON.stringify({
          title: randomTitle,
          body: "Tap to read more inside the app.",
          icon: "/jujo.jpg",
        });

        subscribers.forEach((sub) => {
          webpush.sendNotification(sub, payload).catch((err) => {
            console.error("❌ Push error:", err);
          });
        });
        return;
      }

      if (parsed.type === "delete") {
        broadcast(JSON.stringify({ type: "delete", id: parsed.id }));
        return;
      }

      if (parsed.type === "typing") {
        broadcast(JSON.stringify({ type: "typing", sender: parsed.sender }));
        return;
      }
    } catch (err) {
      console.error("❌ WS Error:", err);
    }
  });

  ws.on("close", () => {
    if (ws.username) {
      activeUsers.delete(ws.username);
      broadcast(JSON.stringify({ type: "online", users: [...activeUsers] }));
      console.log("👋 Disconnected:", ws.username);
    }
  });
});
