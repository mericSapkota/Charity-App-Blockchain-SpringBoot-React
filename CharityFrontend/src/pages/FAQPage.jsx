import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTheme } from "../contexts/ThemeContext";
import {
  FaQuestionCircle,
  FaCode,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

// Array of FAQ data
const faqData = {
  general: [
    {
      q: "What is Impact Ledger's mission?",
      a: "To create the most transparent charitable giving platform by tracking every donation on a public ledger.",
    },
    {
      q: "What percentage of my donation goes to overhead?",
      a: "0%. Our operational costs are covered by separate grants and private funding. 100% of your donation is dedicated to project work.",
    },
    {
      q: "How can I contact support?",
      a: "Please use the 'Contact Us' link in the footer or email support@impactledger.org.",
    },
  ],
  blockchain: [
    {
      q: "Which blockchain does Impact Ledger use?",
      a: "We utilize a custom Layer-2 solution built on the Ethereum Virtual Machine (EVM) for high speed, low cost, and strong security.",
    },
    {
      q: "What is the Transaction ID used for?",
      a: "The Transaction ID is the unique cryptographic hash proving your donation's existence and allowing you to track its movement on our ledger.",
    },
    {
      q: "Is my personal data recorded on the blockchain?",
      a: "No. Only the tokenized value, project designation, and time stamp are recorded. Your identity and personal payment details remain confidential.",
    },
    {
      q: "What are Smart Contracts?",
      a: "Smart Contracts are self-executing contracts with the terms of the agreement directly written into code. We use them to automatically release funds only when project milestones are verified.",
    },
  ],
};

// Reusable Accordion Item Component (simplified)
const AccordionItem = ({ question, answer, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const itemBg = isDark
    ? "bg-zinc-800 hover:bg-zinc-700"
    : "bg-gray-50 hover:bg-gray-100";
  const textColor = isDark ? "text-zinc-200" : "text-zinc-700";
  const chevronColor = isDark ? "text-blue-400" : "text-blue-600";

  return (
    <div
      className={`border-b ${isDark ? "border-zinc-700" : "border-gray-200"} `}
    >
      <button
        className={`flex justify-between items-center w-full p-5 font-semibold transition ${itemBg}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={textColor}>{question}</span>
        {isOpen ? (
          <FaChevronUp className={`w-4 h-4 ${chevronColor}`} />
        ) : (
          <FaChevronDown className={`w-4 h-4 ${chevronColor}`} />
        )}
      </button>
      {isOpen && (
        <div
          className={`p-5 ${
            isDark ? "bg-zinc-900 text-zinc-400" : "bg-white text-zinc-600"
          } text-sm`}
        >
          {answer}
        </div>
      )}
    </div>
  );
};

const FAQPage = () => {
  const { isDark } = useTheme();
  const themeClasses = isDark
    ? "bg-zinc-900 text-zinc-100"
    : "bg-white text-zinc-900";
  const primaryHighlight = isDark ? "text-blue-400" : "text-blue-600";
  const sectionBg = isDark ? "bg-zinc-900" : "bg-white";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${themeClasses} flex flex-col`}
    >
      <Header />

      <main className="flex-grow">
        {/* Header Section */}
        <section
          className={`py-20 text-center ${
            isDark ? "bg-zinc-800" : "bg-gray-50"
          }`}
        >
          <FaQuestionCircle
            className={`w-12 h-12 mx-auto mb-4 ${primaryHighlight}`}
          />
          <div className="max-w-4xl mx-auto px-4">
            <h1
              className={`text-5xl font-extrabold mb-3 ${
                isDark ? "text-white" : "text-zinc-800"
              }`}
            >
              FAQ & Technical Details
            </h1>
            <p
              className={`text-xl ${
                isDark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              Everything you need to know about our mission, finances, and
              blockchain technology.
            </p>
          </div>
        </section>

        <div className={`py-16 ${sectionBg}`}>
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12">
            {/* 1. General Questions */}
            <div>
              <h2
                className={`text-3xl font-bold mb-6 ${
                  isDark ? "text-white" : "text-zinc-800"
                }`}
              >
                General Questions
              </h2>
              <div>
                {faqData.general.map((item, index) => (
                  <AccordionItem
                    key={index}
                    question={item.q}
                    answer={item.a}
                    isDark={isDark}
                  />
                ))}
              </div>
            </div>

            {/* 2. Technical & Blockchain Questions */}
            <div>
              <h2 className={`text-3xl font-bold mb-6 ${primaryHighlight}`}>
                Blockchain & Technical Details
              </h2>
              <p
                className={`mb-4 italic ${
                  isDark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                Learn about the secure ledger and smart contracts that power
                transparent giving.
              </p>
              <div>
                {faqData.blockchain.map((item, index) => (
                  <AccordionItem
                    key={index}
                    question={item.q}
                    answer={item.a}
                    isDark={isDark}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA for Advanced Users */}
        <section
          className={`py-12 text-center ${
            isDark ? "bg-zinc-800" : "bg-gray-100"
          }`}
        >
          <FaCode
            className={`w-8 h-8 mx-auto mb-3 ${
              isDark ? "text-red-400" : "text-red-600"
            }`}
          />
          <h3 className="text-xl font-bold mb-3">
            Developer & Advanced Documentation
          </h3>
          <p className={`mb-4 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            Review our source code, audit reports, and technical whitepaper.
          </p>
          <a
            href="/api-docs"
            className={`inline-block py-2 px-6 rounded-full font-medium transition 
                                   ${
                                     isDark
                                       ? "bg-red-700 hover:bg-red-600 text-white"
                                       : "bg-red-600 hover:bg-red-700 text-white shadow-md"
                                   }`}
          >
            View Whitepaper & GitHub
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;
