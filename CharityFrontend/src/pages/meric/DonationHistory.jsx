import React, { useState, useEffect } from "react";

import axios from "axios";
import { ethers } from "ethers";
import {
  History,
  Download,
  FileText,
  TrendingUp,
  Award,
  Heart,
  Calendar,
  DollarSign,
  ExternalLink,
  Filter,
  Search,
  Wallet,
  Target,
  Users,
} from "lucide-react";

import { useWallet } from "../../contexts/WalletContext";
import {
  getUserDonations,
  getUserTransactions,
  generateDonationCertificate,
  exportDonationHistory,
} from "../../service/HistoryService";

export default function DonationHistory() {
  const { connectWallet, contract, account, isOwner } = useWallet();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("donations");

  // Donation history from backend
  const [donations, setDonations] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Statistics
  const [stats, setStats] = useState({
    totalDonated: 0,
    donationCount: 0,
    charitiesSupported: 0,
    campaignsSupported: 0,
  });

  // Filters
  const [filterType, setFilterType] = useState("all"); // all, charity, campaign
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, week, month, year

  // Load data when wallet connects
  useEffect(() => {
    if (contract && account) {
      loadUserHistory();
    }
  }, [contract, account]);

  // Load user's donation and transaction history
  const loadUserHistory = async () => {
    setLoading(true);
    try {
      // Load from backend
      const [donationsData, transactionsData] = await Promise.all([
        getUserDonations(account),
        getUserTransactions(account),
      ]);

      setDonations(donationsData);
      setTransactions(transactionsData);

      // Calculate statistics
      calculateStats(donationsData);
    } catch (error) {
      console.error("Error loading user history:", error);
      // Fallback to blockchain if backend fails
      await loadFromBlockchain();
    } finally {
      setLoading(false);
    }
  };

  // Fallback: Load directly from blockchain
  const loadFromBlockchain = async () => {
    try {
      const donorHistory = await contract.getDonorHistory(account);
      const donationsList = [];

      for (let charityId of donorHistory) {
        const charity = await contract.charities(charityId);
        const charityDonations = await contract.getCharityDonations(charityId);

        // Filter donations by current user
        const userDonations = charityDonations.filter((d) => d.donor.toLowerCase() === account.toLowerCase());

        for (let donation of userDonations) {
          donationsList.push({
            charityId: Number(charityId),
            charityName: charity.name,
            campaignId: Number(donation.campaignId),
            amount: ethers.formatEther(donation.amount),
            timestamp: new Date(Number(donation.timestamp) * 1000),
            txHash: null, // Not available from contract
          });
        }
      }

      setDonations(donationsList);
      calculateStats(donationsList);
    } catch (error) {
      console.error("Error loading from blockchain:", error);
    }
  };

  // Calculate user statistics
  const calculateStats = (donationsData) => {
    const totalDonated = donationsData.reduce((sum, d) => sum + parseFloat(d.amount), 0);

    const uniqueCharities = new Set(donationsData.map((d) => d.charityId));
    const uniqueCampaigns = new Set(donationsData.filter((d) => d.campaignId > 0).map((d) => d.campaignId));

    setStats({
      totalDonated: totalDonated.toFixed(4),
      donationCount: donationsData.length,
      charitiesSupported: uniqueCharities.size,
      campaignsSupported: uniqueCampaigns.size,
    });
  };

  // Filter donations based on criteria
  const getFilteredDonations = () => {
    let filtered = [...donations];

    // Filter by type
    if (filterType === "charity") {
      filtered = filtered.filter((d) => d.campaignId === 0 || !d.campaignId);
    } else if (filterType === "campaign") {
      filtered = filtered.filter((d) => d.campaignId > 0);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.charityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.campaignTitle?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by date
    const now = new Date();
    if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((d) => new Date(d.timestamp) >= weekAgo);
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((d) => new Date(d.timestamp) >= monthAgo);
    } else if (dateFilter === "year") {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((d) => new Date(d.timestamp) >= yearAgo);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return filtered;
  };

  // Download donation certificate
  const downloadCertificate = async (txHash) => {
    try {
      axios
        .get(`http://localhost:8080/api/donations/certificate/${txHash}`, { responseType: "blob" })
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "certificate.pdf");
          document.body.appendChild(link);
          link.click();
        });
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("Failed to download certificate");
    }
  };

  // Export donation history as CSV
  const exportHistory = async () => {
    try {
      const blob = await exportDonationHistory(account);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `donation-history-${account.slice(0, 10)}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting history:", error);
      alert("Failed to export history");
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
          <Heart className="w-16 h-16 text-pink-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-4">Track Your Impact</h2>
          <p className="text-gray-300 text-center mb-6">Connect your wallet to view your donation history</p>
          <button
            onClick={connectWallet}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition flex items-center justify-center gap-2"
          >
            <Wallet size={20} />
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const filteredDonations = getFilteredDonations();

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <History className="w-10 h-10 text-sky-400" />
                My Impact Dashboard
              </h1>
              <p className="text-gray-300">Track your charitable contributions</p>
            </div>
            <div className="flex gap-5">
              <button
                onClick={exportHistory}
                className="bg-white/10 backdrop-blur-lg text-white px-4 py-2 rounded-lg hover:bg-white/20 transition flex items-center gap-2 border border-white/20"
              >
                <Download size={18} />
                Export History
              </button>
              <div
                className="text-white cursor-pointer bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/20"
                onClick={() => {
                  isOwner ? (window.location.href = "/admin/dashboard") : (window.location.href = "/");
                }}
              >
                Back
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-6 border border-pink-400/30">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-pink-400" />
                <TrendingUp className="w-5 h-5 text-pink-300" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stats.totalDonated}</p>
              <p className="text-pink-200 text-sm">Total Donated (ETH)</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-400/30">
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-8 h-8 text-purple-400" />
                <Award className="w-5 h-5 text-purple-300" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stats.donationCount}</p>
              <p className="text-purple-200 text-sm">Total Donations</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-xl p-6 border border-blue-400/30">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-400" />
                <Heart className="w-5 h-5 text-blue-300" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stats.charitiesSupported}</p>
              <p className="text-blue-200 text-sm">Charities Supported</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 backdrop-blur-lg rounded-xl p-6 border border-indigo-400/30">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-indigo-400" />
                <Award className="w-5 h-5 text-indigo-300" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stats.campaignsSupported}</p>
              <p className="text-indigo-200 text-sm">Campaigns Supported</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-2 mb-6 border border-white/20">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("donations")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                activeTab === "donations"
                  ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`}
            >
              Donation History
            </button>
            {/* <button
              onClick={() => setActiveTab("transactions")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                activeTab === "transactions"
                  ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`}
            >
              All Transactions
            </button> */}
          </div>
        </div>

        {/* Donations Tab */}
        {activeTab === "donations" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search charities or campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                {/* Type Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
                  >
                    <option value="all">All Donations</option>
                    <option value="charity">Direct to Charity</option>
                    <option value="campaign">Campaign Donations</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
                  >
                    <option value="all">All Time</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Donation List */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Heart className="w-6 h-6 text-sky-400" />
                Your Donations ({filteredDonations.length})
              </h3>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-300">Loading your donation history...</p>
                </div>
              ) : filteredDonations.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No donations found</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {searchTerm || filterType !== "all" || dateFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Start making a difference today!"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDonations.map((donation, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-lg font-semibold text-white">{donation.charityName}</h4>
                            {donation.campaignId > 0 && (
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-400/30">
                                Campaign
                              </span>
                            )}
                          </div>
                          <p className="text-md text-gray-500">Transaction Hash: {donation.txHash}</p>
                          {donation.campaignTitle && (
                            <p className="text-sm text-gray-300 mb-2">{donation.campaignTitle}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(donation.timestamp).toLocaleDateString()}
                            </span>

                            {donation.txHash && (
                              <a
                                href={`https://sepolia.etherscan.io/tx/${donation.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:text-pink-400 transition"
                              >
                                <ExternalLink className="w-3 h-3" />
                                View on Explorer
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-pink-400">{parseFloat(donation.amount).toFixed(4)}</p>
                          <p className="text-xs text-gray-400">ETH</p>
                        </div>
                      </div>

                      {donation.txHash && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => downloadCertificate(donation.txHash)}
                            className="flex-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 py-2 px-3 rounded-lg hover:from-blue-500/30 hover:to-cyan-500/30 transition flex items-center justify-center gap-2 text-sm border border-blue-400/30"
                          >
                            <FileText className="w-4 h-4" />
                            Certificate
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <History className="w-6 h-6 text-sky-400" />
            </h3>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-300">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              tx.type === "donation"
                                ? "bg-pink-500/20 text-pink-300 border border-pink-400/30"
                                : tx.type === "withdrawal"
                                  ? "bg-orange-500/20 text-orange-300 border border-orange-400/30"
                                  : "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                            }`}
                          >
                            {tx.type}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              tx.status === "success"
                                ? "bg-green-500/20 text-green-300"
                                : tx.status === "pending"
                                  ? "bg-yellow-500/20 text-yellow-300"
                                  : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(tx.timestamp).toLocaleString()}
                          </span>
                          {tx.txHash && (
                            <a
                              href={`https://etherscan.io/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-pink-400 transition font-mono"
                            >
                              {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">{tx.amount} ETH</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
