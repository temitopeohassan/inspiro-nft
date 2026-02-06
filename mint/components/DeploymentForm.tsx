"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { uploadImageToPinata } from "@/lib/ipfs";
import type { NFTCollection, DeploymentResponse } from "@/lib/types";

export default function DeploymentForm() {
  const { address, isConnected } = useAccount();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResponse | null>(null);
  const [formData, setFormData] = useState<NFTCollection>({
    name: "",
    symbol: "",
    description: "",
    maxSupply: 100,
    mintPrice: "0.001",
    attributes: [],
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    if (!formData.imageFile) {
      alert("Please upload an image");
      return;
    }

    setIsDeploying(true);
    setDeploymentResult(null);

    try {
      // Upload image to IPFS
      const imageUrl = await uploadImageToPinata(formData.imageFile);

      // Deploy collection
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionName: formData.name,
          symbol: formData.symbol,
          description: formData.description,
          maxSupply: formData.maxSupply,
          mintPrice: formData.mintPrice,
          creatorAddress: address,
          imageUrl,
          attributes: formData.attributes,
        }),
      });

      const result: DeploymentResponse = await response.json();
      setDeploymentResult(result);

      if (result.success) {
        // Reset form on success
        setFormData({
          name: "",
          symbol: "",
          description: "",
          maxSupply: 100,
          mintPrice: "0.001",
          attributes: [],
        });
      }
    } catch (error) {
      console.error("Deployment error:", error);
      setDeploymentResult({
        success: false,
        error: "Failed to deploy collection",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Deploy NFT Collection</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Collection Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="My Amazing NFT Collection"
            maxLength={32}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Symbol</label>
          <input
            type="text"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="MANC"
            maxLength={10}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your collection..."
            maxLength={280}
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Max Supply</label>
            <input
              type="number"
              value={formData.maxSupply}
              onChange={(e) => setFormData({ ...formData, maxSupply: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min={1}
              max={1000}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mint Price (ETH)</label>
            <input
              type="number"
              step="0.001"
              value={formData.mintPrice}
              onChange={(e) => setFormData({ ...formData, mintPrice: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min={0}
              max={0.05}
              required
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Revenue Split:</p>
          <ul className="text-sm space-y-1">
            <li>• Creator (You): 40%</li>
            <li>• Agent: 40%</li>
            <li>• Platform: 20%</li>
            <li>• Secondary Royalties: 5%</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isDeploying || !isConnected}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isDeploying ? "Deploying..." : "Deploy Collection"}
        </button>
      </form>

      {deploymentResult && (
        <div className={`mt-6 p-4 rounded-lg ${deploymentResult.success ? "bg-green-50" : "bg-red-50"}`}>
          {deploymentResult.success ? (
            <div>
              <h3 className="font-bold text-green-800 mb-2">✅ Collection Deployed!</h3>
              <p className="text-sm mb-2">
                <strong>Address:</strong> {deploymentResult.collectionAddress}
              </p>
              <div className="space-y-2">
                <a
                  href={deploymentResult.mintLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline"
                >
                  View Mint Page →
                </a>
                <a
                  href={deploymentResult.basescanLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline"
                >
                  View on BaseScan →
                </a>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-bold text-red-800 mb-2">❌ Deployment Failed</h3>
              <p className="text-sm text-red-700">{deploymentResult.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}