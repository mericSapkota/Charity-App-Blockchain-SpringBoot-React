import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, Rocket, Calendar, Target, AlertCircle } from "lucide-react";

import { useWallet } from "../../contexts/WalletContext";

// Replace with your deployed contract address

export default function CampaignCreation() {
  const { connectWallet, contract, account } = useWallet();
  const [userCharityId, setUserCharityId] = useState(null);
  const [charityInfo, setCharityInfo] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goalAmount: "",
    durationDays: "",
  });

  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [events, setEvents] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [txHash, setTxHash] = useState("");

  // Connect wallet and check charity ownership
  useEffect(() => {
    if (contract && account) {
      checkCharityOwnership(contract, account);
      loadCampaigns(contract);
      setupEventListeners(contract);
    }
  }, [contract, account]);

  // Check if connected wallet owns any charity
  const checkCharityOwnership = async (contractInstance, walletAddress) => {
    try {
      const count = await contractInstance.charityCount();

      for (let i = 1; i <= Number(count); i++) {
        const charity = await contractInstance.charities(i);

        if (charity.wallet.toLowerCase() === walletAddress.toLowerCase()) {
          setUserCharityId(i);
          setCharityInfo({
            id: i,
            name: charity.name,
            description: charity.description,
            isActive: charity.isActive,
          });
          return;
        }
      }

      // No charity found for this wallet
      setUserCharityId(null);
      setCharityInfo(null);
    } catch (error) {
      console.error("Error checking charity ownership:", error);
    }
  };

  // Load all campaigns
  const loadCampaigns = async (contractInstance) => {
    try {
      const count = await contractInstance.campaignCount();
      const campaignList = [];

      for (let i = 1; i <= Number(count); i++) {
        const campaign = await contractInstance.campaigns(i);
        const charity = await contractInstance.charities(campaign.charityId);

        campaignList.push({
          id: i,
          charityId: Number(campaign.charityId),
          charityName: charity.name,
          title: campaign.title,
          description: campaign.description,
          goalAmount: ethers.formatEther(campaign.goalAmount),
          raisedAmount: ethers.formatEther(campaign.raisedAmount),
          deadline: new Date(Number(campaign.deadline) * 1000).toLocaleDateString(),
          isActive: campaign.isActive,
        });
      }

      setCampaigns(campaignList);
    } catch (error) {
      console.error("Error loading campaigns:", error);
    }
  };

  // Setup event listeners
  const setupEventListeners = (contractInstance) => {
    contractInstance.on("CampaignCreated", (campaignId, charityId, title, goalAmount, event) => {
      const newEvent = {
        type: "CampaignCreated",
        campaignId: campaignId.toString(),
        charityId: charityId.toString(),
        title: title,
        goalAmount: ethers.formatEther(goalAmount),
        timestamp: new Date().toLocaleTimeString(),
      };

      setEvents((prev) => [newEvent, ...prev].slice(0, 10));
      loadCampaigns(contractInstance);
    });
  };

  // Create campaign
  const createCampaign = async () => {
    if (!contract || !userCharityId) {
      alert("You must own a charity to create campaigns");
      return;
    }

    if (!charityInfo?.isActive) {
      alert("Your charity is not active");
      return;
    }

    if (!formData.title || !formData.description || !formData.goalAmount || !formData.durationDays) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      // Convert goal amount to wei
      const goalInWei = ethers.parseEther(formData.goalAmount);

      const tx = await contract.createCampaign(
        userCharityId,
        formData.title,
        formData.description,
        goalInWei,
        parseInt(formData.durationDays),
      );

      console.log("Transaction sent:", tx.hash);
      setTxHash(tx.hash);
      setShowLoader(true);
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      saveCampaignToBackend(formData, account);
      setTxStatus("success");

      setTimeout(() => {
        setShowLoader(false);
        setTxHash(null);
        setTxStatus("idle");
      }, 1500);
      // Clear form
      setFormData({ title: "", description: "", goalAmount: "", durationDays: "" });

      alert("Campaign created successfully!");
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      {showLoader && (
        <div className="tx-overlay">
          <div className={`tx-card ${txStatus}`}>
            {txStatus === "pending" && <div className="spinner" />}

            {txStatus === "success" && <div className="checkmark">✓</div>}

            <p className="tx-title">{txStatus === "pending" ? "Transaction in progress" : "Transaction confirmed"}</p>

            {txHash && (
              <p className="tx-hash">
                {txHash.slice(0, 6)}...{txHash.slice(-4)}
              </p>
            )}

            <p className="tx-sub">
              {txStatus === "pending" ? "Waiting for blockchain confirmation" : "Funds secured on-chain"}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Campaign Management</h1>

          {!account ? (
            <button
              onClick={connectWallet}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
            >
              <Wallet size={20} />
              Connect Wallet
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Connected:{" "}
                <span className="font-mono text-purple-600">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </p>
              {charityInfo ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="font-semibold text-green-800">Your Charity: {charityInfo.name}</p>
                  <p className="text-sm text-green-700">Charity ID: {charityInfo.id}</p>
                  <span
                    className={`inline-block mt-1 px-2 py-1 rounded text-xs ${charityInfo.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {charityInfo.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      This wallet does not own any charity. Only registered charities can create campaigns.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Campaign Creation Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Rocket size={24} />
              Create Campaign
            </h2>

            {!userCharityId || !charityInfo?.isActive ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                You need an active charity to create campaigns
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter campaign title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your campaign"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Target size={16} />
                    Goal Amount (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.goalAmount}
                    onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                    placeholder="e.g., 10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar size={16} />
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                    placeholder="e.g., 30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <button
                  onClick={createCampaign}
                  disabled={loading || !account}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Campaign"}
                </button>
              </div>
            )}
          </div>

          {/* Live Events */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Campaign Events</h2>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-gray-500 text-sm">No events yet</p>
              ) : (
                events.map((event, idx) => (
                  <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-purple-800">Campaign Created</span>
                      <span className="text-xs text-gray-500">{event.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Title:</strong> {event.title}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Goal:</strong> {event.goalAmount} ETH
                    </p>
                    <p className="text-sm text-gray-600">Campaign ID: {event.campaignId}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* All Campaigns */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">All Campaigns ({campaigns.length})</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {campaigns.length === 0 ? (
              <p className="text-gray-500">No campaigns yet</p>
            ) : (
              campaigns.map((campaign) => (
                <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">{campaign.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${campaign.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {campaign.isActive ? "Active" : "Ended"}
                    </span>
                  </div>
                  <p className="text-sm text-purple-600 mb-2">by {campaign.charityName}</p>
                  <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Goal:</span>
                      <span className="font-semibold">{campaign.goalAmount} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Raised:</span>
                      <span className="font-semibold text-green-600">{campaign.raisedAmount} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deadline:</span>
                      <span>{campaign.deadline}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((parseFloat(campaign.raisedAmount) / parseFloat(campaign.goalAmount)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
