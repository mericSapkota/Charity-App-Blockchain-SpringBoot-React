import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config/contract";

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  const connectWallet = async () => {
    console.log("connecting to");
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    const tempProvider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await tempProvider.send("eth_requestAccounts", []);
    const tempSigner = await tempProvider.getSigner();
    const tempContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, tempSigner);
    console.log(tempContract, "tempcontract");
    const ownerAddress = await tempContract.owner();
    setProvider(tempProvider);
    setSigner(tempSigner);
    setContract(tempContract);
    setAccount(accounts[0]);
    setIsOwner(ownerAddress.toLowerCase() === accounts[0].toLowerCase());
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount(null);
    setIsOwner(false);
  };

  useEffect(() => {
    const tryAutoConnect = async () => {
      if (!window.ethereum) return;

      const tempProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await tempProvider.send("eth_accounts", []);

      if (accounts.length === 0) return; // not connected

      const tempSigner = await tempProvider.getSigner();
      const tempContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, tempSigner);
      const ownerAddress = await tempContract.owner();

      setProvider(tempProvider);
      setSigner(tempSigner);
      setContract(tempContract);
      setAccount(accounts[0]);
      setIsOwner(ownerAddress.toLowerCase() === accounts[0].toLowerCase());
    };

    tryAutoConnect();
  }, []);

  return (
    <WalletContext.Provider
      value={{
        provider,
        signer,
        contract,
        account,
        isOwner,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
