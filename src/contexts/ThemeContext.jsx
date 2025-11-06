// src/contexts/ThemeContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
// You will need to install react-icons/lu if you haven't already: npm install react-icons
import { LuSun, LuMoon } from "react-icons/lu";

// 1. Create the Context
const ThemeContext = createContext();

// Hook to consume the theme context easily
export const useTheme = () => useContext(ThemeContext);

// 2. Create the Provider Component
export const ThemeProvider = ({ children }) => {
  // Initialize state from local storage or default to 'light'
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const isDark = theme === "dark";

  // Effect to update local storage and the <html> tag class for Tailwind
  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, isDark]);

  const value = useMemo(() => ({ theme, setTheme, isDark }), [theme, isDark]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// 3. Create the Theme Switcher Component
export const ThemeSwitcher = () => {
  const { isDark, setTheme } = useTheme();

  return (
    <div
      className={`${
        isDark ? "bg-zinc-700" : "bg-zinc-100"
      } p-2 rounded-xl flex gap-3`}
    >
      <button
        onClick={() => setTheme("light")}
        className={`p-3 rounded-lg transition-colors duration-300 ${
          isDark ? "hover:bg-zinc-600" : "hover:bg-zinc-200"
        } ${!isDark ? "bg-zinc-200" : ""}`}
        aria-label="Switch to Light Mode"
      >
        <LuSun className="w-5 h-5" />
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={`p-3 rounded-lg transition-colors duration-300 ${
          isDark ? "hover:bg-zinc-600 bg-zinc-600" : "hover:bg-zinc-200"
        }`}
        aria-label="Switch to Dark Mode"
      >
        <LuMoon className="w-5 h-5" />
      </button>
    </div>
  );
};
