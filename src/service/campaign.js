import axios from "axios";
export const saveCampaignToBackend = async (campaignData, walletAddresss, charityName) => {
  const dataWithAddress = {
    ...campaignData,
    walletAddress: walletAddresss,
    raisedAmount: 0,
    charityName: charityName,
  };
  try {
    console.log("saving to dackend");
    console.log(dataWithAddress);
    const response = await axios.post("http://localhost:8080/api/campaign", dataWithAddress);
    return response.data;
  } catch (error) {
    console.error("Error saving campaign to backend:", error);
    throw error;
  }
};

export const getAllActiveCampaigns = async () => {
  try {
    const response = await axios.get("http://localhost:8080/api/campaign/active");
    return response.data;
  } catch (error) {
    console.error("Error fetching active campaigns from backend:", error);
    return [];
  }
};

export const updateCampaignRaisedAmount = async (campaignId, newRaisedAmount) => {
  try {
    const response = await axios.put(`http://localhost:8080/api/campaign/${campaignId}/updateRaisedAmount`, {
      raisedAmount: newRaisedAmount,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating campaign raised amount:", error);
    throw error;
  }
};

export const markCampaignAsCompleted = async (campaignId) => {
  try {
    const response = await axios.put(`http://localhost:8080/api/campaign/${campaignId}/complete`);
    return response.data;
  } catch (error) {
    console.error("Error marking campaign as completed:", error);
    throw error;
  }
};
export const getCampaignById = async (campaignId) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/campaign/${campaignId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching campaign by ID from backend:", error);
    return null;
  }
};
export const getCampaignsByCharityWallet = async (walletAddress) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/campaign/charity/${walletAddress}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching campaigns by charity wallet from backend:", error);
    return [];
  }
};
