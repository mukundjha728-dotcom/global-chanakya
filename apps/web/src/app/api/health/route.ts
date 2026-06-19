import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongoose';

export async function GET() {
  try {
    // Check Database connection as well
    await dbConnect();
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    return NextResponse.json(
      {
        status: 'ok',
        database: dbStatus,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
