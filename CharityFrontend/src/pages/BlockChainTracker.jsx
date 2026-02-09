import React, { useState } from "react";
import { ethers } from "ethers";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTheme } from "../contexts/ThemeContext";
import { useWallet } from "../contexts/WalletContext";
import { FaSearch, FaKey, FaChartArea, FaCheckCircle, FaExternalLinkAlt, FaWallet, FaCoins } from "react-icons/fa";
import { getDonationReceipt, getUserDonations } from "../service/HistoryService";

const BlockchainTrackerPage = () => {
  const { isDark } = useTheme();
  const { contract } = useWallet();
  const [trackingId, setTrackingId] = useState("");
  const [searchType, setSearchType] = useState("txHash"); // txHash, wallet
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Component Colors
  const themeClasses = isDark ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900";
  const primaryHighlight = isDark ? "text-blue-400" : "text-blue-600";
  const lightBg = isDark ? "bg-zinc-800" : "bg-gray-50";
  const darkBg = isDark ? "bg-zinc-950" : "bg-white";
  const btnColor = "bg-green-500 hover:bg-green-600 text-white shadow-md transition duration-200";

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchPerformed(true);
    setLoading(true);
    setError("");
    setTrackingResult(null);

    try {
      if (searchType === "txHash") {
        // Search by transaction hash
        await searchByTransactionHash(trackingId);
      } else {
        // Search by wallet address
        await searchByWallet(trackingId);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Failed to fetch transaction data");
    } finally {
      setLoading(false);
    }
  };

  const searchByTransactionHash = async (txHash) => {
    if (!txHash.startsWith("0x") || txHash.length !== 66) {
      setError("Invalid transaction hash format. Should be 66 characters starting with 0x");
      return;
    }

    try {
      // Try to get from backend first
      const backendData = await getDonationReceipt(txHash);

      if (backendData) {
        // Parse backend data
        const result = {
          type: "donation",
          txHash: backendData.txHash,
          donor: backendData.donorAddress,
          charity: backendData.charityName,
          campaign: backendData.campaignTitle || "Direct Donation",
          amount: backendData.amount,
          timestamp: new Date(backendData.timestamp),
          blockNumber: backendData.blockNumber,
          message: backendData.message,
          isAnonymous: backendData.isAnonymous,
          status: "Confirmed",
        };
        setTrackingResult(result);
        return;
      }
    } catch (backendError) {
      console.log("Backend not available, trying blockchain...");
    }

    // Fallback to blockchain
    if (!contract) {
      setError("Please connect your wallet to search blockchain");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      const receipt = await provider.getTransactionReceipt(txHash);

      if (!receipt) {
        setError("Transaction not found on blockchain");
        return;
      }

      const tx = await provider.getTransaction(txHash);

      // Parse logs to find donation event
      const donationEvent = receipt.logs.find((log) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === "DonationReceived";
        } catch {
          return false;
        }
      });

      if (donationEvent) {
        const parsed = contract.interface.parseLog(donationEvent);
        const charityId = Number(parsed.args.charityId);
        const campaignId = Number(parsed.args.campaignId);

        // Get charity details
        const charity = await contract.charities(charityId);
        let campaign = null;

        if (campaignId > 0) {
          campaign = await contract.campaigns(campaignId);
        }

        const result = {
          type: "donation",
          txHash: tx.hash,
          donor: parsed.args.donor,
          charity: charity.name,
          campaign: campaign ? campaign.title : "Direct Donation",
          amount: ethers.formatEther(parsed.args.amount),
          timestamp: new Date(receipt.blockNumber * 1000), // Approximate
          blockNumber: receipt.blockNumber,
          status: receipt.status === 1 ? "Confirmed" : "Failed",
        };

        setTrackingResult(result);
      } else {
        setError("Transaction found but is not a donation transaction");
      }
    } catch (blockchainError) {
      console.error("Blockchain error:", blockchainError);
      setError("Failed to fetch transaction from blockchain");
    }
  };

  const searchByWallet = async (walletAddress) => {
    if (!ethers.isAddress(walletAddress)) {
      setError("Invalid wallet address format");
      return;
    }

    try {
      // Get from backend
      const donations = await getUserDonations(walletAddress);

      if (donations && donations.length > 0) {
        const result = {
          type: "wallet",
          address: walletAddress,
          donations: donations.map((d) => ({
            txHash: d.txHash,
            charity: d.charityName,
            campaign: d.campaignTitle || "Direct Donation",
            amount: d.amount,
            timestamp: new Date(d.timestamp),
            blockNumber: d.blockNumber,
          })),
          totalDonated: donations.reduce((sum, d) => sum + parseFloat(d.amount), 0).toFixed(4),
          donationCount: donations.length,
        };
        setTrackingResult(result);
        return;
      }
    } catch (backendError) {
      console.log("Backend not available, trying blockchain...");
    }

    // Fallback to blockchain
    if (!contract) {
      setError("Please connect your wallet to search blockchain");
      return;
    }

    try {
      const donorHistory = await contract.getDonorHistory(walletAddress);

      if (donorHistory.length === 0) {
        setError("No donations found for this wallet address");
        return;
      }

      const donations = [];
      let totalDonated = 0;

      for (let charityId of donorHistory) {
        const charity = await contract.charities(charityId);
        const charityDonations = await contract.getCharityDonations(charityId);

        const userDonations = charityDonations.filter((d) => d.donor.toLowerCase() === walletAddress.toLowerCase());

        for (let donation of userDonations) {
          const amount = parseFloat(ethers.formatEther(donation.amount));
          totalDonated += amount;

          donations.push({
            charity: charity.name,
            campaign: Number(donation.campaignId) > 0 ? `Campaign #${donation.campaignId}` : "Direct Donation",
            amount: amount.toString(),
            timestamp: new Date(Number(donation.timestamp) * 1000),
          });
        }
      }

      const result = {
        type: "wallet",
        address: walletAddress,
        donations: donations,
        totalDonated: totalDonated.toFixed(4),
        donationCount: donations.length,
      };

      setTrackingResult(result);
    } catch (blockchainError) {
      console.error("Blockchain error:", blockchainError);
      setError("Failed to fetch wallet data from blockchain");
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses} flex flex-col`}>
      <Header />

      <main className="flex-grow">
        {/* Tracker Input Section */}
        <section className={`py-16 md:py-24 text-center ${lightBg}`}>
          <div className="max-w-4xl mx-auto px-6">
            <FaKey className={`w-12 h-12 mx-auto mb-4 ${primaryHighlight}`} />
            <h1 className={`text-4xl md:text-5xl font-extrabold mb-3 ${isDark ? "text-white" : "text-zinc-800"}`}>
              Blockchain Transaction Tracker
            </h1>
            <p className={`text-xl mb-8 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Track your donations on the blockchain - 100% transparent and verifiable
            </p>

            {/* Search Type Toggle */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                type="button"
                onClick={() => setSearchType("txHash")}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  searchType === "txHash"
                    ? "bg-blue-600 text-white"
                    : isDark
                      ? "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FaSearch className="inline mr-2" />
                Transaction Hash
              </button>
              <button
                type="button"
                onClick={() => setSearchType("wallet")}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  searchType === "wallet"
                    ? "bg-blue-600 text-white"
                    : isDark
                      ? "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FaWallet className="inline mr-2" />
                Wallet Address
              </button>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col md:flex-row justify-center gap-4">
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder={
                  searchType === "txHash" ? "Paste Transaction Hash (0x...)" : "Paste Wallet Address (0x...)"
                }
                className={`w-full max-w-lg p-3 border rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-zinc-700 border-zinc-600 text-white" : "bg-white border-gray-300 text-zinc-800"
                }`}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold ${
                  loading ? "bg-gray-400 cursor-not-allowed" : btnColor
                }`}
              >
                <FaSearch />
                <span>{loading ? "Searching..." : "Track"}</span>
              </button>
            </form>

            {/* Helper Text */}
            <p className="text-sm text-gray-500 mt-4">
              {searchType === "txHash"
                ? "Enter the transaction hash from your donation confirmation"
                : "Enter your wallet address to see all your donations"}
            </p>
          </div>
        </section>

        {/* Search Results Display */}
        <section className={`py-16 ${darkBg}`}>
          <div className="max-w-6xl mx-auto px-6">
            {loading && (
              <div className="text-center p-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4" />
                <p className={isDark ? "text-zinc-400" : "text-zinc-600"}>Searching blockchain...</p>
              </div>
            )}

            {error && !loading && (
              <div
                className={`p-6 text-center rounded-lg border-l-4 border-red-500 ${
                  isDark ? "bg-zinc-800" : "bg-red-50"
                }`}
              >
                <p className="font-semibold text-lg text-red-600">{error}</p>
              </div>
            )}

            {trackingResult && !loading && (
              <>
                {trackingResult.type === "donation" ? (
                  <TransactionDetails result={trackingResult} isDark={isDark} />
                ) : (
                  <WalletDetails result={trackingResult} isDark={isDark} />
                )}
              </>
            )}

            {!searchPerformed && !loading && (
              <div className="text-center p-12">
                <FaChartArea className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-zinc-700" : "text-gray-300"}`} />
                <p className={isDark ? "text-zinc-400" : "text-zinc-500"}>
                  Your results will appear here after a successful search.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

// Helper component to display single transaction details
const TransactionDetails = ({ result, isDark }) => {
  const cardBg = isDark ? "bg-zinc-800" : "bg-white";
  const statusColor = result.status === "Confirmed" ? "text-green-500" : "text-yellow-500";

  return (
    <div className={`p-8 rounded-xl shadow-2xl ${cardBg}`}>
      <h2 className={`text-3xl font-bold mb-6 ${isDark ? "text-white" : "text-zinc-800"}`}>
        Donation Transaction Details
      </h2>

      <div className="grid md:grid-cols-2 gap-y-4 gap-x-8 mb-8 pb-6 border-b border-gray-300/50">
        <p className="font-medium">
          Status: <span className={`font-extrabold ${statusColor}`}>{result.status}</span>
        </p>
        <p className="font-medium">
          Amount: <span className="font-bold text-green-600">{result.amount} ETH</span>
        </p>
        <p className="font-medium">
          Charity: <span className="font-bold">{result.charity}</span>
        </p>
        <p className="font-medium">
          Campaign: <span className="font-bold">{result.campaign}</span>
        </p>
        <p className="font-medium">
          Donor:{" "}
          <span className="font-mono text-sm">
            {result.donor?.slice(0, 10)}...{result.donor?.slice(-8)}
          </span>
        </p>
        <p className="font-medium">
          Date: <span className="font-bold">{result.timestamp?.toLocaleString()}</span>
        </p>
      </div>

      {/* Transaction Hash */}
      <div className="mb-6">
        <p className="font-medium mb-2">Transaction Hash:</p>
        <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-zinc-900 rounded-lg">
          <code className="flex-1 text-sm text-white font-mono overflow-x-auto">{result.txHash}</code>
          <a
            href={`https://sepolia.etherscan.io/tx/${result.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700"
          >
            <FaExternalLinkAlt />
          </a>
        </div>
      </div>

      {/* Message if available */}
      {result.message && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
          <p className="font-medium mb-1">Donor Message:</p>
          <p className="text-sm italic">"{result.message}"</p>
        </div>
      )}

      {/* Blockchain Verification */}
      <h3 className={`text-2xl font-semibold mb-4 ${isDark ? "text-blue-300" : "text-blue-700"}`}>
        Blockchain Verification
      </h3>
      <ol className="relative border-l border-gray-400/50 space-y-6 ml-3">
        <li className="ml-6">
          <span
            className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ${cardBg} ${
              isDark ? "ring-zinc-950" : "ring-white"
            } bg-green-500 text-white`}
          >
            <FaCheckCircle className="w-3 h-3" />
          </span>
          <h4 className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-800"}`}>Transaction Initiated</h4>
          <time className={`block mb-2 text-sm ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
            Donation sent from wallet
          </time>
        </li>
        <li className="ml-6">
          <span
            className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ${cardBg} ${
              isDark ? "ring-zinc-950" : "ring-white"
            } bg-green-500 text-white`}
          >
            <FaCheckCircle className="w-3 h-3" />
          </span>
          <h4 className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-800"}`}>
            Smart Contract Executed
          </h4>
          <time className={`block mb-2 text-sm ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
            Funds locked in charity contract
          </time>
        </li>
        <li className="ml-6">
          <span
            className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ${cardBg} ${
              isDark ? "ring-zinc-950" : "ring-white"
            } bg-green-500 text-white`}
          >
            <FaCheckCircle className="w-3 h-3" />
          </span>
          <h4 className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-800"}`}>Blockchain Confirmed</h4>
          <time className={`block mb-2 text-sm ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
            Block #{result.blockNumber}
          </time>
        </li>
        <li className="ml-6">
          <span
            className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ${cardBg} ${
              isDark ? "ring-zinc-950" : "ring-white"
            } bg-green-500 text-white`}
          >
            <FaCheckCircle className="w-3 h-3" />
          </span>
          <h4 className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-800"}`}>
            Funds Available for Charity
          </h4>
          <time className={`block mb-2 text-sm ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
            Ready for withdrawal by {result.charity}
          </time>
        </li>
      </ol>
    </div>
  );
};

// Helper component to display wallet donation history
const WalletDetails = ({ result, isDark }) => {
  const cardBg = isDark ? "bg-zinc-800" : "bg-white";

  return (
    <div className={`p-8 rounded-xl shadow-2xl ${cardBg}`}>
      <h2 className={`text-3xl font-bold mb-6 ${isDark ? "text-white" : "text-zinc-800"}`}>Wallet Donation History</h2>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Donated</p>
          <p className="text-2xl font-bold text-green-600">{result.totalDonated} ETH</p>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Donations</p>
          <p className="text-2xl font-bold text-blue-600">{result.donationCount}</p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Wallet Address</p>
          <p className="text-sm font-mono">
            {result.address.slice(0, 10)}...{result.address.slice(-8)}
          </p>
        </div>
      </div>

      {/* Donations List */}
      <h3 className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-zinc-800"}`}>All Donations</h3>
      <div className="space-y-4">
        {result.donations.map((donation, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${isDark ? "bg-zinc-700 border-zinc-600" : "bg-gray-50 border-gray-200"}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-lg">{donation.charity}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{donation.campaign}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">{donation.amount} ETH</p>
                <p className="text-xs text-gray-500">{donation.timestamp?.toLocaleDateString()}</p>
              </div>
            </div>
            {donation.txHash && (
              <a
                href={`https://etherscan.io/tx/${donation.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View on Etherscan <FaExternalLinkAlt className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockchainTrackerPage;
