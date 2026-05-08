import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import * as argon2 from "argon2";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email aur password required hai" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password minimum 8 characters ka hona chahiye" }, { status: 400 });
    }

    await dbConnect();

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "Is email se account already exist karta hai. Sign in karo." }, { status: 409 });
    }

    const passwordHash = await argon2.hash(password);

    await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "free",
      provider: "credentials",
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
