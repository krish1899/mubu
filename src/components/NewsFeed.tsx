import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type NewsFeedProps = {
  sessionNews: any[];
  imageSeeds: number[];
  darkMode: boolean;
  setDarkMode: (v: boolean | ((prev: boolean) => boolean)) => void;
  setAuthenticated: (v: boolean) => void;
  getNewsImage: (seed: number) => string;
};

function NewsFeed({
  sessionNews,
  imageSeeds,
  darkMode,
  setDarkMode,
  setAuthenticated,
  getNewsImage,
}: NewsFeedProps) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
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
            <div>Settings</div>
          </div>
        )}
      </div>

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
