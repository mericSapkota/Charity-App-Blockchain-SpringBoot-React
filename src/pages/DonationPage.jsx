import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTheme } from "../contexts/ThemeContext";
import { FaLock, FaRegCreditCard, FaEthereum } from "react-icons/fa";

const DonatePage = () => {
  const { isDark } = useTheme();
  const [amount, setAmount] = useState(50); // Default donation amount
  const [selectedProject, setSelectedProject] = useState("education");

  // Component Colors
  const themeClasses = isDark
    ? "bg-zinc-900 text-zinc-100"
    : "bg-white text-zinc-900";
  const primaryHighlight = isDark ? "text-blue-400" : "text-blue-600";
  const lightBg = isDark ? "bg-zinc-800" : "bg-gray-50";
  const cardBg = isDark ? "bg-zinc-800" : "bg-white";
  const btnColor =
    "bg-green-500 hover:bg-green-600 text-white shadow-xl transition duration-200";

  const presetAmounts = [25, 50, 100, 250];
  const projects = [
    {
      id: "education",
      name: "Global Education Access",
      description: "Fund supplies and digital resources for remote schools.",
    },
    {
      id: "health",
      name: "Essential Health Clinics",
      description: "Provide basic medical aid and preventative care.",
    },
    {
      id: "sustainability",
      name: "Sustainable Farming Projects",
      description: "Invest in regenerative agriculture and food security.",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for payment processing logic
    alert(
      `Initiating ${amount} donation to ${selectedProject}. Redirecting to secure payment...`
    );
    // In a real app, this would redirect to a payment processor (Stripe, PayPal, Crypto wallet)
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${themeClasses} flex flex-col`}
    >
      <Header />

      <main className="flex-grow">
        {/* Donation Header Section */}
        <section className={`py-16 text-center ${lightBg}`}>
          <div className="max-w-4xl mx-auto px-4">
            <h1
              className={`text-4xl md:text-5xl font-extrabold mb-3 ${primaryHighlight}`}
            >
              Secure Your Traceable Donation
            </h1>
            <p
              className={`text-lg ${
                isDark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              100% of your contribution is tracked, verified, and sent directly
              to impact.
            </p>
          </div>
        </section>

        {/* Donation Form and Transparency Sidebar */}
        <section className={`py-16 ${isDark ? "bg-zinc-900" : "bg-white"}`}>
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-12">
            {/* LEFT COLUMN: Donation Form */}
            <div className="lg:col-span-2">
              <form
                onSubmit={handleSubmit}
                className={`p-8 rounded-xl shadow-2xl ${cardBg}`}
              >
                {/* 1. Choose Amount */}
                <h2 className="text-2xl font-bold mb-4">
                  1. Choose Your Contribution
                </h2>
                <div className="flex flex-wrap gap-3 mb-6">
                  {presetAmounts.map((pAmount) => (
                    <button
                      key={pAmount}
                      type="button"
                      onClick={() => setAmount(pAmount)}
                      className={`py-2 px-4 rounded-full border-2 font-semibold transition 
                                                        ${
                                                          amount === pAmount
                                                            ? `border-green-500 ${
                                                                isDark
                                                                  ? "bg-green-900/50 text-white"
                                                                  : "bg-green-100 text-green-700"
                                                              }`
                                                            : `border-gray-300 ${
                                                                isDark
                                                                  ? "bg-zinc-700 hover:bg-zinc-600"
                                                                  : "bg-gray-100 hover:bg-gray-200"
                                                              }`
                                                        }`}
                    >
                      ${pAmount}
                    </button>
                  ))}
                  <input
                    type="number"
                    placeholder="Custom amount"
                    value={
                      amount > 0 && !presetAmounts.includes(amount)
                        ? amount
                        : ""
                    }
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min="1"
                    className={`py-2 px-4 rounded-full border-2 w-32 text-center 
                                                    ${
                                                      isDark
                                                        ? "bg-zinc-700 border-zinc-600"
                                                        : "bg-white border-gray-300"
                                                    }`}
                  />
                </div>

                {/* 2. Choose Project */}
                <h2 className="text-2xl font-bold mt-8 mb-4">
                  2. Select a Project
                </h2>
                <div className="space-y-4 mb-8">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProject(project.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition 
                                                        ${
                                                          selectedProject ===
                                                          project.id
                                                            ? `border-blue-500 shadow-md ${
                                                                isDark
                                                                  ? "bg-blue-900/30"
                                                                  : "bg-blue-50"
                                                              }`
                                                            : `border-gray-300 ${
                                                                isDark
                                                                  ? "bg-zinc-700 hover:bg-zinc-600"
                                                                  : "hover:bg-gray-100"
                                                              }`
                                                        }`}
                    >
                      <input
                        type="radio"
                        name="project"
                        value={project.id}
                        checked={selectedProject === project.id}
                        readOnly // Handled by div click
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-semibold">{project.name}</span>
                      <p
                        className={`text-sm ml-6 mt-1 ${
                          isDark ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        {project.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 3. Payment Method */}
                <h2 className="text-2xl font-bold mt-8 mb-4">
                  3. Payment & Confirmation
                </h2>
                <div className="flex space-x-4 mb-6">
                  <button
                    type="button"
                    className={`flex items-center space-x-2 py-3 px-6 rounded-lg border transition ${
                      isDark
                        ? "border-zinc-600 bg-zinc-700"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <FaRegCreditCard /> <span>Card / PayPal</span>
                  </button>
                  <button
                    type="button"
                    className={`flex items-center space-x-2 py-3 px-6 rounded-lg border transition ${
                      isDark
                        ? "border-zinc-600 bg-zinc-700"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <FaEthereum /> <span>Crypto (ETH/BTC)</span>
                  </button>
                </div>

                <div className="p-4 border border-green-500 rounded-lg text-center my-6">
                  <p className="text-lg font-bold">
                    Total Donation:{" "}
                    <span className="text-green-500">${amount}</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={amount <= 0 || !selectedProject}
                  className={`w-full py-4 rounded-lg text-xl font-extrabold transition 
                                                ${
                                                  amount > 0 && selectedProject
                                                    ? btnColor
                                                    : "bg-gray-400 cursor-not-allowed text-gray-700"
                                                }`}
                >
                  Complete Secure Donation of ${amount}
                </button>
              </form>
            </div>

            {/* RIGHT COLUMN: Transparency Guarantee */}
            <div className="lg:col-span-1">
              <div
                className={`p-6 rounded-xl border-l-4 border-green-500 sticky top-24 ${lightBg}`}
              >
                <FaLock className={`w-8 h-8 mb-4 text-green-500`} />
                <h3 className="text-xl font-bold mb-3">
                  Your Blockchain Guarantee
                </h3>
                <ul className="space-y-3">
                  <li
                    className={`flex items-center space-x-2 ${
                      isDark ? "text-zinc-300" : "text-zinc-700"
                    }`}
                  >
                    <span className="text-green-500 font-bold">1.</span>
                    <span>
                      **Traceable ID:** Receive a unique ID instantly.
                    </span>
                  </li>
                  <li
                    className={`flex items-center space-x-2 ${
                      isDark ? "text-zinc-300" : "text-zinc-700"
                    }`}
                  >
                    <span className="text-green-500 font-bold">2.</span>
                    <span>
                      **Immutable Record:** Transaction permanently logged.
                    </span>
                  </li>
                  <li
                    className={`flex items-center space-x-2 ${
                      isDark ? "text-zinc-300" : "text-zinc-700"
                    }`}
                  >
                    <span className="text-green-500 font-bold">3.</span>
                    <span>
                      **Zero Fees:** No platform fees deducted from your
                      donation.
                    </span>
                  </li>
                </ul>
                <p className="mt-4 text-sm italic">
                  All personal and payment data is handled by secure third-party
                  processors. Only the final fund movement is recorded publicly.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DonatePage;
