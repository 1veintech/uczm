import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/api-auth";

export async function POST(request: Request) {
  const { error } = await getAuthUser();
  if (error) return error;

  try {
    const body = await request.json();
    const { problemType, description, images, orderNo, customerId, stationId } = body;

    if (!problemType || !description) {
      return NextResponse.json({ error: "请填写必填字段" }, { status: 400 });
    }

    const customer = customerId
      ? await prisma.customer.findUnique({ where: { id: customerId } })
      : null;

    const station = stationId
      ? await prisma.station.findUnique({ where: { id: stationId } })
      : await prisma.station.findFirst({ where: { status: "APPROVED" } });

    if (!customer || !station) {
      return NextResponse.json({ error: "客户或站点不存在" }, { status: 400 });
    }

    if (station.status !== "APPROVED") {
      return NextResponse.json({ error: "该站点暂不接受售后反馈" }, { status: 400 });
    }

    const complaint = await prisma.complaint.create({
      data: {
        customerId: customer.id,
        stationId: station.id,
        problemType: problemType || "OTHER",
        description: description || "",
        images: JSON.stringify(images || []),
        orderNo: orderNo || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, complaint });
  } catch (error) {
    console.error("Create complaint error:", error);
    return NextResponse.json({ error: "提交失败" }, { status: 500 });
  }
}
