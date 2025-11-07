import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTheme } from "../contexts/ThemeContext";
import { FaRocket, FaExchangeAlt, FaLock, FaChartBar } from "react-icons/fa";

const HowItWorksPage = () => {
  const { isDark } = useTheme();

  // Component Colors
  const themeClasses = isDark
    ? "bg-zinc-900 text-zinc-100"
    : "bg-white text-zinc-900";
  const primaryHighlight = isDark ? "text-blue-400" : "text-blue-600";
  const lightBg = isDark ? "bg-zinc-800" : "bg-gray-50";
  const darkBg = isDark ? "bg-zinc-950" : "bg-white";
  const stepColor = isDark ? "text-green-400" : "text-green-600";

  const steps = [
    {
      icon: FaRocket,
      title: "Step 1: Donation & Tokenization",
      description:
        "You choose a project and donate via traditional means (credit card) or crypto. Your funds are instantly converted into a traceable digital asset (token) on our secure layer.",
      detail:
        "This initial transaction is time-stamped and recorded on our ledger, generating a unique **Transaction ID** for tracking.",
    },
    {
      icon: FaExchangeAlt,
      title: "Step 2: Immutable Ledger Entry",
      description:
        "The digital asset is immediately added to a new block on our blockchain. This block is cryptographically linked to the previous one, making the transaction permanent and unalterable.",
      detail:
        "The transaction is fully decentralized. No single entity—not even Impact Ledger—can modify or delete the record of your contribution.",
    },
    {
      icon: FaLock,
      title: "Step 3: Fund Disbursement & Milestone Tracking",
      description:
        "Funds are released to the designated field partner only when predefined project milestones (verified deliverables) are met via smart contract automation.",
      detail:
        "Each disbursement creates a new, auditable transaction, linking your original donation ID to the specific expenditure, guaranteeing fund usage.",
    },
    {
      icon: FaChartBar,
      title: "Step 4: Real-Time Impact Visibility",
      description:
        "You use your unique Transaction ID to view the donation's journey on our live Blockchain Tracker, seeing every movement until the final impact is achieved.",
      detail:
        "Transparency is total. You see not just where the money went, but the time, date, and project completion status associated with its use.",
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${themeClasses} flex flex-col`}
    >
      <Header />

      <main className="flex-grow">
        {/* ヒーローセクション (Page Title) */}
        <section className={`py-20 text-center ${lightBg}`}>
          <div className="max-w-4xl mx-auto px-4">
            <h1 className={`text-5xl font-extrabold mb-3 ${primaryHighlight}`}>
              How Transparency Works
            </h1>
            <p
              className={`text-xl ${
                isDark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              Follow your donation's journey, step-by-step, from your wallet to
              global impact.
            </p>
          </div>
        </section>

        {/* --- 1. The 4-Step Process --- */}
        <section className={`py-16 ${darkBg}`}>
          <div className="max-w-7xl mx-auto px-6">
            <h2
              className={`text-3xl font-bold text-center mb-12 ${
                isDark ? "text-white" : "text-zinc-800"
              }`}
            >
              The Traceable Donation Process
            </h2>

            <div className="space-y-12">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row items-start md:space-x-8"
                >
                  {/* Icon & Step Number */}
                  <div className="flex-shrink-0 mb-4 md:mb-0">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 ${stepColor} ${
                        isDark
                          ? "bg-zinc-800 border-green-500"
                          : "bg-gray-100 border-green-600"
                      }`}
                    >
                      0{index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <h3 className={`text-2xl font-extrabold mb-2 ${stepColor}`}>
                      {step.title}
                    </h3>
                    <p
                      className={`text-lg mb-3 ${
                        isDark ? "text-zinc-200" : "text-zinc-700"
                      }`}
                    >
                      {step.description}
                    </p>
                    <p
                      className={`italic ${
                        isDark ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- 2. Focus on Smart Contracts --- */}
        <section className={`py-16 ${lightBg}`}>
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-3xl font-bold mb-4 ${primaryHighlight}`}>
                Smart Contracts: Automating Accountability
              </h2>
              <p
                className={`mb-4 text-lg ${
                  isDark ? "text-zinc-300" : "text-zinc-700"
                }`}
              >
                We don't rely on human intervention to approve fund releases.
                Instead, we use **Smart Contracts**—self-executing agreements
                coded directly onto the blockchain.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  **Automatic Release:** Funds are released only when digital
                  proof of work (e.g., photo verification, signed document hash)
                  is submitted and verified.
                </li>
                <li>
                  **Zero Delay:** Eliminates bureaucratic holdups common in
                  traditional aid distribution.
                </li>
                <li>
                  **Code is Law:** The contract ensures funds are used exactly
                  as designated by the donor.
                </li>
              </ul>
            </div>
            <div
              className={`p-6 rounded-lg ${
                isDark ? "bg-zinc-900" : "bg-blue-50"
              } border border-solid border-opacity-30 ${
                isDark ? "border-blue-700" : "border-blue-300"
              }`}
            >
              {/* 

[Image of a smart contract flow chart]
 */}
              <p
                className={`italic text-center text-xl ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                If (Milestone Met) Then (Fund Released).
              </p>
            </div>
          </div>
        </section>

        {/* --- 3. Final Tracker CTA --- */}
        <section className={`py-16 text-center ${darkBg}`}>
          <h2 className={`text-4xl font-bold mb-4 ${primaryHighlight}`}>
            Ready to Start Tracking?
          </h2>
          <p
            className={`text-xl mb-8 max-w-2xl mx-auto ${
              isDark ? "text-zinc-300" : "text-zinc-700"
            }`}
          >
            Witness the future of verifiable giving by exploring our live,
            public ledger today.
          </p>
          <a
            href="/tracker" // Assuming the tracker has its own route
            className={`inline-block py-3 px-10 text-lg font-bold rounded-full transition shadow-xl bg-green-500 hover:bg-green-600 text-white`}
          >
            Go to Blockchain Tracker
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
