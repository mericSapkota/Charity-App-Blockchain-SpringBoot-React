import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { FaLock, FaEthereum, FaCheckCircle, FaClock } from "react-icons/fa";
import { useWallet } from "../contexts/WalletContext";
import { saveDonation, saveTransactionHistory } from "../service/HistoryService";
import Header from "../components/Header";

const DonatePage = () => {
  const [amount, setAmount] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [donationEvents, setDonationEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [txHash, setTxHash] = useState(null);
  const [txStatus, setTxStatus] = useState("idle");
  const [showLoader, setShowLoader] = useState(false);

  // Optional fields for enhanced tracking
  const [donationMessage, setDonationMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const isDark = false;
  const themeClasses = isDark ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900";
  const primaryHighlight = isDark ? "text-blue-400" : "text-blue-600";
  const lightBg = isDark ? "bg-zinc-800" : "bg-gray-50";
  const cardBg = isDark ? "bg-zinc-800" : "bg-white";
  const btnColor = "bg-green-500 hover:bg-green-600 text-white shadow-xl transition duration-200";

  const presetAmounts = [0.01, 0.05, 0.1, 0.5];
  const { contract, account } = useWallet();

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCampaigns(campaigns);
    } else {
      const filtered = campaigns.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.charityName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredCampaigns(filtered);
    }
  }, [searchQuery, campaigns]);

  useEffect(() => {
    if (!contract) return;
    async function fetchCampaigns() {
      await loadActiveCampaigns(contract);
    }
    fetchCampaigns();
  }, [contract]);

  useEffect(() => {
    if (contract) {
      const handler = (charityId, campaignId, donor, amount, event) => {
        const newEvent = {
          campaignId: campaignId.toString(),
          donor: donor,
          amount: ethers.formatEther(amount),
          timestamp: new Date().toLocaleTimeString(),
        };

        setDonationEvents((prev) => [newEvent, ...prev].slice(0, 5));
        loadActiveCampaigns(contract);
      };

      contract.on("DonationReceived", handler);

      return () => {
        try {
          contract.off("DonationReceived", handler);
        } catch (err) {
          console.warn("Error removing DonationReceived handler:", err);
        }
      };
    }
  }, [contract]);

  const loadActiveCampaigns = async (contractInstance) => {
    try {
      const count = await contractInstance.campaignCount();
      console.log(count);
      const campaignList = [];

      for (let i = 1; i <= Number(count); i++) {
        const campaign = await contractInstance.campaigns(i);

        if (campaign.isActive && Number(campaign.deadline) * 1000 > Date.now()) {
          const charity = await contractInstance.charities(campaign.charityId);
          console.log(charity, "chariyy");
          if (charity.isActive) {
            const goalInEth = ethers.formatEther(campaign.goalAmount);
            const raisedInEth = ethers.formatEther(campaign.raisedAmount);
            const progressPercent = (parseFloat(raisedInEth) / parseFloat(goalInEth)) * 100;

            campaignList.push({
              id: i,
              charityId: Number(campaign.charityId),
              charityName: charity.name,
              charityWallet: charity.wallet,
              title: campaign.title,
              description: campaign.description,
              goalAmount: goalInEth,
              raisedAmount: raisedInEth,
              deadline: new Date(Number(campaign.deadline) * 1000),
              isActive: campaign.isActive,
              progressPercent: Math.min(progressPercent, 100),
            });
          }
        }
      }

      setCampaigns(campaignList);
      setFilteredCampaigns(campaignList);
      if (campaignList.length > 0 && !selectedCampaign) {
        setSelectedCampaign(campaignList[0]);
      }
    } catch (error) {
      console.error("Error loading campaigns:", error);
    }
  };

  // DonationPage listens using a named handler in the effect above; no global removeAllListeners.

  const handleDonate = async (e) => {
    e.preventDefault();

    if (!contract || !selectedCampaign || !amount || parseFloat(amount) <= 0) {
      alert("Please select a campaign and enter a valid amount");
      return;
    }

    setLoading(true);
    setShowLoader(true);
    setTxStatus("pending");

    try {
      const amountInWei = ethers.parseEther(amount.toString());

      // Send transaction to blockchain
      const tx = await contract.donateToCampaign(selectedCampaign.id, {
        value: amountInWei,
      });

      console.log("Transaction sent:", tx.hash);
      setTxHash(tx.hash);

      // STEP 1: Save transaction to backend immediately (status: pending)
      try {
        await saveTransactionHistory({
          txHash: tx.hash,
          from: account,
          to: selectedCampaign.charityWallet,
          amount: amount,
          type: "donation",
          charityId: selectedCampaign.charityId,
          campaignId: selectedCampaign.id,
          status: "pending",
          timestamp: new Date().toISOString(),
          metadata: JSON.stringify({
            message: donationMessage,
            isAnonymous: isAnonymous,
            campaignTitle: selectedCampaign.title,
            charityName: selectedCampaign.charityName,
          }),
        });
      } catch (backendError) {
        console.error("Failed to save pending transaction:", backendError);
        // Continue anyway - don't block the donation
      }

      // Wait for blockchain confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      setTxStatus("success");

      // STEP 2: Save donation record to backend
      try {
        const donationData = {
          txHash: tx.hash,
          donorAddress: account,
          charityId: selectedCampaign.charityId,
          charityName: selectedCampaign.charityName,
          campaignId: selectedCampaign.id,
          campaignTitle: selectedCampaign.title,
          amount: amount,
          timestamp: new Date().toISOString(),
          blockNumber: receipt.blockNumber,
          message: donationMessage,
          isAnonymous: isAnonymous,
        };

        await saveDonation(donationData);

        // STEP 3: Update transaction status to success
        await saveTransactionHistory({
          txHash: tx.hash,
          from: account,
          to: selectedCampaign.charityWallet,
          amount: amount,
          type: "donation",
          charityId: selectedCampaign.charityId,
          campaignId: selectedCampaign.id,
          status: "success",
          blockNumber: receipt.blockNumber,
          timestamp: new Date().toISOString(),
          metadata: JSON.stringify({
            message: donationMessage,
            isAnonymous: isAnonymous,
            campaignTitle: selectedCampaign.title,
            charityName: selectedCampaign.charityName,
          }),
        });

        console.log("Donation saved to backend successfully");
      } catch (backendError) {
        console.error("Failed to save donation to backend:", backendError);
        // Transaction succeeded on blockchain, just backend logging failed
        alert(
          "Donation successful on blockchain, but failed to save to history. Please contact support with transaction hash: " +
            tx.hash,
        );
      }

      // Success - reset form
      setTimeout(() => {
        setShowLoader(false);
        setTxHash("");
        setTxStatus("idle");
        setAmount("");
        setDonationMessage("");
        setIsAnonymous(false);
        setShowAdvancedOptions(false);
      }, 2000);

      // Reload campaigns to show updated amounts
      await loadActiveCampaigns(contract);
    } catch (error) {
      console.error("Error donating:", error);
      setTxStatus("failed");

      // Save failed transaction to backend
      if (txHash) {
        try {
          await saveTransactionHistory({
            txHash: txHash,
            from: account,
            to: selectedCampaign.charityWallet,
            amount: amount,
            type: "donation",
            charityId: selectedCampaign.charityId,
            campaignId: selectedCampaign.id,
            status: "failed",
            timestamp: new Date().toISOString(),
            metadata: JSON.stringify({
              error: error.message || error.reason,
              message: donationMessage,
              isAnonymous: isAnonymous,
            }),
          });
        } catch (backendError) {
          console.error("Failed to save failed transaction:", backendError);
        }
      }

      setTimeout(() => {
        setShowLoader(false);
        setTxHash("");
        setTxStatus("idle");
      }, 2000);

      alert("Donation failed: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (deadline) => {
    const days = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
      {/* Transaction Loader Modal */}
      {showLoader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`bg-white rounded-lg p-8 max-w-sm w-full mx-4 ${
              txStatus === "success"
                ? "border-4 border-green-500"
                : txStatus === "failed"
                  ? "border-4 border-red-500"
                  : ""
            }`}
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
                <p className="text-xl font-bold text-gray-800">Thank You! 🎉</p>
                <p className="text-sm text-gray-600 mt-2">Your donation has been confirmed</p>
              </div>
            )}

            {txStatus === "failed" && (
              <div className="flex flex-col items-center">
                <div className="text-6xl text-red-500 mb-4">✗</div>
                <p className="text-xl font-bold text-gray-800">Transaction Failed</p>
                <p className="text-sm text-gray-600 mt-2">Please try again</p>
              </div>
            )}

            {txHash && (
              <p className="text-sm text-gray-600 mt-3 font-mono text-center">
                {txHash.slice(0, 6)}...{txHash.slice(-4)}
              </p>
            )}

            <p className="text-sm text-gray-500 mt-2 text-center">
              {txStatus === "pending"
                ? "Waiting for blockchain confirmation"
                : txStatus === "success"
                  ? "Funds secured on-chain"
                  : "Transaction rejected"}
            </p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <Header />
      <section className={`py-16 text-center ${lightBg}`}>
        <div className="max-w-4xl mx-auto px-4">
          <h1 className={`text-4xl md:text-5xl font-extrabold mb-3 ${primaryHighlight}`}>Donate with Ethereum</h1>
          <p className={`text-lg ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            100% transparent, blockchain-verified donations
          </p>
          {account && (
            <p className="mt-4 text-sm text-gray-600">
              Connected:{" "}
              <span className="font-mono">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </p>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className={`py-16 ${isDark ? "bg-zinc-900" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-12">
          {/* LEFT: Donation Form */}
          <div className="lg:col-span-2">
            <div className={`p-8 rounded-xl shadow-2xl ${cardBg}`}>
              {/* Step 1: Choose Campaign */}
              <h2 className="text-2xl font-bold mb-4">1. Select Campaign</h2>

              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search campaigns by name or charity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? "bg-zinc-700 border-zinc-600 text-white" : "bg-white border-gray-300"
                  }`}
                />
                {searchQuery && (
                  <p className="text-sm text-gray-500 mt-2">
                    Found {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Scrollable Campaign List */}
              <div className={`space-y-4 mb-8 ${filteredCampaigns.length > 3 ? "max-h-96 overflow-y-auto pr-2" : ""}`}>
                {filteredCampaigns.length === 0 ? (
                  <p className="text-gray-500">
                    {searchQuery ? "No campaigns found matching your search" : "No active campaigns available"}
                  </p>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      onClick={() => setSelectedCampaign(campaign)}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedCampaign?.id === campaign.id
                          ? `border-blue-500 shadow-md ${isDark ? "bg-blue-900/30" : "bg-blue-50"}`
                          : `border-gray-300 ${isDark ? "bg-zinc-700 hover:bg-zinc-600" : "hover:bg-gray-100"}`
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <input
                            type="radio"
                            name="campaign"
                            checked={selectedCampaign?.id === campaign.id}
                            readOnly
                            className="mr-3 text-blue-600"
                          />
                          <span className="font-semibold text-lg">{campaign.title}</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          <FaClock className="inline mr-1" />
                          {getDaysRemaining(campaign.deadline)} days left
                        </span>
                      </div>

                      <p className={`text-sm ml-6 mb-2 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                        by <span className="font-semibold">{campaign.charityName}</span>
                      </p>

                      <p className={`text-sm ml-6 mb-3 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                        {campaign.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="ml-6">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-semibold">{campaign.raisedAmount} ETH raised</span>
                          <span className="text-gray-600">Goal: {campaign.goalAmount} ETH</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${campaign.progressPercent}%` }}
                          />
                        </div>
                        <p className="text-xs text-right mt-1 text-gray-500">
                          {campaign.progressPercent.toFixed(1)}% funded
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Step 2: Choose Amount */}
              <h2 className="text-2xl font-bold mb-4">2. Choose Amount (ETH)</h2>
              <div className="flex flex-wrap gap-3 mb-6">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className={`py-2 px-4 rounded-full border-2 font-semibold transition ${
                      parseFloat(amount) === preset
                        ? `border-green-500 ${isDark ? "bg-green-900/50 text-white" : "bg-green-100 text-green-700"}`
                        : `border-gray-300 ${isDark ? "bg-zinc-700 hover:bg-zinc-600" : "bg-gray-100 hover:bg-gray-200"}`
                    }`}
                  >
                    {preset} ETH
                  </button>
                ))}
                <input
                  type="number"
                  step="0.001"
                  placeholder="Custom"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.001"
                  className={`py-2 px-4 rounded-full border-2 w-32 text-center ${
                    isDark ? "bg-zinc-700 border-zinc-600" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              {/* Advanced Options Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="text-sm text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
              >
                {showAdvancedOptions ? "▼" : "▶"} Advanced Options
              </button>

              {/* Advanced Options */}
              {showAdvancedOptions && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                    <textarea
                      value={donationMessage}
                      onChange={(e) => setDonationMessage(e.target.value)}
                      placeholder="Leave a message of support..."
                      rows="3"
                      maxLength="500"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">{donationMessage.length}/500 characters</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="anonymous" className="text-sm text-gray-700">
                      Donate anonymously (hide my wallet address from public leaderboards)
                    </label>
                  </div>
                </div>
              )}

              {/* Summary */}
              {selectedCampaign && amount && (
                <div className="p-4 border-2 border-green-500 rounded-lg text-center my-6 bg-green-50">
                  <p className="text-lg font-bold text-gray-800">
                    Donating <span className="text-green-600">{amount} ETH</span>
                  </p>
                  <p className="text-sm text-gray-600">to {selectedCampaign.title}</p>
                  {donationMessage && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      "{donationMessage.substring(0, 50)}
                      {donationMessage.length > 50 ? "..." : ""}"
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleDonate}
                disabled={loading || !selectedCampaign || !amount || parseFloat(amount) <= 0}
                className={`w-full py-4 rounded-lg text-xl font-extrabold transition flex items-center justify-center gap-2 ${
                  selectedCampaign && amount && parseFloat(amount) > 0 && !loading
                    ? btnColor
                    : "bg-gray-400 cursor-not-allowed text-gray-700"
                }`}
              >
                <FaEthereum />
                {loading ? "Processing..." : `Donate ${amount || "0"} ETH`}
              </button>

              {/* Fee Notice */}
              <p className="text-xs text-gray-500 text-center mt-3">
                Platform fee (2.5%) is deducted when charities withdraw funds
              </p>
            </div>
          </div>

          {/* RIGHT: Transparency Info */}
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-xl border-l-4 border-green-500 sticky top-24 ${lightBg}`}>
              <FaLock className="w-8 h-8 mb-4 text-green-500" />
              <h3 className="text-xl font-bold mb-3">Blockchain Guarantee</h3>
              <ul className="space-y-3">
                <li className={`flex items-start space-x-2 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span>
                    <strong>Instant Verification:</strong> Transaction recorded on blockchain
                  </span>
                </li>
                <li className={`flex items-start space-x-2 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span>
                    <strong>100% Transparent:</strong> Track every penny to the charity
                  </span>
                </li>
                <li className={`flex items-start space-x-2 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span>
                    <strong>Smart Contract:</strong> Automated, tamper-proof distribution
                  </span>
                </li>
                <li className={`flex items-start space-x-2 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span>
                    <strong>Your Impact Tracked:</strong> View your donation history anytime
                  </span>
                </li>
              </ul>

              {/* Recent Donations */}
              {donationEvents.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-300">
                  <h4 className="font-semibold mb-2">Recent Donations</h4>
                  <div className="space-y-2">
                    {donationEvents.map((event, idx) => (
                      <div key={idx} className="text-xs bg-white p-2 rounded border">
                        <p className="font-mono text-gray-600">
                          {event.donor.slice(0, 6)}...{event.donor.slice(-4)}
                        </p>
                        <p className="font-semibold text-green-600">{event.amount} ETH</p>
                        <p className="text-gray-500">{event.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DonatePage;
