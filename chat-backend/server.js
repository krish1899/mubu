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

seedCommentsIfEmpty();

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
const COMMENTS_PREFIX = "comments:";
let activeUsers = new Set();

// Seed comments for each card if empty
const SEED_COMMENTS = [
  "Nice update!",
  "Interesting take 👀",
  "Didn’t expect this one.",
  "Love this topic.",
  "Great read!",
  "Any sources on this?",
  "Wow, didn’t know this.",
  "So true.",
  "This is wild.",
  "I agree with this.",
];

async function seedCommentsIfEmpty() {
  try {
    // Seed for cards 0..9 (newsCount = 10)
    const cardIds = Array.from({ length: 10 }, (_, i) => i);
    await Promise.all(
      cardIds.map(async (cardId) => {
        const key = `${COMMENTS_PREFIX}${cardId}`;
        const existing = await redis.lrange(key, -1, -1);
        if (existing && existing.length > 0) return;

        const picks = Array.from({ length: 3 }, () => {
          const text = SEED_COMMENTS[Math.floor(Math.random() * SEED_COMMENTS.length)];
          return JSON.stringify({
            id: uuidv4(),
            cardId,
            username: "guest",
            text,
            createdAt: Date.now(),
          });
        });
        await redis.rpush(key, ...picks);
      })
    );
    console.log("✅ Seeded comments (if empty)");
  } catch (err) {
    console.error("❌ Failed to seed comments:", err);
  }
}

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

      // Edit message
      if (parsed.type === "edit") {
        if (!parsed.id) return;
        try {
          const list = await redis.lrange(MESSAGE_LIST, -500, -1);
          let changed = false;
          const updated = list.map((raw) => {
            const msg = typeof raw === "string" ? JSON.parse(raw) : raw;
            if (msg.id === parsed.id) {
              changed = true;
              return JSON.stringify({
                ...msg,
                text: typeof parsed.text === "undefined" ? msg.text : parsed.text,
                image: typeof parsed.image === "undefined" ? msg.image : parsed.image,
                editedAt: parsed.editedAt || Date.now(),
              });
            }
            return typeof raw === "string" ? raw : JSON.stringify(raw);
          });
          if (changed) {
            await redis.del(MESSAGE_LIST);
            if (updated.length) {
              await redis.rpush(MESSAGE_LIST, ...updated);
              await redis.ltrim(MESSAGE_LIST, -500, -1);
            }
            broadcast(JSON.stringify({
              type: "edit",
              id: parsed.id,
              text: parsed.text,
              image: parsed.image,
              editedAt: parsed.editedAt || Date.now(),
            }));
          }
        } catch (err) {
          console.error("❌ Failed to edit message:", err);
        }
        return;
      }

      // Delete message
      if (parsed.type === "delete") {
        if (!parsed.id) return;
        try {
          const list = await redis.lrange(MESSAGE_LIST, 0, -1);
          let removed = false;
          const updated = [];
          for (const raw of list) {
            const msg = typeof raw === "string" ? JSON.parse(raw) : raw;
            if (msg.id === parsed.id) {
              removed = true;
              continue;
            }
            updated.push(typeof raw === "string" ? raw : JSON.stringify(raw));
          }
          if (removed) {
            await redis.del(MESSAGE_LIST);
            if (updated.length) {
              await redis.rpush(MESSAGE_LIST, ...updated);
              await redis.ltrim(MESSAGE_LIST, -500, -1);
            }
            broadcast(JSON.stringify({ type: "delete", id: parsed.id }));
          }
        } catch (err) {
          console.error("❌ Failed to delete message:", err);
        }
        return;
      }

      // Like message
      if (parsed.type === "like") {
        if (!parsed.id || !parsed.username) return;
        try {
          const list = await redis.lrange(MESSAGE_LIST, 0, -1);
          let changed = false;
          const updated = list.map((raw) => {
            const msg = typeof raw === "string" ? JSON.parse(raw) : raw;
            if (msg.id === parsed.id) {
              const likedBy = Array.isArray(msg.likedBy) ? msg.likedBy : [];
              const hasLiked = likedBy.includes(parsed.username);
              const nextLikedBy = hasLiked
                ? likedBy.filter((u) => u !== parsed.username)
                : [...likedBy, parsed.username];
              changed = true;
              return JSON.stringify({ ...msg, likedBy: nextLikedBy });
            }
            return typeof raw === "string" ? raw : JSON.stringify(raw);
          });
          if (changed) {
            await redis.del(MESSAGE_LIST);
            if (updated.length) {
              await redis.rpush(MESSAGE_LIST, ...updated);
              await redis.ltrim(MESSAGE_LIST, -500, -1);
            }
            const updatedMsgRaw = updated.find((raw) => {
              try {
                const msg = typeof raw === "string" ? JSON.parse(raw) : raw;
                return msg.id === parsed.id;
              } catch {
                return false;
              }
            });
            const updatedMsg = updatedMsgRaw
              ? (typeof updatedMsgRaw === "string" ? JSON.parse(updatedMsgRaw) : updatedMsgRaw)
              : null;
            broadcast(
              JSON.stringify({
                type: "like",
                id: parsed.id,
                likedBy: updatedMsg?.likedBy || [],
              })
            );
          }
        } catch (err) {
          console.error("❌ Failed to like message:", err);
        }
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
          likedBy: Array.isArray(parsed.likedBy) ? parsed.likedBy : [],
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

// ---------------- Comments API ----------------
app.get("/comments/:cardId", async (req, res) => {
  try {
    const { cardId } = req.params;
    const key = `${COMMENTS_PREFIX}${cardId}`;
    const list = await redis.lrange(key, -200, -1);
    const parsed = list.map((item) => (typeof item === "string" ? JSON.parse(item) : item));
    res.json(parsed);
  } catch (err) {
    console.error("❌ Failed to fetch comments:", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

app.post("/comments", async (req, res) => {
  try {
    const { cardId, text, username } = req.body || {};
    if (typeof cardId === "undefined" || !text) {
      return res.status(400).json({ error: "cardId and text required" });
    }
    const comment = {
      id: uuidv4(),
      cardId,
      username: username || "anon",
      text,
      createdAt: Date.now(),
    };
    const key = `${COMMENTS_PREFIX}${cardId}`;
    await redis.rpush(key, JSON.stringify(comment));
    await redis.ltrim(key, -200, -1);
    res.json(comment);
  } catch (err) {
    console.error("❌ Failed to save comment:", err);
    res.status(500).json({ error: "Failed to save comment" });
  }
});
