import React, { useState } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import { useTheme } from "../contexts/ThemeContext";
import {
  FaSearch,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClipboardList,
  FaFileExport,
  FaLockOpen,
} from "react-icons/fa";

const AdminLedgerAuditPage = () => {
  const { isDark } = useTheme();
  const [auditId, setAuditId] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [mockResult, setMockResult] = useState(null);

  const themeClasses = isDark
    ? "bg-zinc-900 text-zinc-100"
    : "bg-gray-50 text-zinc-900";
  const cardBg = isDark ? "bg-zinc-800" : "bg-white";
  const inputStyle = isDark
    ? "bg-zinc-700 border-zinc-600 text-white"
    : "bg-white border-gray-300 text-zinc-800";
  const highlightColor = "text-red-500";

  const ledgerStatus = {
    blocks: "142,500",
    chainHealth: "100% (Nominal)",
    lastBlockTime: "15 seconds ago",
    unverifiedMilestones: 7,
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchPerformed(true);

    // --- Mock Audit Result ---
    if (auditId.length === 12) {
      setMockResult({
        blockHash: "0x1c8b...d0a3",
        timestamp: "Nov 17, 2025 10:15 UTC",
        transactions: 12,
        status: "Immutable",
        integrityCheck: true,
        associatedProject: "Education Access Q4",
      });
    } else {
      setMockResult(null);
    }
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
            <FaClipboardList className="w-8 h-8" />
            <span>Blockchain Ledger Audit</span>
          </h1>

          {/* 1. Network Health Status */}
          <div className={`p-6 mb-8 rounded-xl shadow-lg ${cardBg}`}>
            <h2 className="text-2xl font-bold mb-4">Network Health Overview</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {Object.entries(ledgerStatus).map(([key, value]) => (
                <div
                  key={key}
                  className={`p-4 rounded-lg ${
                    isDark ? "bg-zinc-700" : "bg-gray-100"
                  }`}
                >
                  <p
                    className={`text-xs uppercase font-medium ${
                      isDark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      key === "chainHealth" && value.includes("Nominal")
                        ? "text-green-500"
                        : ""
                    }`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Block/Transaction Search Tool */}
          <div className={`p-6 mb-8 rounded-xl shadow-lg ${cardBg}`}>
            <h2 className="text-2xl font-bold mb-4">
              Verify Single Block/Transaction Integrity
            </h2>

            <form onSubmit={handleSearch} className="flex space-x-4">
              <input
                type="text"
                value={auditId}
                onChange={(e) => setAuditId(e.target.value)}
                placeholder="Enter Block Hash or Transaction Hash..."
                className={`w-full max-w-2xl p-3 rounded-lg ${inputStyle} focus:ring-red-500 focus:border-red-500`}
                required
              />
              <button
                type="submit"
                className="py-3 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center space-x-2 transition"
              >
                <FaSearch />
                <span>Run Audit Check</span>
              </button>
            </form>

            {/* Search Results Display */}
            {searchPerformed && (
              <div className="mt-6 p-4 border rounded-lg">
                {mockResult ? (
                  <div
                    className={`flex items-center justify-between ${
                      isDark ? "text-white" : "text-zinc-800"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-lg flex items-center space-x-2">
                        <FaCheckCircle className="text-green-500" />
                        <span>Integrity Check: {mockResult.status}</span>
                      </p>
                      <p className="text-sm">
                        Block Hash:{" "}
                        <span className="font-mono">
                          {mockResult.blockHash}
                        </span>
                      </p>
                      <p className="text-sm">
                        Timestamp: {mockResult.timestamp}
                      </p>
                      <p className="text-sm">
                        Transactions in Block: {mockResult.transactions}
                      </p>
                    </div>
                    <button
                      className={`py-2 px-4 rounded-full ${
                        isDark
                          ? "bg-zinc-700 hover:bg-zinc-600"
                          : "bg-gray-100 hover:bg-gray-200"
                      } text-sm font-semibold`}
                    >
                      View Raw Data
                    </button>
                  </div>
                ) : (
                  <p className="text-red-500 font-semibold">
                    <FaTimesCircle className="inline mr-2" />
                    Hash not found or failed integrity check. Please check the
                    ID.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 3. Export & Compliance Actions */}
          <div
            className={`p-6 rounded-xl shadow-lg ${cardBg} flex justify-between items-center`}
          >
            <div>
              <h2 className="text-2xl font-bold mb-1">Compliance Export</h2>
              <p
                className={`text-sm ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Generate immutable report for external auditors.
              </p>
            </div>
            <button className="py-2 px-6 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center space-x-2">
              <FaFileExport />
              <span>Export Full Ledger (CSV)</span>
            </button>
          </div>
        </div>
      </main>

      <AdminFooter />
    </div>
  );
};

export default AdminLedgerAuditPage;
