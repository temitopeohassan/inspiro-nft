export const NFT_FACTORY_ABI = [
  {
    inputs: [
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "baseURI", type: "string" },
      { name: "maxSupply", type: "uint256" },
      { name: "mintPrice", type: "uint256" },
      { name: "agentTreasury", type: "address" },
      { name: "creatorTreasury", type: "address" },
      { name: "platformTreasury", type: "address" },
      { name: "agentBps", type: "uint256" },
      { name: "creatorBps", type: "uint256" },
      { name: "platformBps", type: "uint256" },
      { name: "royaltyBps", type: "uint256" },
      { name: "royaltyReceiver", type: "address" },
    ],
    name: "createPaidCollection",
    outputs: [{ name: "collection", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllCollections",
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "creator", type: "address" }],
    name: "getCollectionsByCreator",
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const NFT_COLLECTION_ABI = [
  {
    inputs: [{ name: "to", type: "address" }],
    name: "mint",
    outputs: [{ name: "tokenId", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "mintPrice",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "mintPaused",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const FACTORY_ADDRESS =
  (process.env.NEXT_PUBLIC_NFT_FACTORY_ADDRESS as `0x${string}`) || "0x";

export const CONSTRAINTS = {
  supply: {
    min: 1,
    max: 1000,
  },
  mintPrice: {
    min: 0,
    max: 0.05, // in ETH
  },
  royalties: {
    max: 1000, // 10% in basis points
  },
};

export const ECONOMICS = {
  primarySale: {
    agentBps: 4000, // 40%
    creatorBps: 4000, // 40%
    platformBps: 2000, // 20%
  },
  secondarySale: {
    defaultRoyaltyBps: 500, // 5%
  },
};