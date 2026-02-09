import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  History,
  Download,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Filter,
  Calendar,
  ExternalLink,
  BarChart3,
  PieChart,
  Shield,
} from "lucide-react";

import { useWallet } from "../../contexts/WalletContext";
import { getPlatformStatistics, exportDonationHistory } from "../../service/HistoryService";

export default function AdminHistory() {
  const { contract, account } = useWallet();

  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Platform-wide statistics
  const [platformStats, setPlatformStats] = useState({
    totalDonations: 0,
    totalDonationsETH: "0",
    totalCharities: 0,
    totalCampaigns: 0,
    totalDonors: 0,
    averageDonation: "0",
    platformFees: "0",
  });

  // Transaction history
  const [allTransactions, setAllTransactions] = useState([]);
  const [donations, setDonations] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);

  // Filters
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [charityFilter, setCharityFilter] = useState("all");

  // Analytics data
  const [donationTrends, setDonationTrends] = useState([]);
  const [topDonors, setTopDonors] = useState([]);
  const [topCharities, setTopCharities] = useState([]);

  useEffect(() => {
    if (contract && account) {
      checkOwnership();
      loadPlatformData();
    }
  }, [contract, account]);

  const checkOwnership = async () => {
    try {
      const owner = await contract.owner();
      setIsOwner(owner.toLowerCase() === account.toLowerCase());
    } catch (error) {
      console.error("Error checking ownership:", error);
    }
  };

  const loadPlatformData = async () => {
    setLoading(true);
    try {
      // Load from backend
      const stats = await getPlatformStatistics();
      setPlatformStats(stats);

      // Load blockchain data
      await loadBlockchainData();

      // Calculate analytics
      calculateAnalytics();
    } catch (error) {
      console.error("Error loading platform data:", error);
      // Fallback to blockchain only
      await loadBlockchainData();
    } finally {
      setLoading(false);
    }
  };

  const loadBlockchainData = async () => {
    try {
      const [totalDonations, charityCount, campaignCount] = await Promise.all([
        contract.totalDonations(),
        contract.charityCount(),
        contract.campaignCount(),
      ]);

      // Load all charities
      const charityData = [];
      for (let i = 1; i <= Number(charityCount); i++) {
        const charity = await contract.charities(i);
        const donations = await contract.getCharityDonations(i);

        charityData.push({
          id: i,
          name: charity.name,
          totalReceived: ethers.formatEther(charity.totalReceived),
          totalWithdrawn: ethers.formatEther(charity.totalWithdrawn),
          donationCount: donations.length,
          donations: donations,
        });
      }

      // Aggregate all donations
      const allDonations = charityData.flatMap((charity) =>
        charity.donations.map((d) => ({
          charityId: charity.id,
          charityName: charity.name,
          donor: d.donor,
          amount: ethers.formatEther(d.amount),
          timestamp: new Date(Number(d.timestamp) * 1000),
          campaignId: Number(d.campaignId),
        })),
      );

      setDonations(allDonations);

      // Calculate top donors
      const donorMap = new Map();
      allDonations.forEach((d) => {
        const current = donorMap.get(d.donor) || { address: d.donor, total: 0, count: 0 };
        current.total += parseFloat(d.amount);
        current.count += 1;
        donorMap.set(d.donor, current);
      });

      const topDonorsList = Array.from(donorMap.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
      setTopDonors(topDonorsList);

      // Calculate top charities
      const topCharitiesList = charityData
        .sort((a, b) => parseFloat(b.totalReceived) - parseFloat(a.totalReceived))
        .slice(0, 10);
      setTopCharities(topCharitiesList);

      // Update platform stats
      const uniqueDonors = new Set(allDonations.map((d) => d.donor)).size;
      const avgDonation =
        allDonations.length > 0
          ? (parseFloat(ethers.formatEther(totalDonations)) / allDonations.length).toFixed(4)
          : "0";

      setPlatformStats({
        totalDonations: allDonations.length,
        totalDonationsETH: ethers.formatEther(totalDonations),
        totalCharities: Number(charityCount),
        totalCampaigns: Number(campaignCount),
        totalDonors: uniqueDonors,
        averageDonation: avgDonation,
        platformFees: "0", // Would need to calculate from withdrawals
      });
    } catch (error) {
      console.error("Error loading blockchain data:", error);
    }
  };

  const calculateAnalytics = () => {
    // Calculate donation trends (last 30 days)
    const now = new Date();
    const trends = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayDonations = donations.filter((d) => d.timestamp >= date && d.timestamp < nextDate);

      const dayTotal = dayDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0);

      trends.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        amount: dayTotal.toFixed(2),
        count: dayDonations.length,
      });
    }

    setDonationTrends(trends);
  };

  const getFilteredTransactions = () => {
    let filtered = [...donations];

    // Filter by charity
    if (charityFilter !== "all") {
      filtered = filtered.filter((d) => d.charityId === parseInt(charityFilter));
    }

    // Filter by date
    const now = new Date();
    if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((d) => d.timestamp >= weekAgo);
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((d) => d.timestamp >= monthAgo);
    } else if (dateFilter === "year") {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((d) => d.timestamp >= yearAgo);
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  };

  const exportPlatformData = async () => {
    try {
      // Create CSV content
      const headers = ["Date", "Donor", "Charity", "Campaign ID", "Amount (ETH)"];
      const rows = getFilteredTransactions().map((d) => [
        d.timestamp.toLocaleString(),
        d.donor,
        d.charityName,
        d.campaignId || "Direct",
        d.amount,
      ]);

      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `platform-transactions-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data");
    }
  };

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-4">Access Denied</h2>
          <p className="text-gray-300 text-center">Only admins can access this page</p>
        </div>
      </div>
    );
  }

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <History className="w-10 h-10 text-blue-400" />
                Transaction History & Analytics
              </h1>
              <p className="text-gray-300">Platform-wide donation tracking</p>
            </div>
            <div className="flex gap-5">
              <button
                onClick={exportPlatformData}
                className="bg-white/10 backdrop-blur-lg text-white px-4 py-2 rounded-lg hover:bg-white/20 transition flex items-center gap-2 border border-white/20"
              >
                <Download size={18} />
                Export Data
              </button>
              <div
                className="text-white cursor-pointer bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/20"
                onClick={() => {
                  window.location.href = "/admin/dashboard";
                }}
              >
                Back
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-lg rounded-xl p-6 border border-green-400/30">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-400" />
                <TrendingUp className="w-5 h-5 text-green-300" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {parseFloat(platformStats.totalDonationsETH).toFixed(2)}
              </p>
              <p className="text-green-200 text-sm">Total Donations (ETH)</p>
            </div>

            <div className="bg-gradient-to-br from-sky-500/20 to-sky-600/20 backdrop-blur-lg rounded-xl p-6 border border-sky-400/30">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 text-sky-400" />
                <BarChart3 className="w-5 h-5 text-sky-300" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{platformStats.totalDonations}</p>
              <p className="text-sky-200 text-sm">Total Transactions</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-400/30">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-purple-400" />
                <TrendingUp className="w-5 h-5 text-purple-300" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{platformStats.totalDonors}</p>
              <p className="text-purple-200 text-sm">Unique Donors</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-lg rounded-xl p-6 border border-orange-400/30">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-8 h-8 text-orange-400" />
                <Activity className="w-5 h-5 text-orange-300" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{platformStats.averageDonation}</p>
              <p className="text-orange-200 text-sm">Average Donation (ETH)</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-2 mb-6 border border-white/20">
          <div className="flex gap-2">
            {["overview", "transactions", "analytics"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition capitalize ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white"
                    : "text-gray-300 hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Donors */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-sky-400" />
                Top Donors
              </h3>
              <div className="space-y-3">
                {topDonors.map((donor, index) => (
                  <div key={donor.address} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-purple-400">#{index + 1}</span>
                        <div>
                          <p className="text-white font-mono text-sm">
                            {donor.address.slice(0, 6)}...{donor.address.slice(-4)}
                          </p>
                          <p className="text-xs text-gray-400">{donor.count} donations</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-400">{donor.total.toFixed(4)}</p>
                        <p className="text-xs text-gray-400">ETH</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Charities */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-sky-400" />
                Top Charities
              </h3>
              <div className="space-y-3">
                {topCharities.map((charity, index) => (
                  <div key={charity.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-green-400">#{index + 1}</span>
                        <div>
                          <p className="text-white font-semibold">{charity.name}</p>
                          <p className="text-xs text-gray-400">{charity.donationCount} donations</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-400">
                          {parseFloat(charity.totalReceived).toFixed(4)}
                        </p>
                        <p className="text-xs text-gray-400">ETH</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                  >
                    <option value="all">All Time</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={charityFilter}
                    onChange={(e) => setCharityFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                  >
                    <option value="all">All Charities</option>
                    {topCharities.map((charity) => (
                      <option key={charity.id} value={charity.id}>
                        {charity.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Transaction List */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-sky-400" />
                All Transactions ({filteredTransactions.length})
              </h3>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredTransactions.map((tx, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-white font-semibold">{tx.charityName}</h4>
                          {tx.campaignId > 0 && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                              Campaign #{tx.campaignId}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>
                            From: {tx.donor.slice(0, 10)}...{tx.donor.slice(-8)}
                          </span>
                          <span>{tx.timestamp.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-400">{parseFloat(tx.amount).toFixed(4)}</p>
                        <p className="text-xs text-gray-400">ETH</p>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredTransactions.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No transactions found</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Donation Trends */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-sky-400" />
                Donation Trends (Last 30 Days)
              </h3>
              <div className="space-y-2">
                {donationTrends.map((day, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-16">{day.date}</span>
                    <div className="flex-1 bg-white/5 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-sky-500 to-blue-500 h-full rounded-full flex items-center px-3"
                        style={{
                          width: `${Math.max((parseFloat(day.amount) / parseFloat(platformStats.totalDonationsETH)) * 100 * 30, 5)}%`,
                        }}
                      >
                        <span className="text-xs text-white font-semibold">{day.amount} ETH</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 w-20 text-right">{day.count} donations</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Health */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h4 className="text-lg font-semibold text-white mb-4">Donation Distribution</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Direct to Charity</span>
                      <span className="text-white font-semibold">
                        {donations.filter((d) => d.campaignId === 0).length}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(donations.filter((d) => d.campaignId === 0).length / donations.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Via Campaigns</span>
                      <span className="text-white font-semibold">
                        {donations.filter((d) => d.campaignId > 0).length}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{
                          width: `${(donations.filter((d) => d.campaignId > 0).length / donations.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h4 className="text-lg font-semibold text-white mb-4">Active Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Charities</span>
                    <span className="text-white font-bold text-xl">{platformStats.totalCharities}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Campaigns</span>
                    <span className="text-white font-bold text-xl">{platformStats.totalCampaigns}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Active Donors</span>
                    <span className="text-white font-bold text-xl">{platformStats.totalDonors}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h4 className="text-lg font-semibold text-white mb-4">Performance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Avg Donation</span>
                    <span className="text-green-400 font-bold text-xl">{platformStats.averageDonation} ETH</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total Volume</span>
                    <span className="text-green-400 font-bold text-xl">
                      {parseFloat(platformStats.totalDonationsETH).toFixed(2)} ETH
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Transactions</span>
                    <span className="text-blue-400 font-bold text-xl">{platformStats.totalDonations}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
