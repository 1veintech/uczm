import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, resolveType, resolveRemark, action } = body;

    if (action === "escalate") {
      await prisma.complaint.update({
        where: { id },
        data: { status: "ESCALATED" },
      });
      return NextResponse.json({ success: true, message: "已升级至代理" });
    }

    await prisma.complaint.update({
      where: { id },
      data: {
        status: "RESOLVED",
        resolveType: resolveType || "other",
        resolveRemark: resolveRemark || "",
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: "已处理" });
  } catch (error) {
    console.error("Resolve complaint error:", error);
    return NextResponse.json({ error: "处理失败" }, { status: 500 });
  }
}
