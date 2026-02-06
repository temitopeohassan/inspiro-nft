"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { NFT_COLLECTION_ABI } from "@/lib/contracts";

interface MintCardProps {
  collectionAddress: string;
}

export default function MintCard({ collectionAddress }: MintCardProps) {
  const { address, isConnected } = useAccount();
  const [collectionData, setCollectionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    fetchCollectionData();
  }, [collectionAddress]);

  const fetchCollectionData = async () => {
    try {
      const response = await fetch(`/api/mint?address=${collectionAddress}`);
      const data = await response.json();
      if (data.success) {
        setCollectionData(data.collection);
      }
    } catch (error) {
      console.error("Error fetching collection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMint = async () => {
    if (!address || !collectionData) return;

    try {
      writeContract({
        address: collectionAddress as `0x${string}`,
        abi: NFT_COLLECTION_ABI,
        functionName: "mint",
        args: [address],
        value: BigInt(collectionData.mintPrice),
      });
    } catch (error) {
      console.error("Minting error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!collectionData) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="bg-red-50 p-4 rounded-lg text-red-700">
          Collection not found or invalid address
        </div>
      </div>
    );
  }

  const isSoldOut = collectionData.totalSupply >= collectionData.maxSupply;
  const canMint = isConnected && !collectionData.mintPaused && !isSoldOut;

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{collectionData.name}</h1>
          <p className="text-gray-600 mb-4">{collectionData.symbol}</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Minted</span>
              <span className="font-medium">
                {collectionData.totalSupply} / {collectionData.maxSupply}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(collectionData.totalSupply / collectionData.maxSupply) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-1">Mint Price</div>
            <div className="text-2xl font-bold">
              {formatEther(BigInt(collectionData.mintPrice))} ETH
            </div>
          </div>

          {isSuccess && (
            <div className="mb-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium">🎉 Mint Successful!</p>
              <a
                href={`https://basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View transaction →
              </a>
            </div>
          )}

          {collectionData.mintPaused && (
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800 font-medium">⚠️ Minting is currently paused</p>
            </div>
          )}

          {isSoldOut && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg">
              <p className="text-red-800 font-medium">🔴 Sold Out!</p>
            </div>
          )}

          <button
            onClick={handleMint}
            disabled={!canMint || isPending || isConfirming}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {!isConnected
              ? "Connect Wallet to Mint"
              : isPending || isConfirming
              ? "Minting..."
              : isSoldOut
              ? "Sold Out"
              : collectionData.mintPaused
              ? "Minting Paused"
              : "Mint NFT"}
          </button>

          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-gray-500 mb-2">Contract Address:</p>
            <a
              href={`https://basescan.org/address/${collectionAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline break-all"
            >
              {collectionAddress}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}