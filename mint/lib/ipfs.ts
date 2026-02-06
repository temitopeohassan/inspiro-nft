import { PinataSDK } from "pinata-web3";

let pinataClient: PinataSDK | null = null;

export function getPinataClient(): PinataSDK {
  if (!pinataClient) {
    const jwt = process.env.NEXT_PUBLIC_PINATA_JWT || process.env.PINATA_JWT;
    if (!jwt) {
      throw new Error("PINATA_JWT is not set");
    }
    pinataClient = new PinataSDK({
      pinataJwt: jwt,
    });
  }
  return pinataClient;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export async function uploadImageToPinata(
  file: File
): Promise<string> {
  try {
    const client = getPinataClient();
    const upload = await client.upload.file(file);
    return `ipfs://${upload.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading image to Pinata:", error);
    throw error;
  }
}

export async function uploadJSONToPinata(
  metadata: NFTMetadata
): Promise<string> {
  try {
    const client = getPinataClient();
    const upload = await client.upload.json(metadata);
    return `ipfs://${upload.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading JSON to Pinata:", error);
    throw error;
  }
}

export async function uploadMetadataFolder(
  metadataArray: NFTMetadata[]
): Promise<string> {
  try {
    const client = getPinataClient();
    
    // Create a folder with numbered JSON files
    const files = metadataArray.map((metadata, index) => {
      const blob = new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      });
      return new File([blob], `${index}.json`);
    });

    const upload = await client.upload.fileArray(files);
    return `ipfs://${upload.IpfsHash}/`;
  } catch (error) {
    console.error("Error uploading metadata folder to Pinata:", error);
    throw error;
  }
}

export function convertIpfsToHttp(ipfsUri: string): string {
  if (ipfsUri.startsWith("ipfs://")) {
    return ipfsUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
  }
  return ipfsUri;
}
