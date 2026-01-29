import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTheme } from "../contexts/ThemeContext";
import { FaShieldAlt } from "react-icons/fa";

const PrivacyPolicyPage = () => {
  const { isDark } = useTheme();
  const themeClasses = isDark
    ? "bg-zinc-900 text-zinc-100"
    : "bg-white text-zinc-900";
  const primaryHighlight = isDark ? "text-blue-400" : "text-blue-600";
  const sectionBg = isDark ? "bg-zinc-800" : "bg-gray-50";
  const contentBg = isDark ? "bg-zinc-900" : "bg-white";

  // Date of last update
  const lastUpdated = "November 8, 2025";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${themeClasses} flex flex-col`}
    >
      <Header />

      <main className="flex-grow">
        {/* Header Section */}
        <section className={`py-16 text-center ${sectionBg}`}>
          <FaShieldAlt
            className={`w-12 h-12 mx-auto mb-4 ${primaryHighlight}`}
          />
          <div className="max-w-4xl mx-auto px-4">
            <h1
              className={`text-4xl md:text-5xl font-extrabold mb-3 ${
                isDark ? "text-white" : "text-zinc-800"
              }`}
            >
              Privacy Policy
            </h1>
            <p
              className={`text-md italic ${
                isDark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              Last Updated: {lastUpdated}
            </p>
          </div>
        </section>

        {/* Content Sections */}
        <div className={`py-12 ${contentBg}`}>
          <div className="max-w-5xl mx-auto px-6 space-y-12">
            {/* 1. Information We Collect */}
            <section>
              <h2 className={`text-3xl font-bold mb-4 ${primaryHighlight}`}>
                1. Information We Collect
              </h2>
              <p className="mb-4">We collect two main types of information:</p>

              <ul className="list-disc ml-6 space-y-3">
                <li>
                  <strong className={primaryHighlight}>
                    Personal Identification Information:
                  </strong>{" "}
                  Name, email address, and payment information (processed by
                  secure third-party processors like Stripe/PayPal). This is
                  collected during registration and donation.
                </li>
                <li>
                  <strong className={primaryHighlight}>
                    Non-Personal Transaction Data:
                  </strong>{" "}
                  The amount, date, project designation, and the resulting
                  **Blockchain Transaction ID**. This data is public and
                  auditable.
                </li>
              </ul>
            </section>

            {/* 2. Use of Information */}
            <section>
              <h2 className={`text-3xl font-bold mb-4 ${primaryHighlight}`}>
                2. How We Use Your Information
              </h2>
              <p className="mb-4">
                Your information is used strictly for the following purposes:
              </p>

              <ul className="list-disc ml-6 space-y-3">
                <li>To process and confirm your donation.</li>
                <li>
                  To provide you with your **Transaction ID** for tracking.
                </li>
                <li>
                  To send you updates regarding the project you funded (if
                  opted-in).
                </li>
                <li>
                  For legal and security purposes (e.g., preventing fraud).
                </li>
              </ul>
            </section>

            {/* 3. Blockchain & Public Data */}
            <section>
              <h2 className={`text-3xl font-bold mb-4 ${primaryHighlight}`}>
                3. Blockchain & Public Data
              </h2>
              <p className="mb-4">
                Impact Ledger is committed to transparency. However, we ensure
                your privacy is protected:
              </p>

              <ul className="list-disc ml-6 space-y-3">
                <li>
                  <strong className={primaryHighlight}>
                    No PII on Ledger:
                  </strong>{" "}
                  Your name, email, and IP address are **never** stored on the
                  public blockchain.
                </li>
                <li>
                  <strong className={primaryHighlight}>Transaction ID:</strong>{" "}
                  While the transaction ID is public, it is an anonymous hash
                  and **cannot** be directly linked to your personal identity by
                  third parties without a subpoena.
                </li>
                <li>
                  <strong className={primaryHighlight}>
                    Payment Processors:
                  </strong>{" "}
                  We do not handle your sensitive card data; it is encrypted and
                  managed by PCI-compliant third-party services.
                </li>
              </ul>
            </section>

            {/* 4. Contact Us */}
            <section>
              <h2 className={`text-3xl font-bold mb-4 ${primaryHighlight}`}>
                4. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy or your
                data, please contact us at:
              </p>
              <p className="mt-2 font-semibold">
                Email: privacy@impactledger.org
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
