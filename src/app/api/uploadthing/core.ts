import { createUploadthing } from "uploadthing/next";

const f = createUploadthing({
  apiKey: process.env.UPLOADTHING_TOKEN
});

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