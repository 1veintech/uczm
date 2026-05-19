import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, name, phone } = body;

    if (!jobId || !name || !phone) {
      return NextResponse.json(
        { error: "请填写完整的报名信息" },
        { status: 400 }
      );
    }

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: "未找到该职位" },
        { status: 400 }
      );
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        name,
        phone,
      },
    });

    return NextResponse.json({ success: true, id: application.id });
  } catch (error) {
    console.error("Create job application error:", error);
    return NextResponse.json(
      { error: "提交报名失败，请稍后重试" },
      { status: 500 }
    );
  }
}
