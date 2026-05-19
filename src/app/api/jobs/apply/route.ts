import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobId, name, phone } = body;

    if (!jobId || !name || !phone) {
      return NextResponse.json({ error: "请填写完整信息" }, { status: 400 });
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        name,
        phone,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Apply job error:", error);
    return NextResponse.json({ error: "报名失败" }, { status: 500 });
  }
}
