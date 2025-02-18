import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Create rate limiter - 5 requests per IP per 15 minutes
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
});

export async function POST(request: NextRequest) {
  try {
    // Get IP from headers or fallback
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               "anonymous";
    const { success, reset } = await ratelimit.limit(ip);

    if (!success) {
      const now = Date.now();
      const retryAfter = Math.floor((reset - now) / 1000);
      
      return NextResponse.json(
        {
          error: "Too many requests",
          message: `Please try again in ${Math.ceil(retryAfter / 60)} minutes`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    // Forward to Supabase auth endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/recover`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      },
      body: JSON.stringify(await request.json()),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error_description || data.error || "An error occurred" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
