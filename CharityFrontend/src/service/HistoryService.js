import axios from "axios";

// Update this with your actual backend URL
const API_BASE_URL = "http://localhost:8080/api";
// process.env.REACT_APP_API_URL ||
// Transaction History Service
export const saveTransactionHistory = async (transactionData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/transactions`, {
      txHash: transactionData.txHash,
      fromAddress: transactionData.from,
      toAddress: transactionData.to,
      amount: transactionData.amount,
      type: transactionData.type, // 'donation', 'withdrawal', 'charity_registration', 'campaign_creation', 'fee_update', 'status_change'
      charityId: transactionData.charityId,
      campaignId: transactionData.campaignId,
      status: transactionData.status, // 'pending', 'success', 'failed'
      blockNumber: transactionData.blockNumber,
      timestamp: transactionData.timestamp || new Date().toISOString(),
      metadata: transactionData.metadata, // Additional data
    });
    return response.data;
  } catch (error) {
    console.error("Error saving transaction:", error);
    throw error;
  }
};

// Donation Tracking Service
export const saveDonation = async (donationData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/donations`, {
      txHash: donationData.txHash,
      donorAddress: donationData.donorAddress,
      charityId: donationData.charityId,
      charityName: donationData.charityName,
      campaignId: donationData.campaignId,
      campaignTitle: donationData.campaignTitle,
      amount: donationData.amount,
      amountInUSD: donationData.amountInUSD, // Optional: convert ETH to USD
      timestamp: donationData.timestamp || new Date().toISOString(),
      blockNumber: donationData.blockNumber,
      message: donationData.message, // Optional donor message
      isAnonymous: donationData.isAnonymous || false,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving donation:", error);
    throw error;
  }
};

// Get user's donation history
export const getUserDonations = async (walletAddress) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/donations/user/${walletAddress}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user donations:", error);
    throw error;
  }
};

// Get charity donation history
export const getCharityDonations = async (charityId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/donations/charity/${charityId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching charity donations:", error);
    throw error;
  }
};

// Get campaign donation history
export const getCampaignDonations = async (campaignId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/donations/campaign/${campaignId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching campaign donations:", error);
    throw error;
  }
};

// Get all transactions for a user
export const getUserTransactions = async (walletAddress) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/transactions/user/${walletAddress}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    throw error;
  }
};

// Get platform statistics
export const getPlatformStatistics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/statistics`);
    return response.data;
  } catch (error) {
    console.error("Error fetching platform statistics:", error);
    throw error;
  }
};

// Get donation receipt
export const getDonationReceipt = async (txHash) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/donations/receipt/${txHash}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching donation receipt:", error);
    throw error;
  }
};

// Generate donation certificate/receipt PDF
export const generateDonationCertificate = async (txHash) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/donations/certificate/${txHash}`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw error;
  }
};

// Get donor leaderboard
export const getDonorLeaderboard = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/donations/leaderboard?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};

// Export donation history as CSV
export const exportDonationHistory = async (walletAddress) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/donations/export/${walletAddress}`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error exporting donation history:", error);
    throw error;
  }
};

// Save withdrawal record
export const saveWithdrawal = async (withdrawalData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/withdrawals`, {
      txHash: withdrawalData.txHash,
      charityId: withdrawalData.charityId,
      charityName: withdrawalData.charityName,
      amount: withdrawalData.amount,
      fee: withdrawalData.fee,
      netAmount: withdrawalData.netAmount,
      timestamp: withdrawalData.timestamp || new Date().toISOString(),
      blockNumber: withdrawalData.blockNumber,
      toAddress: withdrawalData.toAddress,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving withdrawal:", error);
    throw error;
  }
};

// Get charity withdrawal history
export const getCharityWithdrawals = async (charityId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/withdrawals/charity/${charityId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    throw error;
  }
};

export default {
  saveTransactionHistory,
  saveDonation,
  getUserDonations,
  getCharityDonations,
  getCampaignDonations,
  getUserTransactions,
  getPlatformStatistics,
  getDonationReceipt,
  generateDonationCertificate,
  getDonorLeaderboard,
  exportDonationHistory,
  saveWithdrawal,
  getCharityWithdrawals,
};
