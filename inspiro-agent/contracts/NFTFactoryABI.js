export const NFTFactoryABI = [
    {
      "inputs": [
        { "internalType": "string", "name": "name", "type": "string" },
        { "internalType": "string", "name": "symbol", "type": "string" },
        { "internalType": "string", "name": "baseURI", "type": "string" },
        { "internalType": "uint256", "name": "maxSupply", "type": "uint256" },
        { "internalType": "uint256", "name": "mintPrice", "type": "uint256" },
        { "internalType": "address", "name": "agentTreasury", "type": "address" },
        { "internalType": "address", "name": "creatorTreasury", "type": "address" },
        { "internalType": "address", "name": "platformTreasury", "type": "address" },
        { "internalType": "uint16", "name": "agentBps", "type": "uint16" },
        { "internalType": "uint16", "name": "creatorBps", "type": "uint16" },
        { "internalType": "uint16", "name": "platformBps", "type": "uint16" },
        { "internalType": "uint16", "name": "royaltyBps", "type": "uint16" },
        { "internalType": "address", "name": "royaltyReceiver", "type": "address" }
      ],
      "name": "createPaidCollection",
      "outputs": [
        { "internalType": "address", "name": "", "type": "address" }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "collection", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
        { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
        { "indexed": false, "internalType": "uint256", "name": "maxSupply", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "mintPrice", "type": "uint256" }
      ],
      "name": "CollectionCreated",
      "type": "event"
    }
  ];