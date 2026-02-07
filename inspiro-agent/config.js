import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Blockchain
  privateKey: process.env.PRIVATE_KEY,
  baseRpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
  factoryContractAddress: process.env.FACTORY_CONTRACT_ADDRESS,
  
  // Farcaster
  neynarApiKey: process.env.NEYNAR_API_KEY,
  signerUuid: process.env.SIGNER_UUID,
  
  // AI (Gemini)
  geminiApiKey: process.env.GEMINI_API_KEY,
  
  // IPFS
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretKey: process.env.PINATA_SECRET_KEY,
  
  // Treasuries
  agentTreasury: process.env.AGENT_TREASURY,
  platformTreasury: process.env.PLATFORM_TREASURY,
  
  // Feature Flags
  deploysEnabled: process.env.DEPLOYS_ENABLED === 'true',
  environment: process.env.ENVIRONMENT || 'development',
  
  // Rate Limits
  maxDeploysPerUserPerDay: parseInt(process.env.MAX_DEPLOYS_PER_USER_PER_DAY || '1'),
  maxDeploysPerHour: parseInt(process.env.MAX_DEPLOYS_PER_HOUR || '5'),
  
  // Protocol Constraints
  constraints: {
    supply: {
      min: 1,
      max: 1000
    },
    mintPrice: {
      min: 0,
      max: 0.05 // in ETH
    },
    royalties: {
      max: 1000 // 10% in basis points
    }
  },
  
  // Revenue Split (basis points, total = 10000)
  revenueSplit: {
    agent: 4000,    // 40%
    creator: 4000,  // 40%
    platform: 2000  // 20%
  },
  
  // Default Royalty
  defaultRoyaltyBps: 500, // 5%
  
  // Farcaster Triggers
  triggers: [
    '@Inspiro',
    'deploy nft',
    'mint on base',
    'drop nft'
  ],
  
  // Blocked Content
  blockedContent: [
    'nsfw',
    'hate',
    'copyrighted brands',
    'celebrity likeness'
  ],
  
  // Polling Interval (in ms)
  pollingInterval: 60000 // 1 minute
};