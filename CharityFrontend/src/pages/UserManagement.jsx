import React, { useState } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import { useTheme } from "../contexts/ThemeContext";
import {
  FaSearch,
  FaUserEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaFilter,
} from "react-icons/fa";

// Mock Data for User List
const initialUsers = [
  {
    id: 1,
    name: "Alex Donor",
    email: "alex@example.com",
    role: "donor",
    status: "Active",
    totalDonations: 1250,
    verified: true,
  },
  {
    id: 2,
    name: "Patel Admin",
    email: "patel@impact.org",
    role: "admin",
    status: "Active",
    totalDonations: 0,
    verified: true,
  },
  {
    id: 3,
    name: "Jane Doe",
    email: "jane.d@mail.com",
    role: "donor",
    status: "Inactive",
    totalDonations: 45,
    verified: false,
  },
  {
    id: 4,
    name: "Sys Auditor",
    email: "audit@impact.org",
    role: "auditor",
    status: "Active",
    totalDonations: 0,
    verified: true,
  },
  {
    id: 5,
    name: "Test User",
    email: "test@user.com",
    role: "donor",
    status: "Active",
    totalDonations: 20,
    verified: false,
  },
];

const AdminUsersPage = () => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [userList, setUserList] = useState(initialUsers);

  const themeClasses = isDark
    ? "bg-zinc-900 text-zinc-100"
    : "bg-gray-50 text-zinc-900";
  const cardBg = isDark ? "bg-zinc-800" : "bg-white";
  const inputStyle = isDark
    ? "bg-zinc-700 border-zinc-600 text-white"
    : "bg-white border-gray-300 text-zinc-800";
  const tableHeaderBg = isDark ? "bg-zinc-700" : "bg-gray-200";
  const highlightColor = "text-red-500";

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const filtered = initialUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
        user.email.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setUserList(filtered);
  };

  const handleEdit = (userId) => {
    // Placeholder for opening an edit modal or navigating to an edit route
    console.log("Editing user:", userId);
  };

  const handleDelete = (userId) => {
    if (window.confirm(`Are you sure you want to delete user ID ${userId}?`)) {
      const updatedList = userList.filter((user) => user.id !== userId);
      setUserList(updatedList);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${themeClasses} flex flex-col`}
    >
      <AdminHeader />

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className={`text-4xl font-extrabold mb-6 ${highlightColor}`}>
            User Management Console
          </h1>

          {/* Search and Filter Bar */}
          <div
            className={`p-4 mb-6 rounded-lg shadow-md ${cardBg} flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4`}
          >
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by Name or Email..."
                className={`w-full p-3 pl-10 rounded-lg ${inputStyle} focus:ring-red-500 focus:border-red-500`}
              />
            </div>
            <button className="py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center space-x-2">
              <FaFilter />
              <span>Filter Roles</span>
            </button>
          </div>

          {/* Users Table */}
          <div className={`overflow-x-auto rounded-lg shadow-xl ${cardBg}`}>
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className={tableHeaderBg}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Total $
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {userList.map((user) => (
                  <tr
                    key={user.id}
                    className={
                      user.role === "admin"
                        ? isDark
                          ? "bg-red-900/30"
                          : "bg-red-50"
                        : ""
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : user.role === "auditor"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        } ${isDark ? "bg-opacity-20" : ""}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      ${user.totalDonations}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`font-semibold ${
                          user.status === "Active"
                            ? "text-green-500"
                            : "text-gray-500"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {user.verified ? (
                        <FaCheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <FaTimesCircle className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                      <button
                        onClick={() => handleEdit(user.id)}
                        className={`text-blue-500 hover:text-blue-700 ${
                          isDark ? "hover:text-blue-300" : ""
                        }`}
                      >
                        <FaUserEdit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className={`text-red-500 hover:text-red-700 ${
                          isDark ? "hover:text-red-300" : ""
                        }`}
                      >
                        <FaTrash className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {userList.length === 0 && (
              <p className="p-4 text-center text-sm text-gray-500">
                No users match your search criteria.
              </p>
            )}
          </div>
        </div>
      </main>

      <AdminFooter />
    </div>
  );
};

export default AdminUsersPage;
