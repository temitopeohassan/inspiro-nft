import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, http, parseEther, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { NFT_FACTORY_ABI, FACTORY_ADDRESS, CONSTRAINTS, ECONOMICS } from "@/lib/contracts";
import { uploadMetadataFolder, NFTMetadata } from "@/lib/ipfs";
import type { DeploymentRequest, DeploymentResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    // Check if deployments are enabled
    if (process.env.DEPLOYS_ENABLED !== "true") {
      return NextResponse.json(
        { success: false, error: "Deployments are currently disabled" },
        { status: 503 }
      );
    }

    const body: DeploymentRequest = await request.json();
    const {
      collectionName,
      symbol,
      description,
      maxSupply,
      mintPrice,
      creatorAddress,
      imageUrl,
      attributes,
    } = body;

    // Validate inputs
    if (!collectionName || !symbol || !maxSupply || !creatorAddress) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate constraints
    if (maxSupply < CONSTRAINTS.supply.min || maxSupply > CONSTRAINTS.supply.max) {
      return NextResponse.json(
        {
          success: false,
          error: `Max supply must be between ${CONSTRAINTS.supply.min} and ${CONSTRAINTS.supply.max}`,
        },
        { status: 400 }
      );
    }

    const mintPriceFloat = parseFloat(mintPrice);
    if (mintPriceFloat < CONSTRAINTS.mintPrice.min || mintPriceFloat > CONSTRAINTS.mintPrice.max) {
      return NextResponse.json(
        {
          success: false,
          error: `Mint price must be between ${CONSTRAINTS.mintPrice.min} and ${CONSTRAINTS.mintPrice.max} ETH`,
        },
        { status: 400 }
      );
    }

    // Create metadata for all tokens
    const metadataArray: NFTMetadata[] = Array.from({ length: maxSupply }, (_, i) => ({
      name: `${collectionName} #${i + 1}`,
      description,
      image: imageUrl,
      attributes: attributes || [],
    }));

    // Upload metadata to IPFS
    const baseURI = await uploadMetadataFolder(metadataArray);

    // Setup wallet client
    const privateKey = process.env.AGENT_PRIVATE_KEY as `0x${string}`;
    if (!privateKey) {
      throw new Error("AGENT_PRIVATE_KEY not configured");
    }

    const account = privateKeyToAccount(privateKey);
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL),
    });

    const publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL),
    });

    // Get treasury addresses
    const agentTreasury = process.env.NEXT_PUBLIC_AGENT_TREASURY as `0x${string}`;
    const platformTreasury = process.env.NEXT_PUBLIC_PLATFORM_TREASURY as `0x${string}`;

    if (!agentTreasury || !platformTreasury) {
      throw new Error("Treasury addresses not configured");
    }

    // Deploy NFT collection via factory
    const { request: deployRequest } = await publicClient.simulateContract({
      address: FACTORY_ADDRESS,
      abi: NFT_FACTORY_ABI,
      functionName: "createPaidCollection",
      args: [
        collectionName,
        symbol,
        baseURI,
        BigInt(maxSupply),
        parseEther(mintPrice),
        agentTreasury,
        creatorAddress as `0x${string}`,
        platformTreasury,
        BigInt(ECONOMICS.primarySale.agentBps),
        BigInt(ECONOMICS.primarySale.creatorBps),
        BigInt(ECONOMICS.primarySale.platformBps),
        BigInt(ECONOMICS.secondarySale.defaultRoyaltyBps),
        platformTreasury, // Royalty receiver
      ],
      account,
    });

    const hash = await walletClient.writeContract(deployRequest);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // Extract collection address from logs
    // In a real implementation, you'd parse the event logs to get the exact address
    const collectionAddress = receipt.contractAddress || receipt.logs[0]?.address;

    const basescanLink = `https://basescan.org/tx/${hash}`;
    const mintLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/mint/${collectionAddress}`;

    const response: DeploymentResponse = {
      success: true,
      collectionAddress,
      transactionHash: hash,
      basescanLink,
      mintLink,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Deployment error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to deploy collection",
      },
      { status: 500 }
    );
  }
}