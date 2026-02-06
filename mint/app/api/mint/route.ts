import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { NFT_COLLECTION_ABI } from "@/lib/contracts";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Collection address required" },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL),
    });

    // Fetch collection details
    const [name, symbol, maxSupply, mintPrice, totalSupply, mintPaused] =
      await Promise.all([
        publicClient.readContract({
          address: address as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: "name",
        }),
        publicClient.readContract({
          address: address as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: "symbol",
        }),
        publicClient.readContract({
          address: address as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: "maxSupply",
        }),
        publicClient.readContract({
          address: address as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: "mintPrice",
        }),
        publicClient.readContract({
          address: address as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: "totalSupply",
        }),
        publicClient.readContract({
          address: address as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: "mintPaused",
        }),
      ]);

    return NextResponse.json({
      success: true,
      collection: {
        address,
        name,
        symbol,
        maxSupply: maxSupply.toString(),
        mintPrice: mintPrice.toString(),
        totalSupply: totalSupply.toString(),
        mintPaused,
      },
    });
  } catch (error: any) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch collection details",
      },
      { status: 500 }
    );
  }
}