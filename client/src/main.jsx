import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { WebSocketProvider } from "./context/WebSocketContext";

// Import Material Icons font
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined";
document.head.appendChild(link);

createRoot(document.getElementById("root")!).render(
  <WebSocketProvider>
    <App />
  </WebSocketProvider>
);
