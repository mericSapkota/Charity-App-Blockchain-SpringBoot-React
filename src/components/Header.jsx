import React from "react";
import { useTheme, ThemeSwitcher } from "../contexts/ThemeContext";
import { FaGlobe, FaQrcode } from "react-icons/fa";

const Header = () => {
  const { isDark } = useTheme(); // --- ENHANCED COLOR DEFINITIONS ---

  const primaryText = isDark ? "text-blue-400" : "text-blue-600"; // Stronger shadow for the Donate button
  const secondaryBtn =
    "bg-green-600 hover:bg-green-500 text-white shadow-md hover:shadow-lg transition duration-200"; // Higher Z-index and cleaner shadow for the header itself

  const headerClasses = `sticky top-0 z-20 shadow-xl transition-colors duration-300 ${
    isDark
      ? "bg-zinc-800 border-b border-zinc-700"
      : "bg-white border-b border-gray-200"
  }`;
  const navTextColor = isDark
    ? "text-zinc-200 hover:text-blue-400"
    : "text-zinc-700 hover:text-blue-600"; // --- END ENHANCED COLOR DEFINITIONS ---
  return (
    <header className={headerClasses}>
           {" "}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                {/* 🌎 Logo/Brand Name */}       {" "}
        <div className="flex items-center space-x-2">
                    <FaGlobe className={`text-3xl ${primaryText}`} />         {" "}
          <span
            className={`text-2xl font-extrabold ${
              isDark ? "text-white" : "text-zinc-800"
            }`}
          >
                        Impact Ledger          {" "}
          </span>
                 {" "}
        </div>
                {/* 🔗 Navigation Links (Desktop) */}       {" "}
        <div className="hidden md:flex space-x-6 items-center">
                   {" "}
          <a href="#mission" className={`transition ${navTextColor}`}>
            Mission
          </a>
                   {" "}
          <a href="#how-it-works" className={`transition ${navTextColor}`}>
            How it Works
          </a>
                    {/* Highlight the Blockchain Tracker link */}         {" "}
          <a
            href="#blockchain"
            className={`font-semibold ${primaryText} transition`}
          >
            Blockchain Tracker
          </a>
                   {" "}
          <button
            className={`py-2 px-4 rounded-full font-medium ${secondaryBtn}`}
          >
                        Donate          {" "}
          </button>
                 {" "}
        </div>
                {/* 🌙 Theme Switcher & Mobile Menu */}       {" "}
        <div className="flex items-center space-x-4">
                    <ThemeSwitcher />         {" "}
          <button
            className={`md:hidden p-2 rounded-md transition ${
              isDark ? "hover:bg-zinc-700" : "hover:bg-zinc-200"
            }`}
            aria-label="Toggle menu"
          >
                        <FaQrcode className={`w-6 h-6 ${navTextColor}`} />     
               {" "}
          </button>
                 {" "}
        </div>
             {" "}
      </nav>
         {" "}
    </header>
  );
};

export default Header;
