import { NeynarAPIClient } from "@neynar/nodejs-sdk";

let neynarClient: NeynarAPIClient | null = null;

export function getNeynarClient(): NeynarAPIClient {
  if (!neynarClient) {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      throw new Error("NEYNAR_API_KEY is not set");
    }
    neynarClient = new NeynarAPIClient(apiKey);
  }
  return neynarClient;
}

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  verifiedAddresses: {
    ethAddresses: string[];
  };
}

export async function getUserByFid(fid: number): Promise<FarcasterUser | null> {
  try {
    const client = getNeynarClient();
    const response = await client.fetchBulkUsers([fid]);
    const user = response.users[0];
    if (!user) return null;
    return {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name ?? user.username,
      pfpUrl: user.pfp_url ?? "",
      verifiedAddresses: {
        ethAddresses: user.verified_addresses?.eth_addresses ?? [],
      },
    };
  } catch (error) {
    console.error("Error fetching Farcaster user:", error);
    return null;
  }
}

export async function publishCast(
  signerUuid: string,
  text: string,
  embeds?: { url: string }[]
) {
  try {
    const client = getNeynarClient();
    const response = await client.publishCast(signerUuid, text, {
      embeds: embeds || [],
    });
    return response;
  } catch (error) {
    console.error("Error publishing cast:", error);
    throw error;
  }
}