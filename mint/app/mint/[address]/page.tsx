"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import MintCard from "@/components/MintCard";
import { useParams } from "next/navigation";

export default function MintPage() {
  const params = useParams();
  const address = params.address as string;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Inspiro
              </h1>
              <span className="ml-3 text-sm text-gray-600">NFT Mint</span>
            </a>
            <ConnectButton />
          </div>
        </div>
      </nav>

      <div className="py-12">
        <MintCard collectionAddress={address} />
      </div>

      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>Built on Base • Powered by Inspiro</p>
          </div>
        </div>
      </footer>
    </main>
  );
}