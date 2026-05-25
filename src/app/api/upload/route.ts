import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILES = 20;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB per file
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  try {
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "请选择文件" }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `最多上传${MAX_FILES}张图片` }, { status: 400 });
    }

    const urls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (file.size > MAX_SIZE) {
        errors.push(`${file.name} 超过5MB限制`);
        continue;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name} 格式不支持`);
        continue;
      }

      const ext = file.type.split("/")[1] || "jpg";
      const filename = `${crypto.randomUUID()}.${ext}`;
      const filepath = path.join(UPLOAD_DIR, filename);

      const bytes = await file.arrayBuffer();
      await writeFile(filepath, Buffer.from(bytes));

      urls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({
      success: true,
      urls,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
