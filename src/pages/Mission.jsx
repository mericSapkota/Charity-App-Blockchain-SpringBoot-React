import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTheme } from "../contexts/ThemeContext";
import { FaBullseye, FaChartLine, FaCheckCircle } from "react-icons/fa";

const MissionPage = () => {
  const { isDark } = useTheme();

  // 1. Global Page Styles (Matches Homepage)
  const themeClasses = isDark
    ? "bg-zinc-900 text-zinc-100"
    : "bg-white text-zinc-900";

  // 2. Component Colors
  const primaryHighlight = isDark ? "text-blue-400" : "text-blue-600";
  const lightBg = isDark ? "bg-zinc-800" : "bg-gray-50";
  const darkBg = isDark ? "bg-zinc-950" : "bg-white";
  const iconColor = isDark ? "text-green-400" : "text-green-600";

  const principles = [
    {
      icon: FaBullseye,
      title: "Direct Impact Model",
      detail:
        "We bypass costly intermediary layers. Every dollar is tracked to ensure minimum friction and maximum positive outcome in the field.",
    },
    {
      icon: FaChartLine,
      title: "Performance Accountability",
      detail:
        "Our smart contracts log key metrics upon successful project milestones, providing objective, time-stamped proof of impact.",
    },
    {
      icon: FaCheckCircle,
      title: "Ethical Transparency",
      detail:
        "We are committed to full disclosure, not just of funds, but of operational decisions and partner evaluations, all secured by cryptography.",
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${themeClasses} flex flex-col`}
    >
      <Header />

      <main className="flex-grow">
        {/* ヒーローセクション (Mission Focus) */}
        <section className={`py-20 text-center ${lightBg}`}>
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-5xl font-extrabold mb-3">
              Our Mission: Trust, Powered by Tech.
            </h1>
            <p
              className={`text-xl ${
                isDark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              Redefining charitable giving through 100% auditable blockchain
              technology.
            </p>
          </div>
        </section>

        {/* --- 1. Core Principles --- */}
        <section className={`py-16 ${darkBg}`}>
          <div className="max-w-7xl mx-auto px-6">
            <h2
              className={`text-4xl font-bold text-center mb-12 ${primaryHighlight}`}
            >
              The Three Pillars of Impact Ledger
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {principles.map((p, index) => (
                <div
                  key={index}
                  className={`p-8 rounded-lg shadow-xl ${lightBg} border-t-4 ${
                    isDark ? "border-blue-700" : "border-blue-300"
                  }`}
                >
                  <p.icon className={`w-12 h-12 mb-4 ${iconColor}`} />
                  <h3
                    className={`text-2xl font-semibold mb-3 ${
                      isDark ? "text-white" : "text-zinc-800"
                    }`}
                  >
                    {p.title}
                  </h3>
                  <p
                    className={`${isDark ? "text-zinc-300" : "text-zinc-600"}`}
                  >
                    {p.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- 2. Blockchain and Accountability --- */}
        <section className={`py-16 ${lightBg}`}>
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-3xl font-bold mb-4 ${primaryHighlight}`}>
                Why We Chose the Blockchain
              </h2>
              <p className="mb-4 text-lg">
                Traditional non-profits struggle with the perception of high
                overhead and opaque fund usage. We eliminate this doubt entirely
                by hosting our financial ledger on a **decentralized network**.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li className={isDark ? "text-zinc-300" : "text-zinc-600"}>
                  **Immutability:** Once a donation is recorded, it cannot be
                  altered.
                </li>
                <li className={isDark ? "text-zinc-300" : "text-zinc-600"}>
                  **Public Access:** Anyone, anywhere, can verify transaction
                  paths.
                </li>
                <li className={isDark ? "text-zinc-300" : "text-zinc-600"}>
                  **Efficiency:** Reduces administrative costs, maximizing
                  impact per dollar.
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-lg bg-white/10 border border-solid border-gray-300/50">
              {/*  */}
              <p
                className={`italic text-center ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                "Trust is earned through transparency. We automate that
                process."
              </p>
            </div>
          </div>
        </section>

        {/* --- 3. Final Call to Action --- */}
        <section className={`py-16 text-center ${darkBg}`}>
          <h2 className={`text-4xl font-bold mb-4 ${primaryHighlight}`}>
            Join the Revolution of Transparent Giving
          </h2>
          <p
            className={`text-xl mb-8 max-w-2xl mx-auto ${
              isDark ? "text-zinc-300" : "text-zinc-700"
            }`}
          >
            Our mission is only possible with your support. Verify our
            commitment and make a secure, traceable donation today.
          </p>
          <a
            href="/donate"
            className={`inline-block py-3 px-10 text-lg font-bold rounded-full transition shadow-xl bg-green-500 hover:bg-green-600 text-white`}
          >
            See the Impact & Donate
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MissionPage;
