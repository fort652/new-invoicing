import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    message: "Webhook endpoint is accessible",
    timestamp: new Date().toISOString(),
    env: {
      hasPaystackSecret: !!process.env.PAYSTACK_SECRET_KEY,
      hasConvexUrl: !!process.env.NEXT_PUBLIC_CONVEX_URL,
      convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("Test webhook received:", JSON.stringify(body, null, 2));
    
    return NextResponse.json({
      status: "received",
      message: "Test webhook processed successfully",
      receivedData: body,
    });
  } catch (error: any) {
    console.error("Test webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
