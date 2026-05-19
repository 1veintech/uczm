import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.jobApplication.deleteMany({ where: { jobId: id } });
    await prisma.job.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "删除成功" });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
