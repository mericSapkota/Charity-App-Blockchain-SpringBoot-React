// src/components/AdminFooter.jsx

import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const AdminFooter = () => {
  const { isDark } = useTheme();

  // Hardcoded styles for the Admin environment
  const footerBg = isDark
    ? "bg-red-900 border-t border-red-700"
    : "bg-red-700 border-t border-red-600";
  const linkColor = isDark
    ? "text-red-300 hover:text-white"
    : "text-red-200 hover:text-white";
  const highlightColor = isDark ? "text-red-300" : "text-white";
  const copyrightColor = isDark ? "text-red-400" : "text-red-200";

  return (
    <footer
      className={`py-8 mt-auto transition-colors duration-300 ${footerBg}`}
    >
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className={`font-extrabold text-xl mb-3 ${highlightColor}`}>
          ADMIN CONSOLE: RESTRICTED ACCESS
        </p>
        <div className="flex justify-center space-x-6 text-sm mb-4">
          <a href="/admin/settings" className={`transition ${linkColor}`}>
            Settings
          </a>
          <a href="/admin/audit-log" className={`transition ${linkColor}`}>
            Audit Log
          </a>
          <a href="/logout" className={`transition ${linkColor}`}>
            Logout
          </a>
        </div>

        <p className={`mt-4 ${copyrightColor} text-xs`}>
          &copy; {new Date().getFullYear()} Impact Ledger. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default AdminFooter;
