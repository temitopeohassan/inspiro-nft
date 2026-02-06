import { NextRequest, NextResponse } from "next/server";
import { getNeynarClient } from "@/lib/neynar";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }

  try {
    // Exchange code for access token with Neynar
    // This is a simplified example - implement proper OAuth flow
    const client = getNeynarClient();
    
    // Store user session (implement your session management)
    // For production, use next-auth or similar
    
    return NextResponse.redirect(new URL("/?auth=success", request.url));
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}