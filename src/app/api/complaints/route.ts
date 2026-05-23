import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/api-auth";

// Check if a point (lat, lng) is inside a polygon (bounds)
function isPointInPolygon(lat: number, lng: number, bounds: [number, number][]): boolean {
  if (bounds.length < 3) return true;
  let inside = false;
  for (let i = 0, j = bounds.length - 1; i < bounds.length; j = i++) {
    const [yi, xi] = bounds[i];
    const [yj, xj] = bounds[j];
    if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

export async function GET(req: NextRequest) {
  const { error } = await getAuthUser();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const phone = searchParams.get("phone");
    const status = searchParams.get("status");
    const take = searchParams.get("take");

    let customer = null;
    if (customerId) {
      customer = await prisma.customer.findUnique({ where: { id: customerId } });
    } else if (phone) {
      customer = await prisma.customer.findFirst({ where: { phone } });
    }

    if (!customer) {
      return NextResponse.json({ complaints: [] });
    }

    const complaints = await prisma.complaint.findMany({
      where: {
        customerId: customer.id,
        ...(status === "PENDING" ? { status: "PENDING" } :
           status === "RESOLVED" ? { status: { in: ["RESOLVED", "ESCALATED"] } } : {}),
      },
      include: {
        station: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      ...(take ? { take: parseInt(take) } : {}),
    });

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error("Get complaints error:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error } = await getAuthUser();
  if (error) return error;

  try {
    const body = await req.json();
    const { problemType, description, orderNo, images, customerId, stationId, customerLat, customerLng } = body;

    if (!problemType || !description) {
      return NextResponse.json({ error: "请填写问题类型和描述" }, { status: 400 });
    }

    const customer = customerId
      ? await prisma.customer.findUnique({ where: { id: customerId } })
      : await prisma.customer.findFirst();

    if (!customer) {
      return NextResponse.json({ error: "请先登录后再提交售后" }, { status: 400 });
    }

    let station;
    if (stationId) {
      station = await prisma.station.findUnique({
        where: { id: stationId },
        include: { agent: true },
      });
    } else if (customer.stationId) {
      station = await prisma.station.findUnique({
        where: { id: customer.stationId },
        include: { agent: true },
      });
    } else {
      station = await prisma.station.findFirst({
        include: { agent: true },
      });
    }

    if (!station) {
      return NextResponse.json({ error: "未找到站点信息" }, { status: 400 });
    }

    if (station.status !== "APPROVED") {
      return NextResponse.json({ error: "该站点暂不接受售后反馈" }, { status: 400 });
    }

    if (station.agent && station.agent.regionBounds) {
      try {
        const bounds: [number, number][] = JSON.parse(station.agent.regionBounds);
        if (bounds.length >= 3 && customerLat && customerLng) {
          if (!isPointInPolygon(customerLat, customerLng, bounds)) {
            return NextResponse.json(
              { error: `您所在的区域不属于「${station.agent.region}」服务范围，请联系对应区域的站点` },
              { status: 400 }
            );
          }
        }
      } catch {
        // Invalid bounds JSON, skip region check
      }
    }

    const complaint = await prisma.complaint.create({
      data: {
        customerId: customer.id,
        stationId: station.id,
        problemType,
        description,
        images: JSON.stringify(images || []),
        orderNo: orderNo || null,
      },
    });

    return NextResponse.json({ success: true, id: complaint.id });
  } catch (error) {
    console.error("Create complaint error:", error);
    return NextResponse.json({ error: "提交投诉失败，请稍后重试" }, { status: 500 });
  }
}
