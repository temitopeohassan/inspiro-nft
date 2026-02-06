"use client";

import { useEffect, useState } from "react";

export default function FarcasterAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated with Neynar
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/status");
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setUser(data.user);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, []);

  const handleSignIn = () => {
    // Redirect to Neynar OAuth flow
    const clientId = process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/auth/callback`;
    const authUrl = `https://app.neynar.com/login?client_id=${clientId}&redirect_uri=${redirectUri}`;
    window.location.href = authUrl;
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3 bg-purple-50 px-4 py-2 rounded-lg">
        <img
          src={user.pfpUrl}
          alt={user.displayName}
          className="w-8 h-8 rounded-full"
        />
        <div>
          <div className="font-medium text-sm">{user.displayName}</div>
          <div className="text-xs text-gray-600">@{user.username}</div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
    >
      Sign in with Farcaster
    </button>
  );
}