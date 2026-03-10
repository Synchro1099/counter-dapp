// web3Service.js — all blockchain interaction lives here
import { Web3 } from "web3";
 
// ── ABI ──────────────────────────────────────────────────────────
// Sourced from artifacts/contracts/Counter.sol/Counter.json
export const COUNTER_ABI = [
  {"inputs":[{"name":"_startCount","type":"uint256"},
    {"name":"_stepSize","type":"uint256"}],
   "stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"name":"by","type":"address"},
    {"indexed":false,"name":"newCount","type":"uint256"}],
   "name":"CountIncremented","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"name":"by","type":"address"}],
   "name":"CountReset","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"name":"count","type":"uint256"}],
   "name":"Milestone","type":"event"},
  {"inputs":[],"name":"count","outputs":[{"type":"uint256"}],
   "stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"type":"address"}],
   "stateMutability":"view","type":"function"},
  {"inputs":[],"name":"stepSize","outputs":[{"type":"uint256"}],
   "stateMutability":"view","type":"function"},
  {"inputs":[],"name":"increment","outputs":[],
   "stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"reset","outputs":[],
   "stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"_newStep","type":"uint256"}],"name":"setStepSize",
   "outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"name":"_target","type":"uint256"}],"name":"hasReachedTarget",
   "outputs":[{"type":"bool"}],"stateMutability":"view","type":"function"}
];
 
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const SEPOLIA_RPC = import.meta.env.VITE_SEPOLIA_RPC || 'https://rpc.sepolia.org';
 
// ── Read-only Web3 instance (uses public RPC) ─────────────────────
export const web3 = new Web3(SEPOLIA_RPC);
 
// ── Read-only contract instance ───────────────────────────────────
export const counterContract = new web3.eth.Contract(
  COUNTER_ABI,
  CONTRACT_ADDRESS
);
 
// ── Connect MetaMask and return signer web3 + account ─────────────
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed. Please install it first.");
  }
  // Request wallet access — MetaMask pops up
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const account = accounts[0];
 
  // Create a Web3 instance backed by MetaMask
  const mmWeb3 = new Web3(window.ethereum);
 
  // Make sure user is on Sepolia (chain ID 11155111 = 0xAA36A7)
  const chainId = await mmWeb3.eth.getChainId();
  if (chainId !== 11155111n) {
    try {
      // Ask MetaMask to switch
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xAA36A7" }],
      });
    } catch {
      throw new Error("Please switch MetaMask to Sepolia Testnet.");
    }
  }
 
  return { mmWeb3, account };
}
 
// ── Get a write-enabled contract instance ─────────────────────────
export function getWriteContract(mmWeb3) {
  return new mmWeb3.eth.Contract(COUNTER_ABI, CONTRACT_ADDRESS);
}
 
// ── Fetch past events ─────────────────────────────────────────────
export async function fetchEvents() {
  const events = await counterContract.getPastEvents(
    "CountIncremented",
    { fromBlock: 0, toBlock: 'latest' }
  );
  return events.map(e => ({
    by:       e.returnValues.by,
    newCount: e.returnValues.newCount.toString(),
    block:    e.blockNumber.toString(),
  }));
}
