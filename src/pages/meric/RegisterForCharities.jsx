import { ethers } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../../config/contract";
import { Wallet, Plus, Activity, CheckCircle, Upload, FileText } from "lucide-react";
import { addRegister, approveRegister, getAllRegisters, rejectRegister } from "../../service/registerapi";
import Header from "../../components/Header";
import { useWallet } from "../../contexts/WalletContext";
import { FaRightFromBracket } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa";

const RegisterForCharities = () => {
  const { connectWallet, account, isOwner, contract } = useWallet();
  const formLabel = "block text-sm font-medium text-gray-700 mb-1";

  const [formData, setFormData] = useState({
    wallet: "",
    name: "",
    description: "",
    logo: "",
    verification: "",
    email: "",
  });
  const [logoPreview, setLogoPreview] = useState();
  const [verificationPreview, setVerificationPreview] = useState();
  const [registrationPressed, setRegisterPressed] = useState();
  const [registeredCheck, setRegisteredCheck] = useState(false);
  const [looading, setlooading] = useState(false);
  const [events, setEvents] = useState([]);
  const [registeredCharities, setRegisteredCharities] = useState([]);

  useEffect(() => {
    if (!contract) return;

    const loadCharityAtFirst = async () => {
      console.log(contract);
      // await loadCharities(contract); yet to implement
      await getAllRegisters().then((response) => {
        console.log(response);
        setRegisteredCharities(response.data);
      });
    };

    loadCharityAtFirst();
  }, [contract]);

  const checkExistingCharity = async () => {
    console.log("contraCT", contract);

    let count = await contract.charityCount();
    for (let i = 1; i <= Number(count); i++) {
      const charity = await contract.charities(i);

      if (charity.wallet.toLowerCase() === account.toLowerCase()) {
        console.log("true");
        setRegisteredCheck(true);
        break;
      }
    }
  };

  useEffect(() => {
    if (contract) {
      checkExistingCharity();
      setupEventListeners(contract);
    }
  }, [contract]);

  function pressRegistration() {
    setFormData({
      ...formData,
      wallet: account,
    });
    setRegisterPressed(true);
  }

  const loadCharities = async (contractInstance) => {
    //load from instance
    try {
      const count = await contractInstance.charityCount();
      // const charities = await getAllRegisters();
      let charities = [];
      for (let i = 1; i <= Number(count); i++) {
        const charity = await contractInstance.charities(i);
        charities.push({
          wallet: charity.wallet,
        });
      }
      console.log(charities, "charities from blockchain");
      // setRegisteredCharities(charities);
    } catch (error) {
      console.error("Error looading charities:", error);
    }
  };

  const setupEventListeners = (contractInstance) => {
    // Listen for CharityRegistered events
    contractInstance.on("CharityRegistered", (charityId, name, wallet, event) => {
      const newEvent = {
        type: "CharityRegistered",
        charityId: charityId.toString(),
        name: name,
        wallet: wallet,
        blockNumber: event.log.blockNumber,
        timestamp: new Date().toLocaleTimeString(),
      };

      setEvents((prev) => [newEvent, ...prev].slice(0, 10)); // Keep last 10 events

      // Reload charities
      loadCharities(contractInstance);
    });
  };

  const sendRequestForCharity = async () => {
    console.log(formData);
    try {
      const response = await addRegister(formData);
      console.log(response.data);
      setRegisteredCharities((prev) => [response.data, ...prev]);
    } catch (error) {
      console.log(error);
    }
  };

  const registerCharity = async (charity) => {
    if (!contract || !isOwner) {
      alert("You must be the contract owner to register charities");
      return;
    }
    console.log(charity);
    if (!ethers.isAddress(charity.wallet)) {
      alert("Invalid wallet address");
      return;
    }

    setlooading(true);
    console.log("registering charity");
    try {
      const tx = await contract.registerCharity(charity.wallet, charity.name, charity.description);

      console.log("Transaction sent:", tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Clear form
      setFormData({ wallet: "", name: "", description: "" });

      const response = await approveRegister(charity.id);
      alert("Charity registered successfully!");
    } catch (error) {
      console.error("Error registering charity:", error);
      alert("Failed to register charity: " + (error.reason || error.message));
    } finally {
      setlooading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      sendRequestForCharity();
    } catch (e) {
      console.log(error);
    }
    // registerCharity();
  };
  const goToCampaign = () => {
    window.location.href = "/create-campaign";
  };

  const approveCharity = async (charity) => {
    try {
      await registerCharity(charity);
    } catch (e) {
      console.log(e);
    }
  };
  const rejectCharity = async (charityId) => {
    try {
      await rejectRegister(charityId);
      window.location.reload();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Charity Platform - Registration</h1>
            <h2>To start a campaign, you need to have charity registered</h2>
            {account != null ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Connected:{" "}
                  <span className="font-mono text-indigo-600">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                </p>
                {isOwner && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <CheckCircle size={16} />
                    Contract Owner
                  </span>
                )}
              </div>
            ) : (
              ""
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Registration Form */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus size={24} />
                {`${registeredCheck ? "Start Campaign" : "Request to Register New Charity"}`}
              </h2>
              {!registeredCheck ? (
                !registrationPressed ? (
                  <div className="  rounded-lg p-4 text-yellow-800">
                    <button onClick={pressRegistration} className="bg-blue-500 p-4 cursor-pointer rounded text-white">
                      Register Form
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Charity Wallet Address</label>
                      <input
                        type="text"
                        value={formData.wallet != "" ? formData.wallet : account}
                        onChange={(e) => setFormData({ ...formData, wallet: e.target.value })}
                        placeholder="0x..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className={`${formLabel}`}>Charity Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter charity name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    {/* Logo Upload */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Charity Logo</label>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-28 h-28 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                          <img
                            src={logoPreview || ""}
                            alt="Logo preview"
                            className={`w-28 h-28 object-contain ${logoPreview ? "" : "opacity-40"}`}
                            onError={(e) => (e.target.src = "/placeholder-image.svg")}
                          />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                          <Upload size={16} />
                          <span>Upload PNG</span>
                          <input
                            type="file"
                            accept=".png,.jpg,.jpeg,.svg"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setFormData((prev) => ({ ...prev, logo: file }));
                                const reader = new FileReader();
                                reader.onload = () => setLogoPreview(reader.result);
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                      {formData.logo && (
                        <p className="text-xs text-gray-500 mt-1">
                          Selected:{" "}
                          {typeof formData.logo === "string" ? formData.logo.split("/").pop() : formData.logo.name}
                        </p>
                      )}
                    </div>

                    {/* Verification Document */}
                    <div className="space-y-2 mt-4">
                      <label className="block text-sm font-medium text-gray-700">Verification Document</label>
                      <label className="flex flex-col items-start gap-2 cursor-pointer w-full">
                        <div className="flex items-center justify-between w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                          <div className="flex items-center gap-3">
                            <FileText size={20} className="text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {verificationPreview
                                ? verificationPreview.name
                                : "Upload identity or registration proof (PDF, JPG, PNG)"}
                            </span>
                          </div>
                          <Upload size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];

                            if (file) {
                              setFormData((prev) => ({ ...prev, verification: file }));
                              const reader = new FileReader();
                              reader.onload = () => setVerificationPreview(reader.result);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <div className="flex items-center justify-center w-28 h-28 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                          <img
                            src={verificationPreview || ""}
                            alt="Verification doc preview"
                            className={`w-28 h-28 object-contain ${verificationPreview ? "" : "opacity-40"}`}
                            onError={(e) => (e.target.src = "/placeholder-image.svg")}
                          />
                        </div>
                      </label>
                      {formData.verification && (
                        <p className="text-xs text-gray-500">
                          File: {formData.verification.name} ({(formData.verification.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter charity description"
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    {/* email handle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>

                      <input
                        value={formData.email}
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            email: e.target.value,
                          });
                        }}
                      ></input>
                    </div>
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={looading || !account}
                      className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {looading ? "Pending." : "Request to Register Charity"}
                    </button>
                  </div>
                )
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-green-500">
                    Charity already registered <FaCheck className="inline" />
                  </span>
                  <button onClick={goToCampaign} className="bg-blue-500 p-4 cursor-pointer rounded text-white">
                    Start a campaign
                  </button>
                </div>
              )}
            </div>

            {/* Events Log */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity size={24} />
                Live Events
              </h2>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.length === 0 ? (
                  <p className="text-gray-500 text-sm">No events yet. Register a charity to see events.</p>
                ) : (
                  events.map((event, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-green-800">{event.type}</span>
                        <span className="text-xs text-gray-500">{event.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        <strong>ID:</strong> {event.charityId}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Name:</strong> {event.name}
                      </p>
                      <p className="text-sm text-gray-600 font-mono truncate">{event.wallet}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Registered Charities */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Registered Charities ({registeredCharities.length})
            </h2>

            <div className="grid gap-4">
              {registeredCharities.length === 0 ? (
                <p className="text-gray-500">No charities registered yet</p>
              ) : (
                registeredCharities.map((charity) => (
                  <div key={charity.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-gray-800">{charity.name}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          charity.status === "APPROVED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {charity.status === "APPROVED"
                          ? "Approved"
                          : charity.status === "REJECTED"
                            ? "Rejected"
                            : "Pending"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{charity.description}</p>
                    <p className="text-xs text-gray-500 font-mono">Wallet: {charity.wallet}</p>
                    {isOwner && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mt-2">Logo:</label>
                        <img
                          src={`http://localhost:8080${charity.logoUrl}`}
                          alt="Logo"
                          className="w-16 h-16 object-contain mt-2"
                        />
                        <label className="block text-sm font-medium text-gray-700 mt-4">Verification Document:</label>
                        <img
                          src={`http://localhost:8080${charity.verificationDocumentUrl}`}
                          alt="Verification Document"
                          className="w-full h-72  object-contain mt-2"
                        />
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-400">ID: {charity.id}</span>
                      {isOwner && charity.status === "PENDING" && (
                        <div>
                          <button
                            onClick={() => approveCharity(charity)}
                            className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectCharity(charity.id)}
                            className="mt-2 ml-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterForCharities;
