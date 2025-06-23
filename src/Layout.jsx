import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import App from "./App";

const Layout = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme(
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.remove(
      "dark",
      "warm",
      "forest",
      "ocean",
      "light-hc",
      "dark-hc"
    );
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "warm") {
      document.documentElement.classList.add("warm");
    } else if (theme === "forest") {
      document.documentElement.classList.add("forest");
    } else if (theme === "ocean") {
      document.documentElement.classList.add("ocean");
    } else if (theme === "light-hc") {
      document.documentElement.classList.add("light-hc");
    } else if (theme === "dark-hc") {
      document.documentElement.classList.add("dark-hc");
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <div className="bg-background">
      <Outlet context={{ theme, toggleTheme, setTheme }} />
    </div>
  );
};

export default Layout;
