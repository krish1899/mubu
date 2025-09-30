import express from "express";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Create Redis clients
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

// Publisher endpoint
app.post("/publish", async (req, res) => {
  const { channel, message } = req.body;
  try {
    await redis.publish(channel, message);
    res.json({ success: true, message: "Message published" });
  } catch (err) {
    console.error("Publish error:", err);
    res.status(500).json({ error: "Publish failed" });
  }
});

// Subscriber endpoint
// (you don’t need a long-lived socket — Upstash will call your handler per message)
app.get("/subscribe/:channel", async (req, res) => {
  const channel = req.params.channel;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.flushHeaders();

  // Subscribe to channel
  const sub = redis.subscribe(channel, (msg) => {
    res.write(`data: ${msg}\n\n`);
  });

  req.on("close", async () => {
    console.log("Closing connection");
    (await sub).unsubscribe();
    res.end();
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
