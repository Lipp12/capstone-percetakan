import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

const isCloudinaryConfigured =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload berkas ke Cloudinary jika env sudah diset,
 * atau simpan ke local disk jika dijalankan di localhost tanpa Cloudinary.
 */
export async function uploadFileBuffer(
  buffer: Buffer,
  folder: string,
  originalFilename: string,
  resourceType: "image" | "raw" | "auto" = "auto"
): Promise<string> {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `capstone-percetakan/${folder}`,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Gagal mengunggah ke Cloudinary"));
          }
          resolve(result.secure_url);
        }
      );
      uploadStream.end(buffer);
    });
  }

  // Fallback lokal (untuk development offline)
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const safeName = `${Date.now()}-${originalFilename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const filePath = path.join(uploadDir, safeName);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${folder}/${safeName}`;
}
