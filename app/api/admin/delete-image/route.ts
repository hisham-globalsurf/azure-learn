import { NextRequest, NextResponse } from "next/server";
import { deleteFromBlob, getBlobNameFromUrl } from "@/lib/azureBlob";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ message: "No url provided" }, { status: 400 });
    }

    const blobName = getBlobNameFromUrl(url);
    await deleteFromBlob(blobName);

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ message: "Delete failed" }, { status: 500 });
  }
}