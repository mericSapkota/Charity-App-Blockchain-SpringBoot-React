import React from "react";
// Ensure these imports point to the correct files in your structure
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTheme } from "../contexts/ThemeContext";

const Homepage = () => {
  const { isDark } = useTheme();

  // 1. Global Page Styles
  const themeClasses = isDark
    ? "bg-zinc-900 text-zinc-100"
    : "bg-white text-zinc-900";

  // 2. Hero Section Styles (Enhanced)
  const primaryBg = isDark
    ? "bg-zinc-800"
    : "bg-gradient-to-br from-blue-700 to-blue-500 text-white"; // Attractive blue gradient

  const secondaryBtn =
    "bg-green-500 hover:bg-green-600 text-white shadow-xl hover:shadow-2xl transition duration-300";

  const heroAnchorClasses = isDark
    ? "border-zinc-400 hover:border-white hover:text-white text-zinc-100" // Light border contrast for dark mode
    : "border-white hover:border-blue-200 hover:text-blue-200 text-white";

  const blockchainHighlightClasses = isDark
    ? "bg-blue-900/40 text-blue-300 border-blue-500/50"
    : "bg-blue-700/50 text-white border-blue-100";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${themeClasses} flex flex-col`}
    >
      <Header />

      <main className="flex-grow">
        {/* --- 🦸 HERO CONTENT SECTION --- */}
        <section className={`py-28 lg:py-40 text-center ${primaryBg}`}>
          <div className="max-w-5xl mx-auto px-4">
            <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
              Track Your Impact. <br className="hidden sm:inline" /> Trust Every
              Transaction.
            </h1>
            <p className="text-xl lg:text-2xl mb-10 max-w-3xl mx-auto opacity-90 font-light">
              We leverage **blockchain technology** to provide complete
              transparency on where and how your donation is used, from click to
              impact.
            </p>

            <div className="flex justify-center space-x-4">
              <button
                className={`py-3 px-8 text-lg font-bold rounded-full transition shadow-xl ${secondaryBtn}`}
              >
                Donate Now & Get Started
              </button>
              <a
                href="#learn-more"
                className={`py-3 px-8 text-lg font-bold rounded-full border-2 transition ${heroAnchorClasses}`}
              >
                View Blockchain Ledger
              </a>
            </div>

            {/* Blockchain Feature Highlight */}
            <div
              className={`mt-12 p-2 px-6 inline-flex items-center rounded-full text-sm font-medium border ${blockchainHighlightClasses}`}
            >
              ✨ Decentralized. Secure. 100% Traceable.
            </div>
          </div>
        </section>
        {/* --- END HERO SECTION --- */}
      </main>

      <Footer />
    </div>
  );
};

export default Homepage;
