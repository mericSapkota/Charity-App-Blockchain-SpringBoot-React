import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/charityregister";

export const addRegister = (registerData) => {
  return axios.post("http://localhost:8080/api/charity/register", registerData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getAllRegisters = () => {
  return axios.get("http://localhost:8080/api/charityRequests");
};

export const approveRegister = (charityId) => {
  return axios.post(`http://localhost:8080/api/charityRequests/${charityId}/approve`);
};
export const rejectRegister = (charityId) => {
  return axios.post(`http://localhost:8080/api/charityRequests/${charityId}/reject`);
};

export const loadCharities = async (contractInstance) => {
  try {
    const count = await contractInstance.charityCount();
    let charities = [];
    for (let i = 1; i <= Number(count); i++) {
      const charity = await contractInstance.charities(i);
       // Only include active charities
      if (charity.isActive) {
        charities.push({
          id: i,
          wallet: charity.wallet,
          name: charity.name,
          description: charity.description,
          totalReceived: charity.totalReceived,
        });
      }
    }
    console.log(charities, "charities from blockchain");
    return charities;
  } catch (error) {
    console.error("Error loading charities:", error);
    return [];
  }
};
