export interface NFTCollection {
  name: string;
  symbol: string;
  description: string;
  maxSupply: number;
  mintPrice: string; // in ETH
  creatorAddress?: string;
  imageFile?: File;
  attributes?: NFTAttribute[];
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

export interface DeploymentRequest {
  collectionName: string;
  symbol: string;
  description: string;
  maxSupply: number;
  mintPrice: string;
  creatorAddress: string;
  imageUrl: string;
  metadataUri: string;
  attributes?: NFTAttribute[];
}

export interface DeploymentResponse {
  success: boolean;
  collectionAddress?: string;
  transactionHash?: string;
  error?: string;
  mintLink?: string;
  basescanLink?: string;
}

export interface MintRequest {
  collectionAddress: string;
  recipientAddress: string;
}

export interface MintResponse {
  success: boolean;
  tokenId?: number;
  transactionHash?: string;
  error?: string;
}

export type IntentType =
  | "DEPLOY_PAID_NFT"
  | "DEPLOY_FREE_NFT"
  | "STATUS_QUERY"
  | "IGNORE";

export interface IntentClassification {
  intent: IntentType;
  confidence: number;
  reasoning: string;
}

export interface CollectionState {
  address: string;
  name: string;
  symbol: string;
  maxSupply: number;
  totalSupply: number;
  mintPrice: string;
  mintPaused: boolean;
  creator: string;
  createdAt: number;
}