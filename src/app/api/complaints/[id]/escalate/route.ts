import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.complaint.update({
      where: { id },
      data: { status: "ESCALATED" },
    });

    return NextResponse.json({ success: true, message: "已升级至代理" });
  } catch (error) {
    console.error("Escalate complaint error:", error);
    return NextResponse.json({ error: "升级失败" }, { status: 500 });
  }
}
