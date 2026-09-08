import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = cookies();

    (await cookieStore).set("adminToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });

    return NextResponse.json({ success: true, message: "Logged out successfully" }, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
