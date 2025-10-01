require("dotenv").config(); // Load env
const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { Redis } = require("@upstash/redis");

const app = express();
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

// Render dynamic port
const PORT = process.env.PORT || 5050;
const server = app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

// Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

const CHANNEL = "chatroom";
const MESSAGE_LIST = "chat_messages";
let activeUsers = new Set();

// Multer config
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

// WebSocket server
const wss = new WebSocket.Server({ server });

function broadcast(msg) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

// Subscribe to Redis channel
(async () => {
  await redis.subscribe(CHANNEL, (message) => {
    broadcast(message);
  });
})();

wss.on("connection", async (ws) => {
  console.log("👤 New client connected");

  // Send last 50 messages
  try {
    const lastMessages = await redis.lrange(MESSAGE_LIST, -50, -1);
    lastMessages.forEach((msg) => ws.send(msg));
  } catch (err) {
    console.error("❌ Failed to fetch messages:", err);
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
        await redis.rpush(MESSAGE_LIST, msgString);
        await redis.ltrim(MESSAGE_LIST, -500, -1);
        await redis.publish(CHANNEL, msgString);
        return;
      }

      if (parsed.type === "delete") {
        await redis.publish(CHANNEL, JSON.stringify({ type: "delete", id: parsed.id }));
        return;
      }

      if (parsed.type === "typing") {
        await redis.publish(CHANNEL, JSON.stringify({ type: "typing", sender: parsed.sender }));
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
    } else {
      console.log("👋 Anonymous disconnected");
    }
  });
});
