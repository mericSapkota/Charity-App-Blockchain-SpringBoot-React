import React, { useState } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import { useTheme } from "../contexts/ThemeContext";
import {
  FaWrench,
  FaSlidersH,
  FaGasPump,
  FaProjectDiagram,
} from "react-icons/fa";

const initialSettings = {
  gasLimitMultiplier: 1.1,
  minTransactionValue: 10, // USD equivalent
  currentProjectTokenAddress: "0xabc123...45def",
  networkStatus: "Mainnet - Polygon Layer",
};

const AdminNetworkConfigPage = () => {
  const { isDark } = useTheme();
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  const themeClasses = isDark
    ? "bg-zinc-900 text-zinc-100"
    : "bg-gray-50 text-zinc-900";
  const cardBg = isDark ? "bg-zinc-800" : "bg-white";
  const inputStyle = isDark
    ? "bg-zinc-700 border-zinc-600 text-white"
    : "bg-white border-gray-300 text-zinc-800";
  const highlightColor = "text-red-500";
  const primaryBtn =
    "bg-green-600 hover:bg-green-700 text-white font-bold transition duration-200";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    console.log("Saving new contract configurations:", settings);

    // --- API CALL: Send highly privileged API call to backend service ---
    setTimeout(() => {
      setIsSaving(false);
      alert(
        "Smart Contract configurations updated successfully (Backend call simulation)."
      );
    }, 1500);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${themeClasses} flex flex-col`}
    >
      <AdminHeader />

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1
            className={`text-4xl font-extrabold mb-6 ${highlightColor} flex items-center space-x-3`}
          >
            <FaWrench className="w-8 h-8" />
            <span>Smart Contract Configuration</span>
          </h1>

          <p className={`mb-8 text-lg p-3 border-l-4 border-red-500 ${cardBg}`}>
            **WARNING:** Changes here directly impact the network and fund flow.
            Proceed with caution and verification.
          </p>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: Gas & Network Settings */}
            <div
              className={`p-6 rounded-xl shadow-lg ${cardBg} lg:col-span-2 space-y-6`}
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                <FaGasPump className="text-yellow-500" />
                <span>Network & Gas Management</span>
              </h2>

              {/* Gas Limit Multiplier */}
              <div>
                <label
                  htmlFor="gasLimitMultiplier"
                  className="block text-sm font-medium mb-1"
                >
                  Gas Limit Multiplier (Safeguard)
                </label>
                <input
                  id="gasLimitMultiplier"
                  type="number"
                  step="0.01"
                  name="gasLimitMultiplier"
                  value={settings.gasLimitMultiplier}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg ${inputStyle} focus:ring-red-500 focus:border-red-500`}
                />
                <p
                  className={`text-xs mt-1 ${
                    isDark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  Recommended range: 1.05 - 1.20
                </p>
              </div>

              {/* Minimum Transaction Value */}
              <div>
                <label
                  htmlFor="minTransactionValue"
                  className="block text-sm font-medium mb-1"
                >
                  Minimum Donation Value (USD)
                </label>
                <input
                  id="minTransactionValue"
                  type="number"
                  step="1"
                  name="minTransactionValue"
                  value={settings.minTransactionValue}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg ${inputStyle} focus:ring-red-500 focus:border-red-500`}
                />
                <p
                  className={`text-xs mt-1 ${
                    isDark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  Prevents network spam from micro-transactions.
                </p>
              </div>

              {/* Current Network Status (Read-only for security) */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Active Blockchain Network
                </label>
                <div className={`w-full p-3 rounded-lg ${inputStyle}`}>
                  <p className="font-semibold text-green-500">
                    {settings.networkStatus}
                  </p>
                </div>
                <p
                  className={`text-xs mt-1 ${
                    isDark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  Cannot be changed via this interface.
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: Action and Token Details */}
            <div className="lg:col-span-1 space-y-6">
              <div className={`p-6 rounded-xl shadow-lg ${cardBg}`}>
                <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                  <FaProjectDiagram className="text-blue-500" />
                  <span>Token Contract Address</span>
                </h3>
                <p
                  className={`break-words font-mono text-sm p-3 rounded-lg ${inputStyle}`}
                >
                  {settings.currentProjectTokenAddress}
                </p>
                <p
                  className={`text-xs mt-1 italic ${
                    isDark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  This token is immutable and verified.
                </p>
              </div>

              <div
                className={`p-6 rounded-xl shadow-lg ${cardBg} border border-red-500`}
              >
                <p className="text-sm italic mb-4">
                  A successful update requires 2-factor authentication from the
                  Lead Auditor.
                </p>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`w-full py-3 rounded-lg ${primaryBtn}`}
                >
                  {isSaving
                    ? "Applying Changes..."
                    : "Save & Deploy Configuration"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <AdminFooter />
    </div>
  );
};

export default AdminNetworkConfigPage;
