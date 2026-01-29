import React, { useState } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import { useTheme } from "../contexts/ThemeContext";
import {
  FaClipboardCheck,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaRedo,
} from "react-icons/fa";

// Mock Data for Pending Milestones
const initialMilestones = [
  {
    id: 101,
    project: "Global Education Access Q4",
    milestoneName: "Phase 1: Procurement of Laptops",
    amount: "1.2 ETH",
    evidence: "Proof of Delivery Invoice #456",
    status: "Pending",
    dateSubmitted: "Nov 15, 2025",
  },
  {
    id: 102,
    project: "Sustainable Farming Project 2",
    milestoneName: "Phase 3: Irrigation System Completion",
    amount: "0.5 ETH",
    evidence: "Geo-tagged Photos",
    status: "Pending",
    dateSubmitted: "Nov 10, 2025",
  },
  {
    id: 103,
    project: "Health Clinics Expansion",
    milestoneName: "Initial Construction Start",
    amount: "3.0 ETH",
    evidence: "Signed Contract V3",
    status: "Pending",
    dateSubmitted: "Nov 1, 2025",
  },
];

const AdminMilestoneVerificationPage = () => {
  const { isDark } = useTheme();
  const [milestones, setMilestones] = useState(initialMilestones);

  const themeClasses = isDark
    ? "bg-zinc-900 text-zinc-100"
    : "bg-gray-50 text-zinc-900";
  const cardBg = isDark ? "bg-zinc-800" : "bg-white";
  const tableHeaderBg = isDark ? "bg-zinc-700" : "bg-gray-200";
  const highlightColor = "text-red-500";

  const handleAction = (id, action) => {
    // --- API CALL: Send POST/PUT request to blockchain service to update contract status ---
    console.log(`Milestone ${id} actioned: ${action}`);

    setMilestones((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: action === "approve" ? "Approved" : "Rejected" }
          : m
      )
    );

    if (action === "approve") {
      alert(
        `Milestone ${id} approved. Smart contract funds will now be released.`
      );
    } else if (action === "reject") {
      alert(`Milestone ${id} rejected. Funds remain locked.`);
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
            <FaClipboardCheck className="w-8 h-8" />
            <span>Milestone Verification Center</span>
          </h1>

          {/* Summary Bar */}
          <div
            className={`p-4 mb-8 rounded-xl shadow-md ${cardBg} flex justify-between items-center border border-red-500/50`}
          >
            <p className="text-xl font-semibold">
              Pending Review:{" "}
              <span className="text-red-500">
                {milestones.filter((m) => m.status === "Pending").length}
              </span>{" "}
              Milestones
            </p>
            <button className="py-2 px-4 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold flex items-center space-x-2 transition">
              <FaRedo />
              <span>Refresh Contract Status</span>
            </button>
          </div>

          {/* Pending Milestones Table */}
          <div className={`overflow-x-auto rounded-lg shadow-xl ${cardBg}`}>
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className={tableHeaderBg}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Project / Milestone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Amount (ETH)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Evidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {milestones.map((m) => (
                  <tr
                    key={m.id}
                    className={
                      m.status === "Pending"
                        ? isDark
                          ? "bg-yellow-900/10"
                          : "bg-yellow-50"
                        : ""
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-semibold">{m.project}</p>
                      <p
                        className={`text-sm italic ${
                          isDark ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        {m.milestoneName}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 font-bold">
                      {m.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a
                        href={`/evidence/${m.id}`}
                        target="_blank"
                        className={`flex items-center space-x-2 text-sm underline ${highlightColor} hover:text-red-300`}
                      >
                        <FaFileAlt /> <span>View {m.evidence}</span>
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex items-center space-x-1">
                      <FaClock className="w-3 h-3 text-gray-500" />{" "}
                      <span>{m.dateSubmitted}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`font-semibold ${
                          m.status === "Pending"
                            ? "text-yellow-500"
                            : m.status === "Approved"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                      {m.status === "Pending" ? (
                        <>
                          <button
                            onClick={() => handleAction(m.id, "approve")}
                            className="text-green-500 hover:text-green-300 transition"
                            title="Approve & Release Funds"
                          >
                            <FaCheckCircle className="w-5 h-5 inline" />
                          </button>
                          <button
                            onClick={() => handleAction(m.id, "reject")}
                            className="text-red-500 hover:text-red-300 transition"
                            title="Reject & Lock Funds"
                          >
                            <FaTimesCircle className="w-5 h-5 inline" />
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-500 italic text-xs">
                          Finalized
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {milestones.length === 0 && (
              <p className="p-4 text-center text-sm text-gray-500">
                No milestones currently pending review.
              </p>
            )}
          </div>
        </div>
      </main>

      <AdminFooter />
    </div>
  );
};

export default AdminMilestoneVerificationPage;
