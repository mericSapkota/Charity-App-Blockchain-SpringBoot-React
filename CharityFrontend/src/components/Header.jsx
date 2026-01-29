import React, { useState } from "react";
import { useTheme, ThemeSwitcher } from "../contexts/ThemeContext";
import { FaBars, FaClock, FaDoorClosed, FaGlobe, FaQrcode, FaSignOutAlt } from "react-icons/fa";
import { useWallet } from "../contexts/WalletContext";
import { FaClockRotateLeft } from "react-icons/fa6";

const Header = () => {
  const { isDark } = useTheme(); // --- ENHANCED COLOR DEFINITIONS ---
  const { connectWallet, account, isOwner, disconnectWallet } = useWallet();
  const primaryText = isDark ? "text-blue-400" : "text-blue-600"; // Ensure donate button styling is bold and clear
  const secondaryBtn = "bg-green-600 hover:bg-green-500 text-white shadow-md hover:shadow-lg transition duration-200";
  const [showOptions, setShowOptions] = useState(false);

  const headerClasses = `sticky top-0 z-20 shadow-xl transition-colors duration-300 ${
    isDark ? "bg-zinc-800 border-b border-zinc-700" : "bg-white border-b border-gray-200"
  }`;
  const navTextColor = isDark ? "text-zinc-200 hover:text-blue-400" : "text-zinc-700 hover:text-blue-600"; // Style for the discrete Sign In link
  const signInStyle = isDark
    ? "bg-blue-700 text-zinc-200 hover:bg-zinc-700"
    : "border border-blue-700 text-zinc-700 hover:bg-gray-100"; // --- END ENHANCED COLOR DEFINITIONS ---

  return (
    <header className={headerClasses}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* 🌎 Logo/Brand Name (Now a clickable link) */}
        <a
          href="/" // <-- CRITICAL CHANGE: Sets the link destination to the home page
          className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition" // Added hover effect
        >
          <FaGlobe className={`text-3xl ${primaryText}`} />
          <span className={`text-2xl font-extrabold ${isDark ? "text-white" : "text-zinc-800"}`}>Impact Ledger</span>
        </a>
        {/* <-- CLOSING ANCHOR TAG */} {/* 🔗 Navigation Links (Desktop) */}
        <div className="hidden md:flex space-x-6 items-center">
          <a href="/mission" className={`transition ${navTextColor}`}>
            Mission
          </a>
          <a href="/how-it-works" className={`transition ${navTextColor}`}>
            How it Works
          </a>
          <a
            href="/blockchain-tracker" // Use a clear route path for the tracker page
            className={`font-semibold ${primaryText} transition`}
          >
            Blockchain Tracker
          </a>
          <a className={`transition ${navTextColor}`} href="/register-charity">
            Register for Charity
          </a>
        </div>
        {/* 🌙 Utility & Action Buttons (Sign In, Donate, Theme Switcher) */}
        <div className="flex items-center relative space-x-4">
          {/* NEW: Sign In Button (Discrete link) */}
          <a
            onClick={() => {
              if (!account) {
                connectWallet();
              } else {
                setShowOptions((prev) => !prev);
              }
            }}
            className={`py-2 px-4 rounded-full cursor-pointer font-medium transition duration-200 ${signInStyle}`}
          >
            {`${account ? "" : "Connect Wallet"}`}

            {account && (
              <span className={`font-mono ${primaryText} text-xs `}>
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            )}
          </a>
          {account && showOptions && (
            <div className="absolute  top-16 w-40 rounded-xl  bg-white shadow-lg border border-gray-200 z-50">
              <button
                className="w-full text-left cursor-pointer px-4 py-2 hover:bg-gray-100 rounded-t-xl"
                onClick={() => {
                  // navigate to history page
                  console.log("History clicked");
                  setShowOptions(false);
                }}
              >
                <FaClockRotateLeft className="inline mr-2" /> History
              </button>

              <button
                className="w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-b-xl text-red-600"
                onClick={() => {
                  disconnectWallet();
                  setShowOptions(false);
                }}
              >
                <FaSignOutAlt className="inline mr-2" /> Disconnect
              </button>
            </div>
          )}
          {/* Donate Button (Primary CTA) - Changed to <a> for routing */}
          <a
            href="/donation" // Route to the DonatePage
            className={`py-2 px-4 rounded-full font-medium ${secondaryBtn}`}
          >
            Donate
          </a>
          <ThemeSwitcher /> {/* Mobile Menu Icon */}
          <button
            className={`md:hidden p-2 rounded-md transition ${isDark ? "hover:bg-zinc-700" : "hover:bg-zinc-200"}`}
            aria-label="Toggle menu"
          >
            <FaBars className={`w-6 h-6 ${navTextColor}`} />
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
