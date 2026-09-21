"use server";

import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";

export async function uploadFile(
  file: File,
  bucket: string = "documentos"
): Promise<string | null> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${randomBytes(4).toString("hex")}.${fileExt}`;
    
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", bucket);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // Return the public URL path
    return `/uploads/${bucket}/${fileName}`;
  } catch (error) {
    console.error("Erro ao fazer upload local:", error);
    return null;
  }
}
