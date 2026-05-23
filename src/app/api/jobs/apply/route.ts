import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/api-auth";

export async function POST(request: Request) {
  const { error } = await getAuthUser();
  if (error) return error;

  try {
    const body = await request.json();
    const { jobId, name, phone } = body;

    if (!jobId || !name || !phone) {
      return NextResponse.json({ error: "请填写完整信息" }, { status: 400 });
    }

    // 验证职位存在
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, status: true },
    });

    if (!job) {
      return NextResponse.json({ error: "职位不存在" }, { status: 404 });
    }

    if (job.status !== "HIRING") {
      return NextResponse.json({ error: "该职位已停止招聘" }, { status: 400 });
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
