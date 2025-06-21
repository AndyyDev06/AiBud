import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router basename="/AiBud/">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<App />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
