import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { receiverName, receiverPhone, receiverAddress, items } = body;

    if (!receiverName || !receiverPhone || !receiverAddress) {
      return NextResponse.json(
        { error: "请填写完整的收货信息" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "订单商品不能为空" },
        { status: 400 }
      );
    }

    // Get first customer and station for demo
    const customer = await prisma.customer.findFirst();
    if (!customer) {
      return NextResponse.json(
        { error: "未找到客户信息" },
        { status: 400 }
      );
    }

    const station = await prisma.station.findFirst();
    if (!station) {
      return NextResponse.json(
        { error: "未找到站点信息" },
        { status: 400 }
      );
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    // Generate order number
    const orderNo = `DD${Date.now().toString().slice(-10)}`;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNo,
        customerId: customer.id,
        stationId: station.id,
        totalAmount,
        status: "PAID",
        receiverName,
        receiverPhone,
        receiverAddress,
        payTime: new Date(),
        items: {
          create: items.map(
            (item: {
              productId: string;
              name: string;
              image: string;
              price: number;
              quantity: number;
            }) => ({
              productId: item.productId,
              productName: item.name,
              productImage: item.image,
              price: item.price,
              quantity: item.quantity,
              subtotal: item.price * item.quantity,
            })
          ),
        },
      },
    });

    return NextResponse.json({ success: true, orderNo: order.orderNo });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "创建订单失败，请稍后重试" },
      { status: 500 }
    );
  }
}
