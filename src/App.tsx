import { useState, useEffect, useRef } from "react";
import "./App.css";

interface Message {
  id?: string;
  sender: string;
  text: string;
  imageUrl?: string;
  createdAt: number;
  type?: string;
}

const PASSWORDS: { [key: string]: string } = {
  "mumu123": "mumu",
  "bubu123": "bubu",
};

const getAvatar = (sender: string) => {
  const initial = sender.charAt(0).toUpperCase();
  let color = "#ccc";
  if (sender === "mumu") color = "#ffc107";
  if (sender === "bubu") color = "#17a2b8";
  if (sender === "me") color = "#007bff";
  return { initial, color };
};

function App() {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // WebSocket setup
  useEffect(() => {
    if (!authenticated) return;

    ws.current = new WebSocket("wss://mubu-backend-rpx8.onrender.com"); // Updated for deployment

    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ type: "login", username }));
    };

    ws.current.onclose = () => console.log("❌ WebSocket disconnected");

    ws.current.onmessage = (event) => {
      try {
        const msg: Message = JSON.parse(event.data);

        if (msg.type === "message") {
          setMessages((prev) => {
            const isDuplicate = prev.some((m) => m.id === msg.id);
            if (isDuplicate) return prev;
            return [...prev, msg];
          });
        }

        if (msg.type === "delete") {
          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
        }

        if (msg.type === "typing" && msg.sender !== username) {
          setTypingUser(msg.sender);
          setTimeout(() => setTypingUser(null), 2000);
        }
      } catch (err) {
        console.error("❌ Failed to parse message:", event.data);
      }
    };

    return () => ws.current?.close();
  }, [authenticated]);

  // Scroll to bottom on new message
  useEffect(() => {
    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleLogin = () => {
    if (PASSWORDS[password]) {
      setUsername(PASSWORDS[password]);
      setAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleSend = () => {
    if (!newMessage.trim() || !ws.current) return;

    const messageToSend: Message = {
      type: "message",
      sender: username,
      text: newMessage,
      createdAt: Date.now(),
    };

    ws.current.send(JSON.stringify(messageToSend));
    setNewMessage("");
  };

  if (!authenticated) {
    return (
      <div className="login">
        <div className="login-box">
          <img src="/logo.png" alt="Logo" className="login-logo" />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Enter</button>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header-bar">
        <div className="header-info">
          <div
            className="avatar current-user-avatar"
            style={{ backgroundColor: getAvatar(username).color }}
          >
            {getAvatar(username).initial}
          </div>
          <div className="user-name">Welcome, {username}!</div>
        </div>
      </div>

      <div className="chat-box">
        {typingUser && <div className="typing-indicator">{typingUser} is typing…</div>}

        {messages.map((msg, idx) => {
          const isMe = msg.sender === username;
          const cls = isMe ? "me" : msg.sender;
          const showProfile = !isMe;

          return (
            <div key={idx} className={`message-group ${cls}`}>
              {showProfile && (
                <div
                  className="avatar message-avatar"
                  style={{ backgroundColor: getAvatar(msg.sender).color }}
                >
                  {getAvatar(msg.sender).initial}
                </div>
              )}
              <div className="message-content">
                {showProfile && <div className="sender-name">{msg.sender}</div>}
                <div className={`message ${cls}`}>
                  {msg.text && <div>{msg.text}</div>}
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="chat-img" className="chat-image" />
                  )}
                  <span className="timestamp">{formatTime(msg.createdAt)}</span>
                  {isMe && msg.id && (
                    <button
                      className="delete-btn"
                      onClick={() =>
                        ws.current?.send(JSON.stringify({ type: "delete", id: msg.id }))
                      }
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef}></div>
      </div>

      <div className="input-box">
        <input
          type="text"
          value={newMessage}
          placeholder="Type a message..."
          onFocus={() => {
            setTimeout(() => {
              chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 300);
          }}
          onChange={(e) => {
            setNewMessage(e.target.value);
            ws.current?.send(JSON.stringify({ type: "typing", sender: username }));
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default App;
