import { BlobServiceClient } from "@azure/storage-blob";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "uploads";

if (!connectionString) {
  throw new Error("Please add AZURE_STORAGE_CONNECTION_STRING to your .env");
}

const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

export async function uploadToBlob(
  file: Buffer,
  fileName: string,
  contentType: string,
) {
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.uploadData(file, {
    blobHTTPHeaders: { blobContentType: contentType },
  });
  return blockBlobClient.url;
}

export async function deleteFromBlob(fileName: string) {
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.deleteIfExists();
}

export function getBlobNameFromUrl(url: string): string {
  return decodeURIComponent(new URL(url).pathname.split("/").pop() || "");
}
