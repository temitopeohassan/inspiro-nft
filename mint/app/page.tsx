"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import DeploymentForm from "@/components/DeploymentForm";
import FarcasterAuth from "@/components/FarcasterAuth";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Inspiro
              </h1>
              <span className="ml-3 text-sm text-gray-600">NFT Mint on Base</span>
            </div>
            <div className="flex items-center gap-4">
              <FarcasterAuth />
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Deploy Your NFT Collection
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create and deploy paid-mint NFT collections on Base with automatic revenue
            splits and royalties. Powered by Farcaster integration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-bold mb-2">Quick Deploy</h3>
            <p className="text-sm text-gray-600">
              Deploy your NFT collection in minutes with our simple form
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-bold mb-2">Revenue Sharing</h3>
            <p className="text-sm text-gray-600">
              Automatic 40/40/20 split between creator, agent, and platform
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl mb-3">🔗</div>
            <h3 className="font-bold mb-2">Farcaster Integration</h3>
            <p className="text-sm text-gray-600">
              Share your drops directly to Farcaster with one click
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg">
          <DeploymentForm />
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 font-bold">
                1
              </div>
              <p className="text-sm font-medium">Connect Wallet</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <p className="text-sm font-medium">Fill Collection Details</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 font-bold">
                3
              </div>
              <p className="text-sm font-medium">Deploy to Base</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 font-bold">
                4
              </div>
              <p className="text-sm font-medium">Share & Start Minting</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>Built on Base • Powered by Inspiro Protocol v1.0.0</p>
            <p className="mt-2">
              <a href="https://docs.base.org" className="text-blue-600 hover:underline">
                Documentation
              </a>
              {" • "}
              <a href="https://github.com" className="text-blue-600 hover:underline">
                GitHub
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}