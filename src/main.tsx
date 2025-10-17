import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js")
    .then(() => console.log("✅ Service worker registered"));
}

// Ask once for permission
if ("Notification" in window) {
  Notification.requestPermission();
}
