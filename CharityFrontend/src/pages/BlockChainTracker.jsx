import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTheme } from "../contexts/ThemeContext";
import { FaSearch, FaKey, FaChartArea } from "react-icons/fa";

const BlockchainTrackerPage = () => {
  const { isDark } = useTheme();
  const [trackingId, setTrackingId] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null); // Placeholder for future API results

  // Component Colors
  const themeClasses = isDark
    ? "bg-zinc-900 text-zinc-100"
    : "bg-white text-zinc-900";
  const primaryHighlight = isDark ? "text-blue-400" : "text-blue-600";
  const lightBg = isDark ? "bg-zinc-800" : "bg-gray-50";
  const darkBg = isDark ? "bg-zinc-950" : "bg-white";
  const btnColor =
    "bg-green-500 hover:bg-green-600 text-white shadow-md transition duration-200";

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real application, you would make an API call here:
    // fetch(`/api/tracker?id=${trackingId}`).then(...)

    setSearchPerformed(true);

    // --- Mock Search Result ---
    if (trackingId.length === 10) {
      setTrackingResult({
        status: "Completed",
        amount: "0.5 ETH",
        project: "Education Fund: Kenya, Q3 2025",
        date: "Oct 25, 2025",
        milestones: [
          {
            name: "Initial Deposit",
            timestamp: "Oct 25, 2025 10:00 UTC",
            status: "Confirmed",
          },
          {
            name: "Partner Wallet Transfer",
            timestamp: "Oct 25, 2025 10:05 UTC",
            status: "Confirmed",
          },
          {
            name: "Funds Converted to Local Currency",
            timestamp: "Oct 26, 2025 09:00 UTC",
            status: "Confirmed",
          },
          {
            name: "School Supplies Delivered",
            timestamp: "Nov 01, 2025 14:30 UTC",
            status: "Confirmed",
          },
        ],
      });
    } else {
      setTrackingResult(null);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${themeClasses} flex flex-col`}
    >
      <Header />

      <main className="flex-grow">
        {/* Tracker Input Section */}
        <section className={`py-16 md:py-24 text-center ${lightBg}`}>
          <div className="max-w-4xl mx-auto px-6">
            <FaKey className={`w-12 h-12 mx-auto mb-4 ${primaryHighlight}`} />
            <h1
              className={`text-4xl md:text-5xl font-extrabold mb-3 ${
                isDark ? "text-white" : "text-zinc-800"
              }`}
            >
              Blockchain Transaction Tracker
            </h1>
            <p
              className={`text-xl mb-8 ${
                isDark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              Enter your unique Transaction ID or Wallet Hash to trace your
              donation on the public ledger.
            </p>

            <form
              onSubmit={handleSearch}
              className="flex justify-center space-x-4"
            >
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Paste Transaction ID (e.g., 8d1f0g3h2i)"
                className={`w-full max-w-lg p-3 border rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500 
                                            ${
                                              isDark
                                                ? "bg-zinc-700 border-zinc-600 text-white"
                                                : "bg-white border-gray-300 text-zinc-800"
                                            }`}
                required
              />
              <button
                type="submit"
                className={`flex items-center space-x-2 p-3 rounded-lg font-semibold ${btnColor}`}
              >
                <FaSearch />
                <span>Track</span>
              </button>
            </form>
          </div>
        </section>

        {/* --- Search Results Display --- */}
        <section className={`py-16 ${darkBg}`}>
          <div className="max-w-6xl mx-auto px-6">
            {searchPerformed && !trackingResult && (
              <div
                className={`p-6 text-center rounded-lg border-l-4 border-red-500 ${
                  isDark ? "bg-zinc-800" : "bg-red-50"
                }`}
              >
                <p className="font-semibold text-lg">
                  No transaction found for "{trackingId}". Please check the ID
                  and try again.
                </p>
              </div>
            )}

            {trackingResult && (
              <TransactionDetails result={trackingResult} isDark={isDark} />
            )}

            {!searchPerformed && (
              <div className="text-center p-12">
                <FaChartArea
                  className={`w-16 h-16 mx-auto mb-4 ${
                    isDark ? "text-zinc-700" : "text-gray-300"
                  }`}
                />
                <p className={isDark ? "text-zinc-400" : "text-zinc-500"}>
                  Your results will appear here after a successful search.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

// Helper component to display detailed results
const TransactionDetails = ({ result, isDark }) => {
  const cardBg = isDark ? "bg-zinc-800" : "bg-white";
  const statusColor =
    result.status === "Completed" ? "text-green-500" : "text-yellow-500";

  return (
    <div className={`p-8 rounded-xl shadow-2xl ${cardBg}`}>
      <h2
        className={`text-3xl font-bold mb-6 ${
          isDark ? "text-white" : "text-zinc-800"
        }`}
      >
        Transaction Traceability Report
      </h2>

      <div className="grid md:grid-cols-2 gap-y-4 gap-x-8 mb-8 pb-6 border-b border-gray-300/50">
        <p className="font-medium">
          Status:{" "}
          <span className={`font-extrabold ${statusColor}`}>
            {result.status}
          </span>
        </p>
        <p className="font-medium">
          Amount: <span className="font-bold">{result.amount}</span>
        </p>
        <p className="font-medium">
          Project: <span className="font-bold">{result.project}</span>
        </p>
        <p className="font-medium">
          Donation Date: <span className="font-bold">{result.date}</span>
        </p>
      </div>

      <h3
        className={`text-2xl font-semibold mb-4 ${
          isDark ? "text-blue-300" : "text-blue-700"
        }`}
      >
        Milestone History (Blockchain Trace)
      </h3>
      <ol className="relative border-l border-gray-400/50 space-y-8 ml-3">
        {result.milestones.map((milestone, index) => (
          <li key={index} className="ml-6">
            <span
              className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ${cardBg} ${
                isDark ? "ring-zinc-950" : "ring-gray-50"
              } bg-green-500 text-white`}
            >
              <FaCheckCircle className="w-3 h-3" />
            </span>
            <h4
              className={`text-lg font-semibold ${
                isDark ? "text-white" : "text-zinc-800"
              }`}
            >
              {milestone.name}
            </h4>
            <time
              className={`block mb-2 text-sm font-normal leading-none ${
                isDark ? "text-zinc-400" : "text-gray-500"
              }`}
            >
              {milestone.timestamp}
            </time>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default BlockchainTrackerPage;
