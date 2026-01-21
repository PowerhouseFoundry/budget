// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/globals.css";
import App from "./shell/App";
import Start from "./routes/Start";
import CharacterSelect from "./routes/CharacterSelect";
import Lifestyle from "./routes/Lifestyle";
import Inbox from "./routes/Inbox";
import Month from "./routes/Month";
import Finance from "./routes/Finance";
import "./styles/size-override.css";
import "./styles/month-skin.css";

// ✅ RESET GAME ON REFRESH / TAB CLOSE
// This stops old choices/messages carrying over between runs.
try {
  window.addEventListener("beforeunload", () => {
    localStorage.clear();
    sessionStorage.clear();
  });
} catch (e) {
  // ignore
}

createRoot(document.getElementById("root")).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Start />} />
        <Route path="character" element={<CharacterSelect />} />
        <Route path="lifestyle" element={<Lifestyle />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="month" element={<Month />} />
        <Route path="finance" element={<Finance />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </HashRouter>
);
