require("dotenv").config();
const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const { Redis } = require("@upstash/redis");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");

// ---------------------- APP SETUP ----------------------
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL, methods: ["GET", "POST"] }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 5050;
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// ---------------------- REDIS ----------------------
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

// ---------------------- TELEGRAM BOT ----------------------
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_CHAT_ID2 = process.env.TELEGRAM_CHAT_ID2;

async function sendTelegramRandomPic() {
  const picUrl = `https://picsum.photos/400?random=${Math.floor(Math.random() * 1000)}`;
  const recipients = [TELEGRAM_CHAT_ID, TELEGRAM_CHAT_ID2];

  try {
    await Promise.all(
      recipients.map(id =>
        fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: id, photo: picUrl, caption: "new picture for you! 📸" }),
        })
      )
    );
    console.log("✅ Sent Telegram random pic to both users");
  } catch (err) {
    console.error("❌ Telegram send error:", err);
  }
}

// ---------------------- WEBSOCKET CHAT ----------------------
const MESSAGE_LIST = "chat_messages";
let activeUsers = new Set();

const wss = new WebSocket.Server({ server });

// Broadcast to all connected clients
function broadcast(msg) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });
}

// Send last 5 messages to a newly connected client
async function sendLastMessages(ws) {
  try {
    const lastMessages = await redis.lrange(MESSAGE_LIST, -5, -1);
    lastMessages.forEach(msg => {
      try { ws.send(typeof msg === "string" ? msg : JSON.stringify(msg)); } catch {}
    });
  } catch (err) {
    console.error("❌ Failed to fetch messages:", err);
  }
}

// ---------------------- WEBSOCKET CONNECTION ----------------------
wss.on("connection", async (ws) => {
  console.log("👤 New client connected");
  await sendLastMessages(ws);

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

      // Typing indicator
      if (parsed.type === "typing") {
        broadcast(JSON.stringify({ type: "typing", sender: parsed.sender }));
        return;
      }

      // Chat message (text + optional image)
      if (parsed.type === "message") {
        const msgObj = {
          type: "message",
          id: parsed.id || uuidv4(),
          sender: parsed.sender,
          text: parsed.text || "",
          image: parsed.image || null, // <-- image support
          createdAt: parsed.createdAt || Date.now(),
        };

        const msgString = JSON.stringify(msgObj);
        await redis.rpush(MESSAGE_LIST, msgString);
        await redis.ltrim(MESSAGE_LIST, -500, -1);
        broadcast(msgString);

        if (activeUsers.size < 2) sendTelegramRandomPic(); // fire-and-forget
        return;
      }
    } catch (err) {
      console.error("❌ WS Error:", err);
    }
  });

  // Handle disconnect
  ws.on("close", () => {
    if (ws.username) {
      activeUsers.delete(ws.username);
      broadcast(JSON.stringify({ type: "online", users: [...activeUsers] }));
      console.log("👋 Disconnected:", ws.username);
    }
  });
});
