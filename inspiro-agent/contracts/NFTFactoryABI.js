export const NFTFactoryABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "collection",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "creatorTreasury",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "maxSupply",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "mintPrice",
        "type": "uint256"
      }
    ],
    "name": "CollectionDeployed",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "baseURI",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "maxSupply",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "mintPrice",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "agentTreasury",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "creatorTreasury",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "platformTreasury",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "agentBps",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "creatorBps",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "platformBps",
        "type": "uint256"
      },
      {
        "internalType": "uint96",
        "name": "royaltyBps",
        "type": "uint96"
      },
      {
        "internalType": "address",
        "name": "royaltyReceiver",
        "type": "address"
      }
    ],
    "name": "createPaidCollection",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllCollections",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      }
    ],
    "name": "getCollectionsByCreator",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];