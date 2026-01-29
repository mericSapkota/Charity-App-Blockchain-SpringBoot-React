import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTheme } from "../contexts/ThemeContext";
import { FaBook, FaGavel } from "react-icons/fa";

const TermsOfServicePage = () => {
  const { isDark } = useTheme();
  const themeClasses = isDark
    ? "bg-zinc-900 text-zinc-100"
    : "bg-white text-zinc-900";
  const primaryHighlight = isDark ? "text-blue-400" : "text-blue-600";
  const sectionBg = isDark ? "bg-zinc-800" : "bg-gray-50";
  const contentBg = isDark ? "bg-zinc-900" : "bg-white";

  // Date of last update
  const effectiveDate = "November 8, 2025";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${themeClasses} flex flex-col`}
    >
      <Header />

      <main className="flex-grow">
        {/* Header Section */}
        <section className={`py-16 text-center ${sectionBg}`}>
          <FaBook className={`w-12 h-12 mx-auto mb-4 ${primaryHighlight}`} />
          <div className="max-w-4xl mx-auto px-4">
            <h1
              className={`text-4xl md:text-5xl font-extrabold mb-3 ${
                isDark ? "text-white" : "text-zinc-800"
              }`}
            >
              Terms of Service
            </h1>
            <p
              className={`text-md italic ${
                isDark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              Effective Date: {effectiveDate}
            </p>
          </div>
        </section>

        {/* Content Sections */}
        <div className={`py-12 ${contentBg}`}>
          <div className="max-w-5xl mx-auto px-6 space-y-12 text-justify">
            {/* 1. Acceptance of Terms */}
            <section>
              <h2 className={`text-3xl font-bold mb-4 ${primaryHighlight}`}>
                1. Agreement to Terms
              </h2>
              <p className="mb-4">
                By accessing or using the Impact Ledger platform, you agree to
                be bound by these Terms of Service (ToS). If you disagree with
                any part of the terms, you may not access the service.
              </p>
            </section>

            {/* 2. Donation Policies */}
            <section>
              <h2 className={`text-3xl font-bold mb-4 ${primaryHighlight}`}>
                2. Donation Policies
              </h2>
              <p className="mb-2">
                **2.1 Non-Refundable Nature.** All donations made through the
                platform are considered final and non-refundable, except as
                required by law.
              </p>
              <p className="mb-2">
                **2.2 Tax Information.** Impact Ledger does not provide tax
                advice. Donors are responsible for consulting their own tax
                advisors regarding the deductibility of contributions.
              </p>
              <p className="mb-2">
                **2.3 Fund Allocation.** While donors select a project, Impact
                Ledger reserves the right to reallocate unused or excess funds
                to a similar humanitarian project if the designated project is
                completed or delayed indefinitely.
              </p>
            </section>

            {/* 3. Blockchain and Accountability */}
            <section>
              <h2 className={`text-3xl font-bold mb-4 ${primaryHighlight}`}>
                3. Blockchain & Digital Ledger
              </h2>
              <p className="mb-4">
                You acknowledge that transactions recorded on the public
                blockchain are **immutable**.
              </p>

              <ul className="list-disc ml-6 space-y-3">
                <li>
                  <strong className={primaryHighlight}>Public Record:</strong>{" "}
                  Transaction data (excluding PII) is public and permanent. You
                  understand and accept this public traceability.
                </li>
                <li>
                  <strong className={primaryHighlight}>Smart Contracts:</strong>{" "}
                  Fund release is governed by automated smart contracts.
                  Disputes must follow the platform's resolution process defined
                  herein.
                </li>
              </ul>
            </section>

            {/* 4. User Conduct */}
            <section>
              <h2 className={`text-3xl font-bold mb-4 ${primaryHighlight}`}>
                4. User Conduct
              </h2>
              <p>
                You agree not to use the service for any unlawful purposes,
                including fraud, money laundering, or harassment. Violation of
                this section may result in termination of your account and
                reporting to relevant authorities.
              </p>
            </section>

            {/* 5. Limitation of Liability */}
            <section>
              <h2 className={`text-3xl font-bold mb-4 ${primaryHighlight}`}>
                5. Limitation of Liability
              </h2>
              <p>
                Impact Ledger, including its affiliates, shall not be liable for
                any indirect, incidental, special, consequential, or punitive
                damages, or any loss of profits or revenues, whether incurred
                directly or indirectly.
              </p>
            </section>

            {/* 6. Governing Law */}
            <section>
              <h2 className={`text-3xl font-bold mb-4 ${primaryHighlight}`}>
                6. Governing Law
              </h2>
              <p className="mb-4">
                These Terms shall be governed and construed in accordance with
                the laws of [Insert Jurisdiction Here], without regard to its
                conflict of law provisions.
              </p>
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-500/10 text-red-400">
                <FaGavel />
                <span className="font-semibold">
                  Please read these terms carefully before making any donation.
                </span>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfServicePage;
