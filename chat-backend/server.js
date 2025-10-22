require("dotenv").config();
const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const { Redis } = require("@upstash/redis");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL, methods: ["GET", "POST"] }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 5050;
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

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

// ---------------- WebSocket ----------------
const MESSAGE_LIST = "chat_messages";
let activeUsers = new Set();

const wss = new WebSocket.Server({ server });

function broadcast(msg) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });
}

async function sendLastMessages(ws) {
  try {
    const lastMessages = await redis.lrange(MESSAGE_LIST, -10, -1);
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
}

wss.on("connection", async (ws) => {
  console.log("👤 New client connected");
  await sendLastMessages(ws);

  ws.on("message", async (raw) => {
    try {
      const parsed = JSON.parse(raw.toString());
      if (parsed.type === "ping") return;

      // Login
      if (parsed.type === "login") {
        ws.username = parsed.username;
        activeUsers.add(parsed.username);
        broadcast(JSON.stringify({ type: "online-users", users: [...activeUsers] }));
        return;
      }

      // Typing
      if (parsed.type === "typing") {
        broadcast(JSON.stringify({ type: "typing", sender: parsed.sender }));
        return;
      }

      // Chat message
      if (parsed.type === "message") {
        const msgObj = {
          type: "message",
          id: parsed.id || uuidv4(),
          sender: parsed.sender,
          text: parsed.text ?? "",
          image: parsed.image ?? null,
          createdAt: parsed.createdAt || Date.now(),
          replyTo: parsed.replyTo ?? null,
        };

        const msgString = JSON.stringify(msgObj);
        await redis.rpush(MESSAGE_LIST, msgString);
        await redis.ltrim(MESSAGE_LIST, -500, -1);
        broadcast(msgString);

        // Telegram for solo user
        if (activeUsers.size < 2) {
          sendTelegramRandomPic().catch(err => console.error("Telegram error", err));
        }
        return;
      }
    } catch (err) {
      console.error("❌ WS error:", err);
    }
  });

  ws.on("close", () => {
    if (ws.username) {
      activeUsers.delete(ws.username);
      broadcast(JSON.stringify({ type: "online-users", users: [...activeUsers] }));
      console.log("👋 Disconnected:", ws.username);
    }
  });
});
