import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { User } from "@/lib/models/User";

export async function GET(request: Request) {
  // Only allow this in development mode for security reasons
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development environment" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Email is required. Usage: /api/dev/make-admin?email=your@email.com" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { role: "admin" } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: `User with email ${email} not found. Please sign up on the website first.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Success! User ${email} is now an Admin.`,
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      },
      nextSteps: "Please log out and log back in to refresh your session. The 'Admin Panel' button will appear in the top right navbar."
    });
  } catch (error) {
    console.error("Failed to update user role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
