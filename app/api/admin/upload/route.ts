import { NextRequest, NextResponse } from "next/server";
import { uploadToBlob } from "@/lib/azureBlob";
import { verifyAdmin } from "@/lib/verifyAdmin";

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueFileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    // Not referenced by any document yet. If the admin never saves a form that
    // uses it, the blob garbage-collector reclaims it after the grace period.
    const url = await uploadToBlob(buffer, uniqueFileName, file.type);

    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
