import { useState, useEffect, useRef } from "react";
import "./App.css";

interface Message {
  id?: string;
  sender: string;
  text: string;
  createdAt: number;
  type?: string;
}

const PASSWORDS: { [key: string]: string } = {
  "mumu123": "mumu",
  "bubu123": "bubu",
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

  // WebSocket connection
  useEffect(() => {
    if (!authenticated) return;

    ws.current = new WebSocket("wss://mubu-backend-rpx9.onrender.com");

    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ type: "login", username }));
    };

    ws.current.onmessage = (event) => {
      try {
        const msg: Message = JSON.parse(event.data);

        if (msg.type === "message") {
          setMessages(prev => [...prev, msg]); // append message immediately
        }

        if (msg.type === "typing" && msg.sender !== username) {
          setTypingUser(msg.sender);
          setTimeout(() => setTypingUser(null), 2000);
        }

        if (msg.type === "delete") {
          setMessages(prev => prev.filter(m => m.id !== msg.id));
        }
      } catch (err) {
        console.error("Failed to parse WS message:", event.data);
      }
    };

    ws.current.onclose = () => console.log("WebSocket disconnected");

    return () => ws.current?.close();
  }, [authenticated]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogin = () => {
    if (PASSWORDS[password]) {
      setUsername(PASSWORDS[password]);
      setAuthenticated(true);
      setError("");
    } else setError("Incorrect password");
  };

  const handleSend = () => {
    if (!newMessage.trim() || !ws.current) return;

    const msg = {
      type: "message",
      sender: username,
      text: newMessage,
      createdAt: Date.now(),
    };

    ws.current.send(JSON.stringify(msg));
    setNewMessage("");
    setMessages(prev => [...prev, msg]); // show immediately
  };

  if (!authenticated) {
    return (
      <div className="login">
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"/>
        <button onClick={handleLogin}>Enter</button>
        {error && <p>{error}</p>}
      </div>
    );
  }

  return (
    <div className="app">
      <div className="chat-box">
        {typingUser && <div>{typingUser} is typing…</div>}
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.sender}:</b> {m.text} <small>{formatTime(m.createdAt)}</small>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>
      <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message"/>
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default App;
