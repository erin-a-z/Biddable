import { createUploadthing } from "uploadthing/next";
import { UTApi } from "uploadthing/server";

export const utapi = new UTApi({
  apiKey: process.env.UPLOADTHING_TOKEN
});

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => {
      return { userId: "testUser" };
    })
    .onUploadComplete(() => {
      console.log("Upload complete");
    })
};

export type OurFileRouter = typeof ourFileRouter; 