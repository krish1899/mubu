require("dotenv").config();
const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const { Redis } = require("@upstash/redis");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5050;
const server = app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

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

  // Send last 50 messages on connection
  try {
    const lastMessages = await redis.lrange(MESSAGE_LIST, -50, -1);
    lastMessages.forEach(msg => ws.send(msg.toString()));
  } catch (err) {
    console.error("❌ Failed to fetch messages:", err);
  }

  ws.on("message", async (raw) => {
    const str = raw.toString();

    try {
      const parsed = JSON.parse(str);

      if (parsed.type === "login") {
        ws.username = parsed.username;
        activeUsers.add(parsed.username);
        broadcast(JSON.stringify({ type: "online", users: [...activeUsers] }));
        return;
      }

      if (parsed.type === "message") {
        const msgObj = {
          type: "message",
          id: uuidv4(),
          sender: parsed.sender,
          text: parsed.text,
          createdAt: Date.now(),
        };

        const msgString = JSON.stringify(msgObj);

        // 1️⃣ Broadcast immediately
        broadcast(msgString);

        // 2️⃣ Store in Redis after broadcasting
        await redis.rpush(MESSAGE_LIST, msgString);
        await redis.ltrim(MESSAGE_LIST, -500, -1);

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
