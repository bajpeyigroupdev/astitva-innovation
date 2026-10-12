import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register Service Worker for PWA and Mobile Notifications
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("[PWA Service Worker] Registered successfully:", reg.scope);
      })
      .catch((err) => {
        console.warn("[PWA Service Worker] Registration failed:", err);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
