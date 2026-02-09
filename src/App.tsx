import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import NewsFeed from "./components/NewsFeed";
import NewsDetail from "./components/NewsDetail";
import Login from "./components/Login";
import { NEWS_DATA, PASSWORDS, getNewsImage } from "./data/newsData";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState<"default" | "cartoon" | "emoji" | "fun">("default");

  const [sessionNews, setSessionNews] = useState<typeof NEWS_DATA>([]);
  const [imageSeeds, setImageSeeds] = useState<number[]>([]);

  useEffect(() => {
    if (!authenticated) return;
    const shuffled = [...NEWS_DATA].sort(() => 0.5 - Math.random());
    const newsCount = Math.min(NEWS_DATA.length, 10);
    setSessionNews(shuffled.slice(0, newsCount));
    setImageSeeds(Array.from({ length: newsCount }, () => Math.floor(Math.random() * 1000)));
  }, [authenticated]);

  const handleLogin = () => {
    if (PASSWORDS[password]) {
      setUsername(PASSWORDS[password]);
      setAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  if (!authenticated) {
    return (
      <Login
        password={password}
        error={error}
        setPassword={setPassword}
        handleLogin={handleLogin}
      />
    );
  }

  return (
    <Router>
      <div className={`app ${darkMode ? "dark-mode" : ""} theme-${theme}`}>
        <Routes>
          <Route path="/news" element={<Navigate to="/" replace />} />
          <Route
            path="/"
            element={
              <NewsFeed
                sessionNews={sessionNews}
                imageSeeds={imageSeeds}
                setAuthenticated={setAuthenticated}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                theme={theme}
                setTheme={setTheme}
                getNewsImage={getNewsImage}
              />
            }
          />
          <Route
            path="/news/:id"
            element={
              <NewsDetail
                sessionNews={sessionNews}
                imageSeeds={imageSeeds}
                username={username}
                getNewsImage={getNewsImage}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;




