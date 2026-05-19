import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, receiverName, receiverPhone, receiverAddress, stationId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "订单无商品" }, { status: 400 });
    }

    const customer = await prisma.customer.findFirst();
    const station = stationId
      ? await prisma.station.findUnique({ where: { id: stationId } })
      : await prisma.station.findFirst({ where: { status: "APPROVED" } });

    if (!customer || !station) {
      return NextResponse.json({ error: "客户或站点不存在" }, { status: 400 });
    }

    const orderNo = `ORD${Date.now()}`;
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        orderNo,
        customerId: customer.id,
        stationId: station.id,
        totalAmount,
        status: "PAID",
        receiverName: receiverName || customer.nickname || "客户",
        receiverPhone: receiverPhone || customer.phone,
        receiverAddress: receiverAddress || "默认地址",
        payTime: new Date(),
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.name,
            productImage: item.image || "",
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "下单失败" }, { status: 500 });
  }
}
