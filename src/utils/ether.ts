import { ethers } from 'ethers';

// Initialize provider
let provider: ethers.providers.Web3Provider;

// Initialize provider function
const initializeProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
  } else {
    throw new Error('Ethereum provider not found. Please install MetaMask or a similar wallet.');
  }
};

// Connect to the Ethereum network
export const connectToEthereum = async () => {
  try {
    initializeProvider();
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    return { signer, address };
  } catch (error) {
    console.error("Failed to connect to Ethereum:", error);
    throw error;
  }
};

// Get account balance
export const getBalance = async (address: string) => {
  try {
    initializeProvider();
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error("Failed to get balance:", error);
    throw error;
  }
};

// Send Ether
export const sendEther = async (to: string, amount: string) => {
  try {
    initializeProvider();
    const signer = provider.getSigner();
    const tx = await signer.sendTransaction({
      to,
      value: ethers.utils.parseEther(amount)
    });
    return await tx.wait();
  } catch (error) {
    console.error("Failed to send Ether:", error);
    throw error;
  }
};

// Interact with a smart contract
export const interactWithContract = async (
  contractAddress: string,
  contractABI: ethers.ContractInterface,
  methodName: string,
  params: unknown[]
) => {
  try {
    initializeProvider();
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const tx = await contract[methodName](...params);
    return await tx.wait();
  } catch (error) {
    console.error("Failed to interact with contract:", error);
    throw error;
  }
};

// Get past events
export const getPastEvents = async (
  contractAddress: string,
  contractABI: ethers.ContractInterface,
  eventName: string,
  fromBlock: number,
  toBlock: number | 'latest' = 'latest'
) => {
  try {
    initializeProvider();
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const filter = contract.filters[eventName]();
    const events = await contract.queryFilter(filter, fromBlock, toBlock);
    return events;
  } catch (error) {
    console.error("Failed to get past events:", error);
    throw error;
  }
};

// Estimate gas for a transaction
export const estimateGas = async (
  to: string,
  value: string,
  data: string = '0x'
) => {
  try {
    initializeProvider();
    const gasEstimate = await provider.estimateGas({
      to,
      value: ethers.utils.parseEther(value),
      data
    });
    return gasEstimate.toString();
  } catch (error) {
    console.error("Failed to estimate gas:", error);
    throw error;
  }
};

// Get current gas price
export const getCurrentGasPrice = async () => {
  try {
    initializeProvider();
    const gasPrice = await provider.getGasPrice();
    return ethers.utils.formatUnits(gasPrice, 'gwei');
  } catch (error) {
    console.error("Failed to get current gas price:", error);
    throw error;
  }
};