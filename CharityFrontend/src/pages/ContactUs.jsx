import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTheme } from "../contexts/ThemeContext";
import {
  FaPaperPlane,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
} from "react-icons/fa";

const ContactUsPage = () => {
  const { isDark } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const themeClasses = isDark
    ? "bg-zinc-900 text-zinc-100"
    : "bg-white text-zinc-900";
  const primaryHighlight = isDark ? "text-blue-400" : "text-blue-600";
  const sectionBg = isDark ? "bg-zinc-800" : "bg-gray-50";
  const contentBg = isDark ? "bg-zinc-900" : "bg-white";

  const inputStyle = isDark
    ? "bg-zinc-700 border-zinc-600 text-white"
    : "bg-white border-gray-300 text-zinc-800";
  const buttonStyle =
    "bg-green-600 hover:bg-green-700 text-white font-bold shadow-md transition duration-200";

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Contact Form Submitted:", { name, email, message });
    // --- API Submission Logic Goes Here ---
    alert("Thank you for your message! We will be in touch shortly.");
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${themeClasses} flex flex-col`}
    >
      <Header />

      <main className="flex-grow">
        {/* Header Section */}
        <section className={`py-16 text-center ${sectionBg}`}>
          <FaPaperPlane
            className={`w-12 h-12 mx-auto mb-4 ${primaryHighlight}`}
          />
          <div className="max-w-4xl mx-auto px-4">
            <h1
              className={`text-4xl md:text-5xl font-extrabold mb-3 ${
                isDark ? "text-white" : "text-zinc-800"
              }`}
            >
              Get in Touch
            </h1>
            <p
              className={`text-xl ${
                isDark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              We are here to answer your questions about donations, projects,
              and the blockchain ledger.
            </p>
          </div>
        </section>

        {/* Contact Content & Form */}
        <div className={`py-12 ${contentBg}`}>
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12">
            {/* LEFT COLUMN: Contact Form */}
            <div>
              <h2 className={`text-3xl font-bold mb-6 ${primaryHighlight}`}>
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-1"
                  >
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${inputStyle} border`}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${inputStyle} border`}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-1"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="5"
                    className={`w-full p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${inputStyle} border`}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 rounded-lg ${buttonStyle}`}
                >
                  Submit Inquiry
                </button>
              </form>
            </div>

            {/* RIGHT COLUMN: Contact Details */}
            <div className={`p-8 rounded-xl shadow-lg ${sectionBg}`}>
              <h2
                className={`text-3xl font-bold mb-6 ${
                  isDark ? "text-white" : "text-zinc-800"
                }`}
              >
                Our Details
              </h2>
              <p
                className={`mb-6 ${isDark ? "text-zinc-300" : "text-zinc-600"}`}
              >
                For urgent matters or formal requests, please use the contact
                information below.
              </p>

              <ul className="space-y-6">
                <li className="flex items-center space-x-4">
                  <FaEnvelope
                    className={`w-6 h-6 flex-shrink-0 ${primaryHighlight}`}
                  />
                  <div>
                    <h4 className="font-semibold">General Inquiries</h4>
                    <p className={isDark ? "text-zinc-400" : "text-zinc-500"}>
                      info@impactledger.org
                    </p>
                  </div>
                </li>
                <li className="flex items-center space-x-4">
                  <FaPhone
                    className={`w-6 h-6 flex-shrink-0 ${primaryHighlight}`}
                  />
                  <div>
                    <h4 className="font-semibold">Support Line</h4>
                    <p className={isDark ? "text-zinc-400" : "text-zinc-500"}>
                      +1 (555) 123-4567
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <FaMapMarkerAlt
                    className={`w-6 h-6 flex-shrink-0 mt-1 ${primaryHighlight}`}
                  />
                  <div>
                    <h4 className="font-semibold">Headquarters</h4>
                    <p className={isDark ? "text-zinc-400" : "text-zinc-500"}>
                      100 Digital Blvd, Suite 200
                      <br />
                      Decentraland, CA 90210
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUsPage;
