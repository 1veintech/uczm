import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgentOrAdmin } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAgentOrAdmin();
    if (error) return error;

    const body = await request.json();
    const { id, resolveType, resolveRemark } = body;

    await prisma.complaint.update({
      where: { id },
      data: {
        status: "RESOLVED",
        resolveType: resolveType || "other",
        resolveRemark: resolveRemark || "代理已处理",
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: "已处理" });
  } catch (error) {
    return NextResponse.json({ error: "处理失败" }, { status: 500 });
  }
}
