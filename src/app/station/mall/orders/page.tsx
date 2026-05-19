import { prisma } from "@/lib/prisma";
import OrdersClient from "./orders-client";

export default async function OrdersPage() {
  const station = await prisma.station.findFirst({
    where: { user: { email: "zhang@ddcm.com" } },
  });

  if (!station) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">未找到站点信息</p>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { stationId: station.id },
    include: {
      customer: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <OrdersClient
      orders={orders.map((o) => ({
        id: o.id,
        orderNo: o.orderNo,
        customerName: o.receiverName,
        customerPhone: o.receiverPhone,
        totalAmount: o.totalAmount,
        status: o.status,
        logisticsCompany: o.logisticsCompany,
        logisticsNo: o.logisticsNo,
        remark: o.remark,
        createdAt: o.createdAt.toISOString(),
        items: o.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          productImage: item.productImage,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
      }))}
    />
  );
}
