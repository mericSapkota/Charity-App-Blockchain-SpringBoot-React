import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Heart, Wallet, TrendingUp, Users, Target, CheckCircle } from "lucide-react";

import { useWallet } from "../../contexts/WalletContext";
import { saveDonation, saveTransactionHistory } from "../../service/HistoryService";

export default function DonationPageTest() {
  const { connectWallet, contract, account } = useWallet();

  const [charities, setCharities] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [txStatus, setTxStatus] = useState("idle");
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (contract) {
      loadCharities();
      loadCampaigns();
    }
  }, [contract]);

  const loadCharities = async () => {
    try {
      const count = await contract.charityCount();
      const charityList = [];

      for (let i = 1; i <= Number(count); i++) {
        const charity = await contract.charities(i);
        if (charity.isActive) {
          charityList.push({
            id: i,
            name: charity.name,
            description: charity.description,
            wallet: charity.wallet,
            totalReceived: ethers.formatEther(charity.totalReceived),
          });
        }
      }

      setCharities(charityList);
    } catch (error) {
      console.error("Error loading charities:", error);
    }
  };

  const loadCampaigns = async () => {
    try {
      const count = await contract.campaignCount();
      const campaignList = [];

      for (let i = 1; i <= Number(count); i++) {
        const campaign = await contract.campaigns(i);
        if (campaign.isActive && Number(campaign.deadline) * 1000 > Date.now()) {
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
            progress: Number(progress),
          });
        }
      }

      setCampaigns(campaignList);
    } catch (error) {
      console.error("Error loading campaigns:", error);
    }
  };

  const handleDonate = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert("Please enter a valid donation amount");
      return;
    }

    if (!selectedCharity && !selectedCampaign) {
      alert("Please select a charity or campaign");
      return;
    }

    setLoading(true);
    setShowLoader(true);
    setTxStatus("pending");

    try {
      const amountInWei = ethers.parseEther(donationAmount);
      let tx;

      if (selectedCampaign) {
        tx = await contract.donateToCampaign(selectedCampaign.id, {
          value: amountInWei,
        });
      } else {
        tx = await contract.donateToCharity(selectedCharity.id, {
          value: amountInWei,
        });
      }

      setTxHash(tx.hash);

      // Save transaction to backend immediately
      await saveTransactionHistory({
        txHash: tx.hash,
        from: account,
        to: selectedCharity?.wallet || campaigns.find((c) => c.id === selectedCampaign?.id)?.charityName,
        amount: donationAmount,
        type: "donation",
        charityId: selectedCharity?.id || selectedCampaign?.charityId,
        campaignId: selectedCampaign?.id || 0,
        status: "pending",
        timestamp: new Date().toISOString(),
        metadata: {
          message: donationMessage,
          isAnonymous: isAnonymous,
        },
      });

      const receipt = await tx.wait();
      setTxStatus("success");

      // Save donation record to backend
      const donationData = {
        txHash: tx.hash,
        donorAddress: account,
        charityId: selectedCharity?.id || selectedCampaign?.charityId,
        charityName: selectedCharity?.name || selectedCampaign?.charityName,
        campaignId: selectedCampaign?.id || 0,
        campaignTitle: selectedCampaign?.title || null,
        amount: donationAmount,
        timestamp: new Date().toISOString(),
        blockNumber: receipt.blockNumber,
        message: donationMessage,
        isAnonymous: isAnonymous,
      };

      await saveDonation(donationData);

      // Update transaction status
      await saveTransactionHistory({
        txHash: tx.hash,
        from: account,
        to: selectedCharity?.wallet || campaigns.find((c) => c.id === selectedCampaign?.id)?.charityName,
        amount: donationAmount,
        type: "donation",
        charityId: selectedCharity?.id || selectedCampaign?.charityId,
        campaignId: selectedCampaign?.id || 0,
        status: "success",
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        metadata: {
          message: donationMessage,
          isAnonymous: isAnonymous,
        },
      });

      setTimeout(() => {
        setShowLoader(false);
        setTxHash("");
        setTxStatus("idle");
        setDonationAmount("");
        setDonationMessage("");
        setIsAnonymous(false);
        setSelectedCharity(null);
        setSelectedCampaign(null);
        loadCharities();
        loadCampaigns();
      }, 2000);
    } catch (error) {
      console.error("Error making donation:", error);

      // Update transaction as failed
      if (txHash) {
        await saveTransactionHistory({
          txHash: txHash,
          from: account,
          to: selectedCharity?.wallet || campaigns.find((c) => c.id === selectedCampaign?.id)?.charityName,
          amount: donationAmount,
          type: "donation",
          charityId: selectedCharity?.id || selectedCampaign?.charityId,
          campaignId: selectedCampaign?.id || 0,
          status: "failed",
          timestamp: new Date().toISOString(),
          metadata: {
            error: error.message,
          },
        });
      }

      alert("Donation failed: " + (error.reason || error.message));
      setShowLoader(false);
      setTxStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-900 via-pink-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
          <Heart className="w-16 h-16 text-pink-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-4">Make a Difference</h2>
          <p className="text-gray-300 text-center mb-6">Connect your wallet to start donating</p>
          <button
            onClick={connectWallet}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-rose-600 transition flex items-center justify-center gap-2"
          >
            <Wallet size={20} />
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-900 via-pink-900 to-purple-900 p-4">
      {/* Transaction Loader */}
      {showLoader && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            {txStatus === "pending" && (
              <>
                <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-lg font-semibold text-center text-gray-800">Processing Donation</p>
                <p className="text-sm text-center text-gray-600 mt-2">Please confirm in your wallet</p>
              </>
            )}
            {txStatus === "success" && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-center text-gray-800">Thank You! 🎉</p>
                <p className="text-sm text-center text-gray-600 mt-2">Your donation has been recorded</p>
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

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Heart className="w-10 h-10 text-pink-400" />
            Make a Donation
          </h1>
          <p className="text-gray-300">Support causes you care about</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Donation Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Select Charity or Campaign */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Select a Charity or Campaign</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Charities</label>
                <div className="grid gap-3">
                  {charities.map((charity) => (
                    <button
                      key={charity.id}
                      onClick={() => {
                        setSelectedCharity(charity);
                        setSelectedCampaign(null);
                      }}
                      className={`text-left p-4 rounded-lg border-2 transition ${
                        selectedCharity?.id === charity.id
                          ? "border-pink-500 bg-pink-500/20"
                          : "border-white/20 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <h4 className="font-semibold text-white mb-1">{charity.name}</h4>
                      <p className="text-sm text-gray-400">{charity.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Total Received: {parseFloat(charity.totalReceived).toFixed(4)} ETH
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Active Campaigns</label>
                <div className="grid gap-3">
                  {campaigns.map((campaign) => (
                    <button
                      key={campaign.id}
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setSelectedCharity(null);
                      }}
                      className={`text-left p-4 rounded-lg border-2 transition ${
                        selectedCampaign?.id === campaign.id
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-white/20 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-white">{campaign.title}</h4>
                          <p className="text-xs text-gray-400">{campaign.charityName}</p>
                        </div>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                          {campaign.progress}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{campaign.description}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          {parseFloat(campaign.raisedAmount).toFixed(2)} / {parseFloat(campaign.goalAmount).toFixed(2)}{" "}
                          ETH
                        </span>
                        <span>Ends: {campaign.deadline.toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Donation Details */}
            {(selectedCharity || selectedCampaign) && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Donation Details</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Amount (ETH)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Message (Optional)</label>
                    <textarea
                      value={donationMessage}
                      onChange={(e) => setDonationMessage(e.target.value)}
                      placeholder="Leave a message of support..."
                      rows="3"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-pink-500 focus:ring-pink-500"
                    />
                    <label htmlFor="anonymous" className="text-sm text-gray-300">
                      Donate anonymously
                    </label>
                  </div>

                  <button
                    onClick={handleDonate}
                    disabled={loading || !donationAmount}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-lg font-bold text-lg hover:from-pink-600 hover:to-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Heart className="w-6 h-6" />
                    Donate {donationAmount || "0"} ETH
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Your Impact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm">100% Transparent</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm">Blockchain Verified</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm">Instant Receipt</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm">Track Your Donations</span>
                </div>
              </div>
            </div>

            {selectedCharity && (
              <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-lg rounded-xl p-6 border border-pink-400/30">
                <h3 className="text-lg font-bold text-white mb-2">Donating to:</h3>
                <p className="text-xl font-bold text-pink-300">{selectedCharity.name}</p>
                <p className="text-sm text-gray-300 mt-2">{selectedCharity.description}</p>
              </div>
            )}

            {selectedCampaign && (
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl p-6 border border-purple-400/30">
                <h3 className="text-lg font-bold text-white mb-2">Supporting:</h3>
                <p className="text-xl font-bold text-purple-300">{selectedCampaign.title}</p>
                <p className="text-sm text-gray-300 mt-2">{selectedCampaign.charityName}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{selectedCampaign.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      style={{ width: `${Math.min(selectedCampaign.progress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
