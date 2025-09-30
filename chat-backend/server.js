// server.js
require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const Redis = require("ioredis");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded images

// Use dynamic port for Render
const PORT = process.env.PORT || 5050;
const server = app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

// Upstash Redis connection
const redisOptions = {
  url: process.env.UPSTASH_REDIS_URL,
  password: process.env.UPSTASH_REDIS_TOKEN,
  // Optional: handle connection retries
  maxRetriesPerRequest: 5,
};

const redisPub = new Redis(redisOptions);
const redisSub = new Redis(redisOptions);

// Handle Redis connection errors
redisPub.on("error", (err) => console.error("❌ Redis Pub Error:", err));
redisSub.on("error", (err) => console.error("❌ Redis Sub Error:", err));

const CHANNEL = "chatroom";
const MESSAGE_LIST = "chat_messages";

let activeUsers = new Set();

// Multer config for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

app.post("/upload", upload.single("image"), (req, res) => {
  const host = req.get("host");
  const protocol = req.protocol;
  const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// WebSocket broadcast helper
function broadcast(msg) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

// Subscribe to Redis channel
redisSub.subscribe(CHANNEL);
redisSub.on("message", (channel, message) => {
  broadcast(message);
});

// WebSocket server
const wss = new WebSocket.Server({ server });

wss.on("connection", async (ws) => {
  console.log("👤 New WebSocket client connected");

  // Send last 50 messages to new client
  try {
    const lastMessages = await redisPub.lrange(MESSAGE_LIST, -50, -1);
    lastMessages.forEach((msg) => ws.send(msg));
  } catch (err) {
    console.error("❌ Failed to fetch last messages:", err);
  }

  ws.on("message", async (raw) => {
    try {
      const parsed = JSON.parse(raw);

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
          imageUrl: parsed.imageUrl || null,
          createdAt: parsed.createdAt,
        };
        const msgString = JSON.stringify(msgObj);
        await redisPub.rpush(MESSAGE_LIST, msgString);
        await redisPub.ltrim(MESSAGE_LIST, -500, -1);
        redisPub.publish(CHANNEL, msgString);
        return;
      }

      if (parsed.type === "delete") {
        redisPub.publish(CHANNEL, JSON.stringify({ type: "delete", id: parsed.id }));
        return;
      }

      if (parsed.type === "typing") {
        redisPub.publish(CHANNEL, JSON.stringify({ type: "typing", sender: parsed.sender }));
        return;
      }

    } catch (err) {
      console.error("❌ Error parsing WebSocket message:", err);
    }
  });

  ws.on("close", () => {
    if (ws.username) {
      activeUsers.delete(ws.username);
      broadcast(JSON.stringify({ type: "online", users: [...activeUsers] }));
      console.log("👋 Disconnected:", ws.username);
    } else {
      console.log("👋 Anonymous client disconnected");
    }
  });
});
