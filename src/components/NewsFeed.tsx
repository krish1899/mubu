import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type NewsFeedProps = {
  sessionNews: any[];
  imageSeeds: number[];
  darkMode: boolean;
  setDarkMode: (v: boolean | ((prev: boolean) => boolean)) => void;
  setAuthenticated: (v: boolean) => void;
  theme: "default" | "cartoon" | "emoji" | "fun";
  setTheme: (v: "default" | "cartoon" | "emoji" | "fun") => void;
  getNewsImage: (seed: number) => string;
};

function NewsFeed({
  sessionNews,
  imageSeeds,
  darkMode,
  setDarkMode,
  setAuthenticated,
  theme,
  setTheme,
  getNewsImage,
}: NewsFeedProps) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <>
      <div className="news-top-bar">
        Top News
        <span className="menu-icon" onClick={() => setShowMenu((s) => !s)}>☰</span>
        {showMenu && (
          <div className="menu-dropdown" ref={menuRef}>
            <div onClick={() => { setAuthenticated(false); setShowMenu(false); }}>Logout</div>
            <div onClick={() => setDarkMode((prev: boolean) => !prev)}>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </div>
            <div>Profile</div>
            <div onClick={() => { setShowSettings(true); setShowMenu(false); }}>Settings</div>
          </div>
        )}
      </div>

      {showSettings && (
        <div className="modal" onClick={() => setShowSettings(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h3>Settings</h3>
              <button className="settings-close" onClick={() => setShowSettings(false)} title="Close">×</button>
            </div>
            <div className="settings-section">
              <div className="settings-title">Themes</div>
              <div className="settings-theme-grid">
                <button
                  className={`settings-theme-btn ${theme === "default" ? "active" : ""}`}
                  onClick={() => setTheme("default")}
                >
                  Classic
                </button>
                <button
                  className={`settings-theme-btn ${theme === "cartoon" ? "active" : ""}`}
                  onClick={() => setTheme("cartoon")}
                >
                  Cartoon
                </button>
                <button
                  className={`settings-theme-btn ${theme === "emoji" ? "active" : ""}`}
                  onClick={() => setTheme("emoji")}
                >
                  Emoji
                </button>
                <button
                  className={`settings-theme-btn ${theme === "fun" ? "active" : ""}`}
                  onClick={() => setTheme("fun")}
                >
                  Fun
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="news-feed">
        {sessionNews.map((card: any, idx: number) => (
          <div key={idx} className="news-card" onClick={() => navigate(`/news/${idx}`)}>
            <img src={getNewsImage(imageSeeds[idx])} alt="news" className="news-image" />
            <h3>{card.title}</h3>
            <p>{card.snippet}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default NewsFeed;
