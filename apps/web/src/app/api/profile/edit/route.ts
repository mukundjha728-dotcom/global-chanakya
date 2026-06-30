import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import { auth } from "@/auth";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

const editSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(160).optional(),
});

export async function PUT(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id || session?.user?.email;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = editSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data", details: result.error.format() }, { status: 400 });
    }

    await dbConnect();
    
    // Determine how to find user
    const query = session?.user?.id ? { _id: session.user.id } : { email: session?.user?.email };
    
    const user = await User.findOneAndUpdate(
      query,
      { $set: result.data },
      { new: true, runValidators: true }
    ).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: { name: user.name, bio: user.bio } });
  } catch (error: any) {
    Sentry.captureException(error, { extra: { userId, action: "process_profile_edit" } });
    console.error({ event: "profile_edit_failure", userId, error: error.message, timestamp: new Date().toISOString() });
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
