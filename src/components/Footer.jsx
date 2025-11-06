// src/components/Footer.jsx - IMPROVED VERSION

import React from "react";
import { useTheme } from "../contexts/ThemeContext";
// Using FaTwitter, FaLinkedin for social icons (ensure react-icons/fa is installed)
import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

const Footer = () => {
  const { isDark } = useTheme();

  // Conditional classes for background and text based on theme state
  const footerBg = isDark
    ? "bg-zinc-900 shadow-inner"
    : "bg-gray-100 shadow-inner";

  // Links are slightly darker in light mode for better contrast
  const linkColor = isDark
    ? "text-zinc-400 hover:text-white"
    : "text-zinc-600 hover:text-blue-600";

  const blockchainHighlightColor = isDark ? "text-blue-400" : "text-blue-700";
  const copyrightColor = isDark ? "text-zinc-500" : "text-zinc-400";

  return (
    <footer
      className={`py-12 mt-auto transition-colors duration-300 ${footerBg}`}
    >
           {" "}
      <div className="max-w-7xl mx-auto px-6 text-center">
                {/* 1. Blockchain Feature Emphasis (Stronger Heading) */}       {" "}
        <h3
          className={`font-extrabold text-xl mb-6 ${blockchainHighlightColor}`}
        >
                    BLOCKCHAIN POWERED TRANSPARENCY        {" "}
        </h3>
                {/* 2. Social Media Links */}       {" "}
        <div className="flex justify-center space-x-8 mb-6">
                    {/* Added hover scale effect */}         {" "}
          <a
            href="#"
            className={`text-2xl transition hover:scale-110 ${linkColor}`}
            aria-label="Twitter"
          >
            <FaTwitter />
          </a>
                   {" "}
          <a
            href="#"
            className={`text-2xl transition hover:scale-110 ${linkColor}`}
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
                   {" "}
          <a
            href="#"
            className={`text-2xl transition hover:scale-110 ${linkColor}`}
            aria-label="GitHub"
          >
            <FaGithub />
          </a>
                 {" "}
        </div>
                {/* 3. Main Navigation Links (Structured with gaps) */}       {" "}
        <div
          className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-sm mb-6 pb-6 border-b border-solid"
          style={{ borderColor: isDark ? "#3f3f46" : "#d4d4d8" }}
        >
                   {" "}
          <a
            href="/faq"
            className={`whitespace-nowrap transition ${linkColor}`}
          >
            FAQ & Technical Details
          </a>
                   {" "}
          <a
            href="/privacy"
            className={`whitespace-nowrap transition ${linkColor}`}
          >
            Privacy Policy
          </a>
                   {" "}
          <a
            href="/terms"
            className={`whitespace-nowrap transition ${linkColor}`}
          >
            Terms of Service
          </a>
                   {" "}
          <a
            href="/contact"
            className={`whitespace-nowrap transition ${linkColor}`}
          >
            Contact Us
          </a>
                 {" "}
        </div>
                {/* 4. Copyright */}       {" "}
        <p className={`mt-4 ${copyrightColor} text-xs`}>
                    &copy; {new Date().getFullYear()} Impact Ledger. All rights
          reserved.        {" "}
        </p>
               {" "}
        <p className={`mt-1 ${copyrightColor} text-xs`}>
                    Built with React & Tailwind CSS.        {" "}
        </p>
             {" "}
      </div>
         {" "}
    </footer>
  );
};

export default Footer;
