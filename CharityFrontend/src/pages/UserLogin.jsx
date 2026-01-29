import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTheme } from "../contexts/ThemeContext";
import { FaSignInAlt, FaUser, FaLock } from "react-icons/fa";

const UserLoginPage = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const themeClasses = isDark
    ? "bg-zinc-900 text-zinc-100"
    : "bg-white text-zinc-900";
  const cardBg = isDark ? "bg-zinc-800" : "bg-white";
  const inputStyle = isDark
    ? "bg-zinc-700 border-zinc-600 text-white"
    : "bg-white border-gray-300 text-zinc-800";
  const buttonStyle =
    "bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition duration-200";

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("User Login Attempt:", { email, password }); // --- AUTHENTICATION LOGIC GOES HERE --- // 1. API Call to backend /api/login/user // 2. Receive JWT Token // 3. Store Token (localStorage/Context) // 4. Redirect to User Dashboard
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${themeClasses} flex flex-col`}
    >
           {" "}
      <main className="flex-grow flex items-center justify-center py-16">
               {" "}
        <div
          className={`max-w-md w-full p-8 rounded-xl shadow-2xl ${cardBg} border ${
            isDark ? "border-zinc-700" : "border-gray-200"
          }`}
        >
                   {" "}
          <FaSignInAlt
            className={`w-10 h-10 mx-auto mb-4 ${
              isDark ? "text-blue-400" : "text-blue-600"
            }`}
          />
                   {" "}
          <h2 className="text-3xl font-bold text-center mb-6">Donor Login</h2> 
                 {" "}
          <form onSubmit={handleSubmit} className="space-y-6">
                       {" "}
            <div>
                           {" "}
              <label className="block text-sm font-medium mb-1">Email</label>   
                       {" "}
              <div className="flex items-center border rounded-lg overflow-hidden">
                               {" "}
                <FaUser className="w-5 h-5 ml-3 text-gray-400" />               {" "}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-3 focus:outline-none ${inputStyle} border-0`}
                  required
                />
                             {" "}
              </div>
                         {" "}
            </div>
                       {" "}
            <div>
                           {" "}
              <label className="block text-sm font-medium mb-1">Password</label>
                           {" "}
              <div className="flex items-center border rounded-lg overflow-hidden">
                               {" "}
                <FaLock className="w-5 h-5 ml-3 text-gray-400" />               {" "}
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full p-3 focus:outline-none ${inputStyle} border-0`}
                  required
                />
                             {" "}
              </div>
                         {" "}
            </div>
                       {" "}
            <button
              type="submit"
              className={`w-full py-3 rounded-lg ${buttonStyle}`}
            >
                            Login            {" "}
            </button>
                     {" "}
          </form>
                   {" "}
          <p className="mt-6 text-center text-sm">
                        Don't have an account?            {" "}
            <a
              href="/register"
              className={`font-semibold ${
                isDark ? "text-blue-400" : "text-blue-600"
              } hover:underline`}
            >
                            Register Here            {" "}
            </a>
                     {" "}
          </p>
          {/* --- NEW: SUBTLE ADMIN ACCESS LINK --- */}
          <p className="mt-2 pt-2 border-t border-gray-300/50 text-center text-xs">
            <a
              href="/admin/login"
              className={`underline hover:no-underline transition duration-150 ${
                isDark
                  ? "text-zinc-500 hover:text-red-400"
                  : "text-zinc-400 hover:text-red-600"
              }`}
            >
              Admin Access
            </a>
          </p>
          {/* --- END NEW LINK --- */}       {" "}
        </div>
             {" "}
      </main>
            {" "}
    </div>
  );
};

export default UserLoginPage;
