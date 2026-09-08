import { NextRequest, NextResponse } from "next/server";
import { uploadToBlob } from "@/lib/azureBlob";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueFileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const url = await uploadToBlob(buffer, uniqueFileName, file.type);

    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
