import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTheme } from "../contexts/ThemeContext";
import { useWallet } from "../contexts/WalletContext";
import { loadCharities } from "../service/registerapi";
import { ethers } from "ethers";
import { FaWallet, FaHandHoldingUsd, FaHistory, FaEthereum } from "react-icons/fa";

const CharityDashboard = () => {
  const { isDark } = useTheme();
  const { account, contract, connectWallet } = useWallet();
  const [myCharity, setMyCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  // Theme colors
  const themeClasses = isDark ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900";
  const cardBg = isDark ? "bg-zinc-800" : "bg-white";
  const btnColor = "bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition duration-200";

  useEffect(() => {
    if (contract && account) {
      findMyCharity();
    } else {
        setLoading(false);
    }
  }, [contract, account]);

  const findMyCharity = async () => {
    setLoading(true);
    try {
      const allCharities = await loadCharities(contract);
      const found = allCharities.find(
        (c) => c.wallet.toLowerCase() === account.toLowerCase()
      );
      setMyCharity(found);
    } catch (error) {
      console.error("Failed to load charity info", error);
    }
    setLoading(false);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!myCharity || !withdrawAmount) return;

    try {
      setProcessing(true);
      const amountInWei = ethers.parseEther(withdrawAmount);
      // withdrawFunds(uint256 _charityId, uint256 _amount)
      const tx = await contract.withdrawFunds(myCharity.id, amountInWei);
      await tx.wait();
      alert("Withdrawal successful!");
      setWithdrawAmount("");
      findMyCharity(); // Refresh balance
    } catch (error) {
      console.error(error);
      alert("Withdrawal failed: " + (error.reason || error.message));
    }
    setProcessing(false);
  };

  if (!account) {
    return (
      <div className={`min-h-screen ${themeClasses} flex flex-col`}>
        <Header />
        <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Please connect your wallet</h2>
                <button
                    onClick={connectWallet}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold"
                >
                    Connect Wallet
                </button>
            </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
     return (
        <div className={`min-h-screen ${themeClasses} flex flex-col`}>
          <Header />
          <div className="flex-grow flex items-center justify-center">
             <p>Loading dashboard...</p>
          </div>
          <Footer />
        </div>
      );
  }

  if (!myCharity) {
    return (
        <div className={`min-h-screen ${themeClasses} flex flex-col`}>
          <Header />
            <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
             <h2 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h2>
             <p>No registered charity found for wallet: {account}</p>
             <p className="mt-4 text-sm text-gray-500">If you believe this is an error, contacting support.</p>
          </div>
          <Footer />
        </div>
      );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses} flex flex-col`}>
      <Header />

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
                 <h1 className="text-3xl font-extrabold mb-2">Charity Dashboard</h1>
                 <p className={isDark ? "text-zinc-400" : "text-zinc-600"}>
                    Manage your funds for: <span className="font-bold text-blue-500">{myCharity.name}</span>
                 </p>
            </div>
             <div className="px-4 py-2 rounded-full border border-blue-500 text-sm font-mono">
                {myCharity.wallet.slice(0, 6)}...{myCharity.wallet.slice(-4)}
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
             {/* Stats Card */}
             <div className={`p-8 rounded-xl shadow-lg ${cardBg}`}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FaWallet className="text-green-500" /> Financial Overview
                </h3>
                
                <div className="space-y-6">
                    <div>
                        <p className={`text-sm ${isDark ? "text-zinc-400": "text-zinc-500"}`}>Total Raised</p>
                        <p className="text-3xl font-bold">{myCharity.totalReceived ? ethers.formatEther(myCharity.totalReceived) : "0.0"} ETH</p>
                    </div>
                </div>
             </div>

             {/* Withdrawal Card */}
             <div className={`p-8 rounded-xl shadow-lg ${cardBg}`}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FaHandHoldingUsd className="text-blue-500" /> Withdraw Funds
                </h3>

                <form onSubmit={handleWithdraw}>
                    <div className="mb-4">
                        <label className="block mb-2 font-medium">Amount to Withdraw (ETH)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                step="0.0001"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                className={`w-full p-3 rounded-lg border ${isDark ? "bg-zinc-700 border-zinc-600" : "bg-gray-50 border-gray-300"} pl-10`}
                                placeholder="0.00"
                                required
                            />
                            <FaEthereum className="absolute left-3 top-3.5 text-gray-400" />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={processing}
                        className={`w-full py-3 rounded-lg font-bold text-lg ${processing ? "opacity-50 cursor-not-allowed" : ""} ${btnColor}`}
                    >
                        {processing ? "Processing..." : "Withdraw Funds"}
                    </button>
                    <p className="mt-4 text-sm text-gray-500">
                        * A small platform fee may be deducted from the withdrawal.
                    </p>
                </form>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CharityDashboard;
