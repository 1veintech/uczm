import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        station: { select: { name: true, phone: true } },
        customer: { select: { nickname: true, phone: true } },
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: "未找到该工单" }, { status: 404 });
    }

    // Parse images JSON
    const parsedComplaint = {
      ...complaint,
      images: complaint.images ? JSON.parse(complaint.images) : [],
    };

    return NextResponse.json(parsedComplaint);
  } catch (error) {
    console.error("Get complaint detail error:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
