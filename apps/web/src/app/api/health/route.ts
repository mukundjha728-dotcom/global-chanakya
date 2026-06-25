import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: isDbConnected ? "connected" : "disconnected",
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    }, { status: isDbConnected ? 200 : 503 });
  } catch (error) {
    return NextResponse.json({ status: "error", error: "Health check failed" }, { status: 500 });
  }
}
