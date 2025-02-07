import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { shippingService } from "@/app/services/ShippingService";
import { trackingNumberSchema } from "@/app/types/shipping";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = trackingNumberSchema.parse(body);

    // Get tracking details
    const trackingDetails = await shippingService.getTrackingDetails(
      validatedData.trackingNumber,
      validatedData.carrier
    );

    return NextResponse.json(trackingDetails);
  } catch (error: any) {
    console.error("Error in shipping tracking endpoint:", error);
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch tracking information" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get tracking number and carrier from URL params
    const { searchParams } = new URL(req.url);
    const trackingNumber = searchParams.get("trackingNumber");
    const carrier = searchParams.get("carrier");

    if (!trackingNumber || !carrier) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Validate parameters
    const validatedData = trackingNumberSchema.parse({
      trackingNumber,
      carrier,
    });

    // Get tracking details
    const trackingDetails = await shippingService.getTrackingDetails(
      validatedData.trackingNumber,
      validatedData.carrier
    );

    return NextResponse.json(trackingDetails);
  } catch (error: any) {
    console.error("Error in shipping tracking endpoint:", error);
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch tracking information" },
      { status: 500 }
    );
  }
}
