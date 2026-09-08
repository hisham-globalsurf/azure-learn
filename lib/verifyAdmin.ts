import { NextRequest } from "next/server";
import * as jose from "jose";

export async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get("adminToken")?.value || "";

  if (!token) {
    return false;
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-secret-key",
    );
    await jose.jwtVerify(token, secret);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
