import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { FaUser, FaLock } from "react-icons/fa";
const AdminLoginPage = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- Component Styling Variables ---
  const themeClasses = isDark
    ? "bg-zinc-900 text-zinc-100"
    : "bg-white text-zinc-900";
  const cardBg = isDark ? "bg-zinc-800" : "bg-white";

  // Admin-specific button style (Red/Danger color)
  const buttonStyle =
    "bg-red-600 hover:bg-red-700 text-white font-bold shadow-md transition duration-200";

  // Input fields use the standard login style
  const inputStyle = isDark
    ? "bg-zinc-700 border-zinc-600 text-white"
    : "bg-white border-gray-300 text-zinc-800";
  // --- End Component Styling Variables ---

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Admin Login Attempt:", { email, password });

    // --- ADMIN AUTHENTICATION LOGIC GOES HERE ---
    // 1. API Call to backend /api/login/admin
    // 2. Server verifies credentials AND confirms role is 'admin'
    // 3. Receive secure JWT Token
    // 4. Redirect to /admin/dashboard

    // Example: if successful, clear form
    setEmail("");
    setPassword("");
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${themeClasses} flex flex-col`}
    >
      <main className="flex-grow flex items-center justify-center py-16">
        <div
          className={`max-w-md w-full p-8 rounded-xl shadow-2xl ${cardBg} border ${
            isDark ? "border-zinc-700" : "border-gray-200"
          }`}
        >
          {/* Admin Icon (Red Lock) */}
          <FaLock className="w-10 h-10 mx-auto mb-4 text-red-600" />

          <h2 className="text-3xl font-bold text-center mb-6 text-red-600">
            Admin Panel Access
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <FaUser className="w-5 h-5 ml-3 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-3 focus:outline-none focus:ring-red-500 focus:border-red-500 ${inputStyle} border-0`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <FaLock className="w-5 h-5 ml-3 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full p-3 focus:outline-none focus:ring-red-500 focus:border-red-500 ${inputStyle} border-0`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-lg ${buttonStyle}`}
            >
              Admin Login
            </button>
          </form>

          {/* Subtle link back to Donor Login (for user convenience) */}
          <p className="mt-6 text-center text-sm">
            <a
              href="/login"
              className={`font-semibold ${
                isDark ? "text-blue-400" : "text-blue-600"
              } hover:underline`}
            >
              Return to Donor Login
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminLoginPage;
