import { BlobServiceClient } from "@azure/storage-blob";

const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "uploads";

let containerClient: ReturnType<BlobServiceClient["getContainerClient"]> | null = null;

function getContainerClient() {
  if (containerClient) return containerClient;

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("Please add AZURE_STORAGE_CONNECTION_STRING to your .env");
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  containerClient = blobServiceClient.getContainerClient(containerName);
  return containerClient;
}

export async function uploadToBlob(file: Buffer, fileName: string, contentType: string) {
  const client = getContainerClient();
  const blockBlobClient = client.getBlockBlobClient(fileName);
  await blockBlobClient.uploadData(file, {
    blobHTTPHeaders: { blobContentType: contentType },
  });
  return blockBlobClient.url;
}

export async function deleteFromBlob(fileName: string) {
  const client = getContainerClient();
  const blockBlobClient = client.getBlockBlobClient(fileName);
  await blockBlobClient.deleteIfExists();
}

export function getBlobNameFromUrl(url: string): string {
  return decodeURIComponent(new URL(url).pathname.split("/").pop() || "");
}