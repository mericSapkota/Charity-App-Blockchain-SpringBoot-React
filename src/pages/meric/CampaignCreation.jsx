import React, { useState, useEffect, use } from "react";
import { ethers } from "ethers";
import { Wallet, Rocket, Calendar, Target, AlertCircle, DollarSign, AlertTriangle } from "lucide-react";

import { useWallet } from "../../contexts/WalletContext";
import { saveCampaignToBackend } from "../../service/campaign";

export default function CampaignCreation() {
  const { contract, account } = useWallet();
  const [userCharityId, setUserCharityId] = useState(null);
  const [charityInfo, setCharityInfo] = useState(null);
  const [userCharityName, setUserCharityName] = useState("");

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
  const [txStatus, setTxStatus] = useState("idle");

  // Withdrawal states
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [charityBalance, setCharityBalance] = useState("0");

  // Connect wallet and check charity ownership
  useEffect(() => {
    if (contract && account) {
      checkCharityOwnership(contract, account);
      loadCampaigns(contract);
    }
  }, [contract, account]);

  // Load charity balance when userCharityId changes
  useEffect(() => {
    if (contract && userCharityId) {
      loadCharityBalance();
    }
  }, [contract, userCharityId, campaigns]); // Reload when campaigns update

  // Check if connected wallet owns any charity
  const checkCharityOwnership = async (contractInstance, walletAddress) => {
    try {
      const count = await contractInstance.charityCount();

      for (let i = 1; i <= Number(count); i++) {
        const charity = await contractInstance.charities(i);

        if (charity.wallet.toLowerCase() === walletAddress.toLowerCase()) {
          setUserCharityId(i);
          setUserCharityName(charity.name);
          setCharityInfo({
            id: i,
            name: charity.name,
            description: charity.description,
            isActive: charity.isActive,
          });
          return;
        }
      }

      setUserCharityId(null);
      setCharityInfo(null);
    } catch (error) {
      console.error("Error checking charity ownership:", error);
    }
  };

  // Load charity balance
  const loadCharityBalance = async () => {
    try {
      const balance = await contract.getCharityBalance(userCharityId);
      setCharityBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error("Error loading charity balance:", error);
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
          deadline: new Date(Number(campaign.deadline) * 1000),
          deadlineStr: new Date(Number(campaign.deadline) * 1000).toLocaleDateString(),
          isActive: campaign.isActive,
          hasEnded: Number(campaign.deadline) * 1000 < Date.now(),
        });
      }

      setCampaigns(campaignList);
    } catch (error) {
      console.error("Error loading campaigns:", error);
    }
  };

  useEffect(() => {
    if (contract) {
      setupEventListeners(contract);

      return () => {
        contract.removeAllListeners("CampaignCreated");
        contract.removeAllListeners("FundsWithdrawn");
      };
    }
  }, [contract]);

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

    // Listen for withdrawal events
    contractInstance.on("FundsWithdrawn", (charityId, to, amount, event) => {
      const newEvent = {
        type: "FundsWithdrawn",
        charityId: charityId.toString(),
        to: to,
        amount: ethers.formatEther(amount),
        timestamp: new Date().toLocaleTimeString(),
      };

      setEvents((prev) => [newEvent, ...prev].slice(0, 10));
      if (Number(charityId) === userCharityId) {
        loadCharityBalance();
      }
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
      setTxStatus("pending");
      setShowLoader(true);

      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      saveCampaignToBackend(formData, account, userCharityName);

      setTxStatus("success");

      setTimeout(() => {
        setShowLoader(false);
        setTxHash("");
        setTxStatus("idle");
      }, 2000);

      setFormData({ title: "", description: "", goalAmount: "", durationDays: "" });
    } catch (error) {
      console.error("Error creating campaign:", error);
      setTxStatus("idle");
      setShowLoader(false);
      alert("Failed to create campaign: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Withdraw funds
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (parseFloat(withdrawAmount) > parseFloat(charityBalance)) {
      alert("Insufficient balance");
      return;
    }

    setLoading(true);

    try {
      const amountInWei = ethers.parseEther(withdrawAmount);

      const tx = await contract.withdrawFunds(userCharityId, amountInWei);

      console.log("Withdrawal transaction sent:", tx.hash);
      setTxHash(tx.hash);
      setTxStatus("pending");
      setShowLoader(true);

      const receipt = await tx.wait();
      console.log("Withdrawal confirmed:", receipt);

      setTxStatus("success");

      setTimeout(() => {
        setShowLoader(false);
        setTxHash("");
        setTxStatus("idle");
      }, 2000);

      setWithdrawAmount("");
      await loadCharityBalance();

      alert(`Successfully withdrew ${withdrawAmount} ETH`);
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      setTxStatus("idle");
      setShowLoader(false);
      alert("Withdrawal failed: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Emergency withdraw (only for contract owner)
  const handleEmergencyWithdraw = async () => {
    if (!window.confirm("⚠️ EMERGENCY WITHDRAW: This will withdraw ALL contract funds. Are you absolutely sure?")) {
      return;
    }

    setLoading(true);

    try {
      const tx = await contract.emergencyWithdraw();

      console.log("Emergency withdrawal transaction sent:", tx.hash);
      setTxHash(tx.hash);
      setTxStatus("pending");
      setShowLoader(true);

      const receipt = await tx.wait();
      console.log("Emergency withdrawal confirmed:", receipt);

      setTxStatus("success");

      setTimeout(() => {
        setShowLoader(false);
        setTxHash("");
        setTxStatus("idle");
      }, 2000);

      await loadCharityBalance();

      alert("Emergency withdrawal successful");
    } catch (error) {
      console.error("Error during emergency withdrawal:", error);
      setTxStatus("idle");
      setShowLoader(false);
      alert("Emergency withdrawal failed: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      {showLoader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`bg-white rounded-lg p-8 max-w-sm w-full mx-4 ${txStatus === "success" ? "border-4 border-green-500" : ""}`}
          >
            {txStatus === "pending" && (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mb-4" />
                <p className="text-xl font-bold text-gray-800">Transaction in Progress</p>
              </div>
            )}

            {txStatus === "success" && (
              <div className="flex flex-col items-center">
                <div className="text-6xl text-green-500 mb-4">✓</div>
                <p className="text-xl font-bold text-gray-800">Transaction Confirmed!</p>
              </div>
            )}

            {txHash && (
              <p className="text-sm text-gray-600 mt-3 font-mono text-center">
                {txHash.slice(0, 6)}...{txHash.slice(-4)}
              </p>
            )}

            <p className="text-sm text-gray-500 mt-2 text-center">
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
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
              Please connect your wallet to continue
            </div>
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
                  <p className="text-sm text-green-700 font-bold mt-1">Available Balance: {charityBalance} ETH</p>
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

          {/* Withdraw Funds Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign size={24} />
              Withdraw Funds
            </h2>

            {!userCharityId ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600">
                Connect a charity wallet to withdraw funds
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-1">Available Balance</p>
                  <p className="text-3xl font-bold text-blue-900">{charityBalance} ETH</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Withdrawal Amount (ETH)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount to withdraw"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => setWithdrawAmount(charityBalance)}
                    className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                  >
                    Withdraw Max
                  </button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs">
                  <p className="text-yellow-800">ℹ️ Platform fee will be deducted from withdrawal amount</p>
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={loading || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Withdraw Funds"}
                </button>

                {/* Emergency Withdraw - Only show for contract owner */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleEmergencyWithdraw}
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm"
                  >
                    <AlertTriangle size={16} />
                    Emergency Withdraw (Owner Only)
                  </button>
                  <p className="text-xs text-gray-500 mt-1 text-center">Only contract owner can use this</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Events */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Events</h2>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-gray-500 text-sm">No events yet</p>
            ) : (
              events.map((event, idx) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-3 ${
                    event.type === "CampaignCreated" ? "bg-purple-50 border-purple-200" : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`font-semibold ${
                        event.type === "CampaignCreated" ? "text-purple-800" : "text-green-800"
                      }`}
                    >
                      {event.type === "CampaignCreated" ? "Campaign Created" : "Funds Withdrawn"}
                    </span>
                    <span className="text-xs text-gray-500">{event.timestamp}</span>
                  </div>
                  {event.type === "CampaignCreated" ? (
                    <>
                      <p className="text-sm text-gray-700">
                        <strong>Title:</strong> {event.title}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Goal:</strong> {event.goalAmount} ETH
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-700">
                      <strong>Amount:</strong> {event.amount} ETH
                    </p>
                  )}
                </div>
              ))
            )}
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
                    <div className="flex flex-col gap-1">
                      <span
                        className={`px-2 py-1 rounded text-xs ${campaign.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {campaign.isActive ? "Active" : "Ended"}
                      </span>
                      {campaign.hasEnded && (
                        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">Expired</span>
                      )}
                    </div>
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
                      <span>{campaign.deadlineStr}</span>
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
