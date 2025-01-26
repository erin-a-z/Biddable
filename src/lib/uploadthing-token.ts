export function getToken() {
  const token = process.env.UPLOADTHING_TOKEN;
  if (!token) {
    throw new Error("Missing UPLOADTHING_TOKEN environment variable");
  }
  return { uploadthingId: token };
} 