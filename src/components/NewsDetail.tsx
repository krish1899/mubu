import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Message, ReplyInfo } from "../types";

type NewsDetailProps = {
  sessionNews: any[];
  imageSeeds: number[];
  username: string;
  getNewsImage: (seed: number) => string;
};

type CommentItem = {
  id: string;
  cardId: number;
  username: string;
  text: string;
  createdAt: number;
};

function NewsDetail({ sessionNews, imageSeeds, username, getNewsImage }: NewsDetailProps) {
  const { id } = useParams();
  const idx = Number(id);
  const navigate = useNavigate();
  const isPrivateChatCard = idx === 8; // 9th card index

  const [chatVisible, setChatVisible] = useState(false);
  const [chatLocked, setChatLocked] = useState(true);
  const [unlockInput, setUnlockInput] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [replyTo, setReplyTo] = useState<ReplyInfo | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const screenEndRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const fileInputCameraRef = useRef<HTMLInputElement | null>(null);
  const fileInputGalleryRef = useRef<HTMLInputElement | null>(null);

  const lastTypingRef = useRef<number>(0);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [showShorts, setShowShorts] = useState(false);
  const [shortsId, setShortsId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [roseTheme, setRoseTheme] = useState(false);
  const [likedMessageIds, setLikedMessageIds] = useState<Set<string>>(new Set());

  const API_BASE = (import.meta as any).env?.VITE_API_BASE || "https://mubu-backend-rpx8.onrender.com";

  // ---------- WebSocket with auto-reconnect & message queue ----------
  const [loadingMessages, setLoadingMessages] = useState(true); // NEW: show loading
  const messageQueue = useRef<any[]>([]); // queue for messages that can't be sent
  const reconnectTimer = useRef<number | null>(null);
  const pendingTimeouts = useRef<Record<string, number>>({});
  // NEW: auto-reconnect timer

  useEffect(() => {
    let wsAlive = true; // flag to avoid multiple connects

    const connectWs = () => {
      if (!wsAlive) return;

      ws.current = new WebSocket("wss://mubu-backend-rpx8.onrender.com");

      ws.current.onopen = () => {
        // login
        ws.current?.send(JSON.stringify({ type: "login", username }));

        // flush queued messages
        messageQueue.current.forEach((m) => {
          ws.current?.send(JSON.stringify(m));
          if (m?.type === "message" && m.id) scheduleFail(m.id);
        });
        messageQueue.current = [];
        setLoadingMessages(false); // first batch can now show
      };

      ws.current.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);

          if (parsed.type === "online-users") setOnlineUsers(parsed.users);

          if (parsed.type === "message") {
            setMessages((prev) => {
              const exists = prev.find((m) => m.id === parsed.id);
              if (exists) {
                return prev.map((m) =>
                  m.id === parsed.id ? { ...parsed, localStatus: "sent" } : m
                );
              }
              return [...prev, { ...parsed, localStatus: "sent" }];
            });
            if (parsed.id) {
              clearFailTimer(parsed.id);
              removeQueuedMessage(parsed.id);
            }
            setLoadingMessages(false); // hide loading once first message arrives
          }

          if (parsed.type === "edit") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === parsed.id
                  ? {
                      ...m,
                      text: parsed.text ?? m.text,
                      image: parsed.image ?? m.image,
                      editedAt: parsed.editedAt ?? Date.now(),
                    }
                  : m
              )
            );
          }

          if (parsed.type === "delete") {
            setMessages((prev) => prev.filter((m) => m.id !== parsed.id));
          }

          if ((parsed as any).type === "typing" && (parsed as any).sender !== username) {
            const sender = (parsed as any).sender ?? null;
            setTypingUser(sender);
            clearTimeout(lastTypingRef.current as unknown as number); // NEW: cancel previous timeout
            lastTypingRef.current = setTimeout(() => setTypingUser(null), 2000) as unknown as number;
          }
        } catch {}
      };

      ws.current.onclose = () => {
        // attempt reconnect after 2s
        reconnectTimer.current = setTimeout(connectWs, 2000);
        setMessages((prev) =>
          prev.map((m) =>
            (m as any).localStatus === "pending" ? { ...m, localStatus: "failed" } : m
          )
        );
      };

      ws.current.onerror = () => {
        ws.current?.close(); // trigger onclose to reconnect
      };
    };

    connectWs();

    // cleanup
    return () => {
      wsAlive = false;
      ws.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [username]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (screenEndRef.current && chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        screenEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    };

    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [messages, loadingMessages]);

  if (!sessionNews[idx]) return <p>Invalid news item.</p>;

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const scheduleFail = (id: string) => {
    clearFailTimer(id);
    pendingTimeouts.current[id] = setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id && (m as any).localStatus === "pending"
            ? { ...m, localStatus: "failed" }
            : m
        )
      );
    }, 8000) as unknown as number;
  };

  const clearFailTimer = (id: string) => {
    const t = pendingTimeouts.current[id];
    if (t) clearTimeout(t);
    delete pendingTimeouts.current[id];
  };

  const removeQueuedMessage = (id: string) => {
    messageQueue.current = messageQueue.current.filter((m) => !(m?.type === "message" && m.id === id));
  };

  const retrySend = (msg: Message & { localStatus?: string }) => {
    if (!msg.id) return;
    const payload = { ...msg, type: "message", localStatus: "pending" };
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, localStatus: "pending" } : m))
    );
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(payload));
      scheduleFail(msg.id);
    } else {
      messageQueue.current.push(payload);
    }
  };

  // ---------- Handle send with queue ----------
  const handleSend = () => {
    if (!newMessage.trim() && !imageFile) return;
    const tempId = crypto.randomUUID();

    const doSend = (imgData?: string | null) => {
      const messageId = editingMessageId ?? tempId;
      const messageToSend: Message & { type: string; localStatus?: string } = {
        type: "message",
        id: messageId,
        sender: username,
        text: newMessage.trim() ? newMessage.trim() : null,
        image: imgData ?? null,
        createdAt: editingMessageId
          ? messages.find((m) => m.id === editingMessageId)?.createdAt || Date.now()
          : Date.now(),
        replyTo: replyTo ?? null,
        localStatus: "pending",
      };

      if (editingMessageId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === editingMessageId ? { ...m, text: messageToSend.text, image: messageToSend.image } : m
          )
        );
        const editPayload = {
          type: "edit",
          id: editingMessageId,
          text: messageToSend.text,
          image: messageToSend.image,
          editedAt: Date.now(),
        };
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify(editPayload));
        } else {
          messageQueue.current.push(editPayload);
        }
        setEditingMessageId(null);
      } else {
        setMessages((prev) => [...prev, messageToSend]);

        // NEW: send or queue if WS not open
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify(messageToSend));
          if (messageToSend.id) scheduleFail(messageToSend.id);
        } else {
          messageQueue.current.push(messageToSend);
        }
      }

      setNewMessage("");
      setImageFile(null);
      if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
      setReplyTo(null);
      setShowMediaMenu(false);
    };

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => doSend(reader.result as string);
      reader.readAsDataURL(imageFile);
    } else doSend(null);
  };

  const onFileSelected = (file?: File | null) => {
    if (!file) return;
    if (previewUrl) try { URL.revokeObjectURL(previewUrl); } catch {}
    setPreviewUrl(URL.createObjectURL(file));
    setImageFile(file);
    setShowMediaMenu(false);
  };

  const openCamera = () => { setShowMediaMenu(false); fileInputCameraRef.current?.click(); };
  const openGallery = () => { setShowMediaMenu(false); fileInputGalleryRef.current?.click(); };

  const shouldRenderMessage = (m: Message) => Boolean((m.text && m.text.trim()) || m.image);
  const extractShortsId = (text?: string | null) => {
    if (!text) return null;
    const shortsMatch = text.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/i);
    if (shortsMatch?.[1]) return shortsMatch[1];
    const shortUrlMatch = text.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/i);
    if (shortUrlMatch?.[1]) return shortUrlMatch[1];
    return null;
  };

  const toShortsEmbed = (id: string) => `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1`;
  const openShorts = (id: string) => {
    setShortsId(id);
    setShowShorts(true);
  };

  // ---------- Typing indicator throttle ----------
  const handleTyping = () => {
    const now = Date.now();
    if (ws.current?.readyState === WebSocket.OPEN && now - lastTypingRef.current > 1500) {
      ws.current.send(JSON.stringify({ type: "typing", sender: username }));
      lastTypingRef.current = now;
    }
  };

  const handleUnlock = async () => {
    if (unlockInput.trim().toLowerCase() === "love") {
      setChatLocked(false);
      setChatVisible(true);
      setUnlockError("");
      setUnlockInput("");
      setTimeout(() => {
        chatContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    } else {
      const text = unlockInput.trim();
      if (!text) {
        setUnlockError("Enter a comment");
        return;
      }
      setUnlockError("");
      await submitComment(text);
      setUnlockInput("");
    }
  };

  useEffect(() => {
    if (replyTo) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      screenEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [replyTo]);

  useEffect(() => {
    if (Number.isNaN(idx)) return;
    const loadComments = async () => {
      setCommentLoading(true);
      setCommentError("");
      try {
        const res = await fetch(`${API_BASE}/comments/${idx}`);
        const data = await res.json();
        setComments(Array.isArray(data) ? data : []);
      } catch (err) {
        setCommentError("Failed to load comments");
      } finally {
        setCommentLoading(false);
      }
    };
    loadComments();
  }, [API_BASE, idx]);

  const submitComment = async (text: string) => {
    try {
      const res = await fetch(`${API_BASE}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: idx, text, username }),
      });
      const saved = await res.json();
      if (!saved?.id) throw new Error("bad_response");
      setComments((prev) => [...prev, saved]);
      return saved;
    } catch (err) {
      setCommentError("Failed to post comment");
      return null;
    }
  };

  return (
    <div className="news-detail">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <img src={getNewsImage(imageSeeds[idx])} alt="news" className="news-detail-image" />
      <h2>{sessionNews[idx].title}</h2>
      <p>{sessionNews[idx].content}</p>
      <div className="detail-actions">
        {!chatVisible && (
          <button
            className="comment-btn comment-icon-only"
            onClick={() => {
              setCommentOpen((s) => !s);
              if (isPrivateChatCard) {
                setChatVisible(true);
                setTimeout(() => {
                  chatContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 0);
              }
            }}
            title={isPrivateChatCard ? "Unlock chat" : "Comment"}
          >
            <svg className="comment-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
            </svg>
          </button>
        )}
      </div>

      {commentOpen && !isPrivateChatCard && (
        <div className="comment-panel">
          <div className="comment-input-row">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => { setCommentText(e.target.value); setCommentError(""); }}
              onKeyDown={async (e) => {
                if (e.key === "Enter" && commentText.trim()) {
                  await submitComment(commentText.trim());
                  setCommentText("");
                }
              }}
            />
            <button
              onClick={async () => {
                if (!commentText.trim()) return;
                await submitComment(commentText.trim());
                setCommentText("");
              }}
            >
              Post
            </button>
          </div>
          {commentError && <div className="comment-error">{commentError}</div>}
          {commentLoading && <div className="comment-loading">Loading comments...</div>}
          {!commentLoading && (
            <div className="comment-list">
              {comments.map((c) => (
                <div key={c.id} className="comment-item">
                  <span className="comment-user">{c.username}:</span>
                  <span className="comment-text">{c.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isPrivateChatCard && (
        <>
          {chatVisible && (
            <div
              ref={chatContainerRef}
              className={`chat-container valentine-chat ${roseTheme ? "rose-chat" : ""}`}
            >
              <button
                className="chat-toggle-btn"
                onClick={() => {
                  setChatVisible(false);
                  setChatLocked(true);
                  setUnlockInput("");
                  setUnlockError("");
                }}
                title="Close chat"
                aria-label="Close chat"
              />
              {chatLocked ? (
                <div className="chat-locked-shell">
                  <div className="chat-lock-overlay">
                    <div className="chat-lock-title">Comment here</div>
                    <div className="chat-lock-input">
                      <input
                        type="password"
                        placeholder="Enter comment..."
                        value={unlockInput}
                        onChange={(e) => { setUnlockInput(e.target.value); setUnlockError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                      />
                      <button onClick={handleUnlock}>Post</button>
                    </div>
                    {unlockError && <div className="chat-lock-error">{unlockError}</div>}
                  </div>
                  <div className="comment-panel">
                    {commentError && <div className="comment-error">{commentError}</div>}
                    {commentLoading && <div className="comment-loading">Loading comments...</div>}
                    {!commentLoading && (
                      <div className="comment-list">
                        {comments.map((c) => (
                          <div key={c.id} className="comment-item">
                            <span className="comment-user">{c.username}:</span>
                            <span className="comment-text">{c.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <button
                    className="chat-theme-toggle"
                    onClick={() => setRoseTheme((prev) => !prev)}
                    title="Toggle Rose Theme"
                    aria-label="Toggle Rose Theme"
                  >
                    🌹
                  </button>
                  {roseTheme && (
                    <div className="rose-petals" aria-hidden="true">
                      <span className="rose-petal p1" />
                      <span className="rose-petal p2" />
                      <span className="rose-petal p3" />
                      <span className="rose-petal p4" />
                      <span className="rose-petal p5" />
                    </div>
                  )}
                  <div className="chat-box">
                    {loadingMessages && <div className="loading-messages">Loading messages...</div>}

                    {messages.map((msg) => {
                      const isMe = msg.sender === username;
                      const senderInitial = msg.sender?.[0]?.toUpperCase() ?? "?";
                      if (!shouldRenderMessage(msg)) return null;
                      const messageShortsId = extractShortsId(msg.text);

                      return (
                        <div key={msg.id} className={`message-group ${isMe ? "me" : msg.sender}`}>
                          {!isMe && (
                            <div className={`avatar message-avatar ${onlineUsers.includes(msg.sender) ? "online" : ""}`}>
                              {senderInitial}
                            </div>
                          )}
                          <div className="message-content-wrapper">
                            <div className="message-content">
                              {msg.replyTo && msg.replyTo.text && (
                                <div className="reply-preview-inside">
                                  <div className="reply-bar" />
                                  <div className="reply-text">{msg.replyTo.text}</div>
                                </div>
                              )}
                              <div
                                className={`message ${isMe ? "me" : msg.sender}`}
                                onDoubleClick={() => {
                                  const likedId = msg.id;
                                  if (!likedId) return;
                                  setLikedMessageIds((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(likedId)) next.delete(likedId);
                                    else next.add(likedId);
                                    return next;
                                  });
                                }}
                                title="Double tap to like"
                              >
                                {msg.text && <div>{msg.text}</div>}
                                {msg.image && (
                                  <img
                                    src={msg.image ?? undefined}
                                    alt="sent"
                                    className="chat-image"
                                    onClick={() => setEnlargedImage(msg.image ?? null)}
                                  />
                                )}
                                {msg.id && likedMessageIds.has(msg.id) && (
                                  <div className="message-like">❤️</div>
                                )}
                                {messageShortsId && (
                                  <button
                                    className="shorts-thumb"
                                    onClick={() => openShorts(messageShortsId)}
                                    title="Play Shorts"
                                  >
                                    <span className="shorts-play">▶</span>
                                    <span>Play Shorts</span>
                                  </button>
                                )}
                              </div>

                              <div className="message-buttons-wrapper">
                                {isMe && (
                                  <div className="left-buttons">
                                    <button
                                      className="edit-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingMessageId(msg.id ?? null);
                                        setNewMessage(msg.text ?? "");
                                        if (msg.image) setPreviewUrl(msg.image);
                                      }}
                                      title="Edit"
                                    >✏️</button>
                                    <button
                                      className="delete-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const deletePayload = { type: "delete", id: msg.id };
                                        setMessages((prev) => prev.filter((m) => m.id !== msg.id));
                                        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                                          ws.current.send(JSON.stringify(deletePayload));
                                        } else {
                                          messageQueue.current.push(deletePayload);
                                        }
                                      }}
                                      title="Delete"
                                    >🚮</button>
                                  </div>
                                )}
                                <div className="right-buttons">
                                  <button
                                    className="reply-btn"
                                    onClick={() => setReplyTo({ id: msg.id, text: msg.text ?? (msg.image ? "Image" : "") })}
                                    title="Reply"
                                  >↩️</button>
                                </div>
                              </div>

                              <div className={`message-time ${isMe ? "time-right" : "time-left"}`}>
                                {formatTime(msg.createdAt)}
                                {"editedAt" in msg && msg.editedAt ? <span className="edited-tag">edited</span> : null}
                                {(msg as any).localStatus === "pending" && (
                                  <span className="message-status">sending...</span>
                                )}
                                {(msg as any).localStatus === "failed" && (
                                  <button
                                    className="message-status failed"
                                    onClick={() => retrySend(msg as any)}
                                    title="Retry"
                                  >
                                    not sent
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {typingUser && <div className="typing-indicator">{typingUser}...</div>}
                    <div ref={chatEndRef} />
                  </div>

                  {replyTo && replyTo.text && (
                    <div className="replying-bar">
                      <div className="replying-text">{replyTo.text}</div>
                      <button className="reply-cancel" onClick={() => setReplyTo(null)} title="Cancel reply">×</button>
                    </div>
                  )}

                  <div className="input-area">
                    <div className="input-box" onClick={() => setShowMediaMenu(false)}>
                      {previewUrl && (
                        <div className="image-preview">
                          <img src={previewUrl} alt="preview" />
                          <button
                            className="remove-preview"
                            onClick={() => { try { URL.revokeObjectURL(previewUrl); } catch {} setImageFile(null); setPreviewUrl(null); }}
                            title="Remove"
                          >×</button>
                        </div>
                      )}
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      />
                      <div className="input-icons">
                        <div
                          className="camera-btn"
                          onClick={(e) => { e.stopPropagation(); setShowMediaMenu((s) => !s); }}
                          title="Choose image"
                        >📸</div>
                        {showMediaMenu && (
                          <div className="media-bubble" onClick={(e) => e.stopPropagation()}>
                            <div className="media-item" onClick={openCamera}>📸 Camera</div>
                            <div className="media-item" onClick={openGallery}>🖼️ Gallery</div>
                          </div>
                        )}
                        <button className="send-btn" onClick={handleSend} title="Send">🚀</button>
                      </div>
                    </div>

                    <input
                      ref={fileInputCameraRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: "none" }}
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) onFileSelected(file); e.currentTarget.value = ""; }}
                    />
                    <input
                      ref={fileInputGalleryRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) onFileSelected(file); e.currentTarget.value = ""; }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
          <div ref={screenEndRef} />
        </>
      )}
      {enlargedImage && (
        <div className="modal" onClick={() => setEnlargedImage(null)}>
          <img src={enlargedImage} alt="enlarged" className="modal-image" />
        </div>
      )}
      {showShorts && shortsId && (
        <div className="modal" onClick={() => setShowShorts(false)}>
          <div className="shorts-modal" onClick={(e) => e.stopPropagation()}>
            <iframe
              className="shorts-embed"
              src={toShortsEmbed(shortsId)}
              title="YouTube Shorts"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default NewsDetail;

