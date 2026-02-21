import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  Shield,
  Users,
  TrendingUp,
  Settings,
  CheckCircle,
  XCircle,
  DollarSign,
  Activity,
  AlertTriangle,
  Plus,
  Edit2,
  Eye,
  BarChart3,
  Calendar,
  Target,
  Wallet,
} from "lucide-react";
import { useWallet } from "../contexts/WalletContext";

export default function AdminDashboard() {
  const { connectWallet, contract, account, recentActivity } = useWallet();
  // State management
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Platform stats
  const [platformStats, setPlatformStats] = useState({
    totalDonations: "0",
    charityCount: 0,
    campaignCount: 0,
    platformFee: 0,
  });

  // Charities data
  const [charities, setCharities] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  // Forms
  const [showCharityForm, setShowCharityForm] = useState(false);
  const [charityForm, setCharityForm] = useState({
    wallet: "",
    name: "",
    description: "",
  });

  const [feeUpdateForm, setFeeUpdateForm] = useState("");
  const [showFeeForm, setShowFeeForm] = useState(false);

  // Transaction state
  const [txHash, setTxHash] = useState("");
  const [txStatus, setTxStatus] = useState("idle");
  const [showLoader, setShowLoader] = useState(false);

  // Initialize dashboard
  useEffect(() => {
    if (contract && account) {
      checkOwnership();
      loadDashboardData();
    }
  }, [contract, account]);

  // Check if connected account is contract owner
  const checkOwnership = async () => {
    try {
      const owner = await contract.owner();
      setIsOwner(owner.toLowerCase() === account.toLowerCase());
    } catch (error) {
      console.error("Error checking ownership:", error);
    }
  };

  // Load all dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadPlatformStats(), loadCharities(), loadCampaigns()]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load platform statistics
  const loadPlatformStats = async () => {
    try {
      const [totalDonations, charityCount, campaignCount, platformFee] = await Promise.all([
        contract.totalDonations(),
        contract.charityCount(),
        contract.campaignCount(),
        contract.platformFeePercent(),
      ]);

      setPlatformStats({
        totalDonations: ethers.formatEther(totalDonations),
        charityCount: Number(charityCount),
        campaignCount: Number(campaignCount),
        platformFee: Number(platformFee),
      });
    } catch (error) {
      console.error("Error loading platform stats:", error);
    }
  };

  // Load all charities
  const loadCharities = async () => {
    try {
      const count = await contract.charityCount();
      const charityList = [];

      for (let i = 1; i <= Number(count); i++) {
        const charity = await contract.charities(i);
        const balance = await contract.getCharityBalance(i);

        charityList.push({
          id: i,
          wallet: charity.wallet,
          name: charity.name,
          description: charity.description,
          isActive: charity.isActive,
          totalReceived: ethers.formatEther(charity.totalReceived),
          totalWithdrawn: ethers.formatEther(charity.totalWithdrawn),
          balance: ethers.formatEther(balance),
        });
      }

      setCharities(charityList);
    } catch (error) {
      console.error("Error loading charities:", error);
    }
  };

  // Load all campaigns
  const loadCampaigns = async () => {
    try {
      const count = await contract.campaignCount();
      const campaignList = [];

      for (let i = 1; i <= Number(count); i++) {
        const campaign = await contract.campaigns(i);
        const charity = await contract.charities(campaign.charityId);
        const progress = await contract.getCampaignProgress(i);

        campaignList.push({
          id: i,
          charityId: Number(campaign.charityId),
          charityName: charity.name,
          title: campaign.title,
          description: campaign.description,
          goalAmount: ethers.formatEther(campaign.goalAmount),
          raisedAmount: ethers.formatEther(campaign.raisedAmount),
          deadline: new Date(Number(campaign.deadline) * 1000),
          isActive: campaign.isActive,
          progress: Number(progress),
        });
      }

      setCampaigns(campaignList);
    } catch (error) {
      console.error("Error loading campaigns:", error);
    }
  };

  // Event listeners are centralized in WalletContext; Admin consumes `recentActivity` from context.

  // Register new charity
  const registerCharity = async () => {
    if (!charityForm.wallet || !charityForm.name || !charityForm.description) {
      alert("Please fill all fields");
      return;
    }

    if (!ethers.isAddress(charityForm.wallet)) {
      alert("Invalid wallet address");
      return;
    }

    setLoading(true);
    setShowLoader(true);
    setTxStatus("pending");

    try {
      const tx = await contract.registerCharity(charityForm.wallet, charityForm.name, charityForm.description);

      setTxHash(tx.hash);
      await tx.wait();
      setTxStatus("success");

      setTimeout(() => {
        setShowLoader(false);
        setTxHash("");
        setTxStatus("idle");
        setShowCharityForm(false);
        setCharityForm({ wallet: "", name: "", description: "" });
      }, 2000);
    } catch (error) {
      console.error("Error registering charity:", error);
      alert("Failed to register charity: " + (error.reason || error.message));
      setShowLoader(false);
      setTxStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  // Toggle charity status
  const toggleCharityStatus = async (charityId, currentStatus) => {
    setLoading(true);
    setShowLoader(true);
    setTxStatus("pending");

    try {
      const tx = await contract.setCharityStatus(charityId, !currentStatus);
      setTxHash(tx.hash);
      await tx.wait();
      setTxStatus("success");

      setTimeout(() => {
        setShowLoader(false);
        setTxHash("");
        setTxStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Error toggling charity status:", error);
      alert("Failed to update charity status: " + (error.reason || error.message));
      setShowLoader(false);
      setTxStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  // Update platform fee
  const updatePlatformFee = async () => {
    const newFee = parseInt(feeUpdateForm);
    if (isNaN(newFee) || newFee < 0 || newFee > 1000) {
      alert("Fee must be between 0 and 1000 (0% - 10%)");
      return;
    }

    setLoading(true);
    setShowLoader(true);
    setTxStatus("pending");

    try {
      const tx = await contract.setPlatformFee(newFee);
      setTxHash(tx.hash);
      await tx.wait();
      setTxStatus("success");

      setTimeout(() => {
        setShowLoader(false);
        setTxHash("");
        setTxStatus("idle");
        setShowFeeForm(false);
        setFeeUpdateForm("");
      }, 2000);
    } catch (error) {
      console.error("Error updating platform fee:", error);
      alert("Failed to update platform fee: " + (error.reason || error.message));
      setShowLoader(false);
      setTxStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  // Emergency withdraw
  const handleEmergencyWithdraw = async () => {
    if (
      !window.confirm(
        "Are you sure you want to perform an emergency withdrawal? This will withdraw ALL contract funds.",
      )
    ) {
      return;
    }

    setLoading(true);
    setShowLoader(true);
    setTxStatus("pending");

    try {
      const tx = await contract.emergencyWithdraw();
      setTxHash(tx.hash);
      await tx.wait();
      setTxStatus("success");

      setTimeout(() => {
        setShowLoader(false);
        setTxHash("");
        setTxStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Error performing emergency withdrawal:", error);
      alert("Failed to perform emergency withdrawal: " + (error.reason || error.message));
      setShowLoader(false);
      setTxStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  // Render unauthorized view
  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
          <Shield className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-4">Admin Access Required</h2>
          <p className="text-gray-300 text-center mb-6">Connect your wallet to access the admin dashboard</p>
          <button
            onClick={connectWallet}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition flex items-center justify-center gap-2"
          >
            <Wallet size={20} />
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-4">Access Denied</h2>
          <p className="text-gray-300 text-center mb-4">Only the contract owner can access this dashboard.</p>
          <p className="text-sm text-gray-400 text-center font-mono">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  bg-black">
      {/* Transaction Loader */}
      {showLoader && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            {txStatus === "pending" && (
              <>
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-lg font-semibold text-center text-gray-800">Processing Transaction</p>
              </>
            )}
            {txStatus === "success" && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-center text-gray-800">Transaction Confirmed</p>
              </>
            )}
            {txHash && (
              <p className="text-xs text-center text-gray-500 mt-2 font-mono">
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Shield className="w-10 h-10 text-blue-400" />
                Admin Dashboard
              </h1>
              <p className="text-gray-400">Contract Owner Controls</p>
            </div>
            <div className="flex items-center gap-4">
              {/* <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/20">
                <p className="text-xs text-gray-400 mb-1">Connected Wallet</p>
                <p className="text-white font-mono text-sm">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </p>
              </div> */}
              <div
                className="text-white cursor-pointer bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/20"
                onClick={() => {
                  window.location.href = "/admin/history";
                }}
              >
                History
              </div>
              <div
                className="text-white cursor-pointer bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/20"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                Back
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-sky-500/20 to-sky-600/20 backdrop-blur-lg rounded-xl p-6 border border-sky-400/30">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-sky-400" />
                <TrendingUp className="w-5 h-5 text-sky-300" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {parseFloat(platformStats.totalDonations).toFixed(4)}
              </p>
              <p className="text-sky-200 text-sm">Total Donations (ETH)</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-xl p-6 border border-green-400/30">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-green-400" />
                <Activity className="w-5 h-5 text-green-300" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{platformStats.charityCount}</p>
              <p className="text-green-200 text-sm">Registered Charities</p>
            </div>

            <div className="bg-gradient-to-br from-sky-500/20 to-sky-600/20 backdrop-blur-lg rounded-xl p-6 border border-sky-400/30">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-sky-400" />
                <BarChart3 className="w-5 h-5 text-sky-300" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{platformStats.campaignCount}</p>
              <p className="text-sky-200 text-sm">Active Campaigns</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-lg rounded-xl p-6 border border-orange-400/30">
              <div className="flex items-center justify-between mb-2">
                <Settings className="w-8 h-8 text-orange-400" />
                <Edit2 className="w-5 h-5 text-orange-300" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{platformStats.platformFee / 100}%</p>
              <p className="text-orange-200 text-sm">Platform Fee</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-2 mb-6 border border-white/20">
          <div className="flex gap-2">
            {["overview", "charities", "campaigns", "settings"].map((tab) => (
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

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-sky-400" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {recentActivity.length === 0 ? (
                    <p className="text-gray-400 text-sm">No recent activity</p>
                  ) : (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-white text-sm">{activity.message}</p>
                        <p className="text-gray-400 text-xs mt-1">{activity.timestamp}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-sky-400" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      window.location.href = "/register-charity";
                    }}
                    className="w-full bg-gradient-to-r from-sky-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-600 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Register New Charity
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("settings");
                      setShowFeeForm(true);
                    }}
                    className="w-full bg-gradient-to-r from-sky-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-600 transition flex items-center justify-center gap-2"
                  >
                    <Settings className="w-5 h-5" />
                    Update Platform Fee
                  </button>
                  <button
                    onClick={loadDashboardData}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-sky-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Activity className="w-5 h-5" />
                    Refresh Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Charities Tab */}
          {activeTab === "charities" && (
            <div className="space-y-6">
              {/* Add Charity Form */}
              {showCharityForm && (
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Plus className="w-6 h-6 text-sky-400" />
                    Register New Charity
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Wallet Address</label>
                      <input
                        type="text"
                        value={charityForm.wallet}
                        onChange={(e) => setCharityForm({ ...charityForm, wallet: e.target.value })}
                        placeholder="0x..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Charity Name</label>
                      <input
                        type="text"
                        value={charityForm.name}
                        onChange={(e) => setCharityForm({ ...charityForm, name: e.target.value })}
                        placeholder="Enter charity name"
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <textarea
                        value={charityForm.description}
                        onChange={(e) => setCharityForm({ ...charityForm, description: e.target.value })}
                        placeholder="Enter charity description"
                        rows="3"
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={registerCharity}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition disabled:opacity-50"
                      >
                        Register Charity
                      </button>
                      <button
                        onClick={() => {
                          setShowCharityForm(false);
                          setCharityForm({ wallet: "", name: "", description: "" });
                        }}
                        className="px-6 bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!showCharityForm && (
                <button
                  onClick={() => (window.location.href = "/register-charity")}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add New Charity
                </button>
              )}

              {/* Charities List */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-sky-400" />
                  All Charities ({charities.length})
                </h3>
                <div className="space-y-4">
                  {charities.map((charity) => (
                    <div
                      key={charity.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-lg font-semibold text-white">{charity.name}</h4>
                            <span className="text-xs text-gray-400">#{charity.id}</span>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{charity.description}</p>
                          <p className="text-xs text-gray-500 font-mono">{charity.wallet}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            charity.isActive
                              ? "bg-green-500/20 text-green-300 border border-green-400/30"
                              : "bg-red-500/20 text-red-300 border border-red-400/30"
                          }`}
                        >
                          {charity.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="bg-white/5 rounded p-2">
                          <p className="text-xs text-gray-400 mb-1">Total Received</p>
                          <p className="text-sm font-semibold text-white">
                            {parseFloat(charity.totalReceived).toFixed(4)} ETH
                          </p>
                        </div>
                        <div className="bg-white/5 rounded p-2">
                          <p className="text-xs text-gray-400 mb-1">Withdrawn</p>
                          <p className="text-sm font-semibold text-white">
                            {parseFloat(charity.totalWithdrawn).toFixed(4)} ETH
                          </p>
                        </div>
                        <div className="bg-white/5 rounded p-2">
                          <p className="text-xs text-gray-400 mb-1">Balance</p>
                          <p className="text-sm font-semibold text-green-300">
                            {parseFloat(charity.balance).toFixed(4)} ETH
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleCharityStatus(charity.id, charity.isActive)}
                        disabled={loading}
                        className={`w-full py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 ${
                          charity.isActive
                            ? "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-400/30"
                            : "bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-400/30"
                        }`}
                      >
                        {charity.isActive ? (
                          <>
                            <XCircle className="w-4 h-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Activate
                          </>
                        )}
                      </button>
                    </div>
                  ))}

                  {charities.length === 0 && (
                    <p className="text-gray-400 text-center py-8">No charities registered yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === "campaigns" && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-sky-400" />
                All Campaigns ({campaigns.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1">{campaign.title}</h4>
                        <p className="text-xs text-gray-400 mb-2">
                          by {campaign.charityName} (ID: {campaign.id})
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          campaign.isActive
                            ? "bg-green-500/20 text-green-300 border border-green-400/30"
                            : "bg-gray-500/20 text-gray-300 border border-gray-400/30"
                        }`}
                      >
                        {campaign.isActive ? "Active" : "Ended"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 mb-3">{campaign.description}</p>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{campaign.progress}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white/5 rounded p-2">
                        <p className="text-xs text-gray-400 mb-1">Goal</p>
                        <p className="text-sm font-semibold text-white">
                          {parseFloat(campaign.goalAmount).toFixed(4)} ETH
                        </p>
                      </div>
                      <div className="bg-white/5 rounded p-2">
                        <p className="text-xs text-gray-400 mb-1">Raised</p>
                        <p className="text-sm font-semibold text-green-300">
                          {parseFloat(campaign.raisedAmount).toFixed(4)} ETH
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Deadline: {campaign.deadline.toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}

                {campaigns.length === 0 && (
                  <p className="text-gray-400 text-center py-8 col-span-2">No campaigns created yet</p>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Platform Fee Update */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-sky-400" />
                  Platform Fee Configuration
                </h3>
                <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
                  <p className="text-sm text-gray-400 mb-2">Current Platform Fee</p>
                  <p className="text-3xl font-bold text-white">{platformStats.platformFee / 100}%</p>
                  <p className="text-xs text-gray-500 mt-1">({platformStats.platformFee} basis points)</p>
                </div>

                {showFeeForm ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Fee (basis points, 0-1000 = 0%-10%)
                      </label>
                      <input
                        type="number"
                        value={feeUpdateForm}
                        onChange={(e) => setFeeUpdateForm(e.target.value)}
                        placeholder="e.g., 250 for 2.5%"
                        min="0"
                        max="1000"
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {feeUpdateForm ? `${parseInt(feeUpdateForm) / 100}%` : "Enter value"}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={updatePlatformFee}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition disabled:opacity-50"
                      >
                        Update Fee
                      </button>
                      <button
                        onClick={() => {
                          setShowFeeForm(false);
                          setFeeUpdateForm("");
                        }}
                        className="px-6 bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowFeeForm(true)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition flex items-center gap-2"
                  >
                    <Edit2 className="w-5 h-5" />
                    Update Platform Fee
                  </button>
                )}
              </div>

              {/* Emergency Controls */}
              <div className="bg-red-500/10 backdrop-blur-lg rounded-xl p-6 border border-red-400/30">
                <h3 className="text-xl font-bold text-red-300 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  Emergency Controls
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  Emergency withdrawal will transfer all contract funds to the owner address. Use with extreme caution.
                </p>
                <button
                  onClick={handleEmergencyWithdraw}
                  disabled={loading}
                  className="bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Emergency Withdraw All Funds
                </button>
              </div>

              {/* Contract Information */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-purple-400" />
                  Contract Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-400">Owner Address</span>
                    <span className="text-white font-mono text-sm">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-400">Total Charities</span>
                    <span className="text-white font-semibold">{platformStats.charityCount}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-400">Total Campaigns</span>
                    <span className="text-white font-semibold">{platformStats.campaignCount}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Platform Fee</span>
                    <span className="text-white font-semibold">{platformStats.platformFee / 100}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
