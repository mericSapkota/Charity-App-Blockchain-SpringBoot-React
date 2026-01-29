// src/components/AdminHeader.jsx

import React from "react";
import { useTheme, ThemeSwitcher } from "../contexts/ThemeContext";
import { FaGlobe, FaSignOutAlt } from "react-icons/fa";

const AdminHeader = () => {
  const { isDark } = useTheme();

  const headerBg = isDark
    ? "bg-red-900 border-b border-red-700 shadow-2xl"
    : "bg-red-700 border-b border-red-600 shadow-xl";
  const brandingColor = "text-white";
  const textColor = "text-white";
  const navTextColor = "text-white hover:text-red-300";

  return (
    <header
      className={`sticky top-0 z-20 transition-colors duration-300 ${headerBg}`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo and Admin Label */}
        <a
          href="/admin/dashboard"
          className="flex items-center space-x-2 cursor-pointer hover:opacity-90"
        >
          <FaGlobe className={`text-3xl ${brandingColor}`} />
          <span className={`text-2xl font-extrabold ${textColor}`}>
            Impact Ledger
          </span>
          <span className="ml-3 px-3 py-1 bg-white text-red-700 text-xs font-bold rounded-full">
            ADMIN
          </span>
        </a>

        {/* Management Links */}
        <div className="flex items-center space-x-6">
          <a href="/admin/dashboard" className={`transition ${navTextColor}`}>
            Dashboard
          </a>
          <a href="/admin/users" className={`transition ${navTextColor}`}>
            Users
          </a>
          <a href="/admin/reports" className={`transition ${navTextColor}`}>
            Reports
          </a>

          <a
            href="/admin/login"
            className="py-2 px-4 rounded-full font-medium bg-red-600 hover:bg-red-500 text-white flex items-center space-x-2"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </a>

          <ThemeSwitcher />
        </div>
      </nav>
    </header>
  );
};

export default AdminHeader;
