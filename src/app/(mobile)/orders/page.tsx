import { prisma } from "@/lib/prisma";
import { OrdersClient } from "./orders-client";

export default async function OrdersPage() {
  // Get first customer for demo
  const customer = await prisma.customer.findFirst();

  if (!customer) {
    return <OrdersClient orders={[]} />;
  }

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const orderData = orders.map((order) => ({
    id: order.id,
    orderNo: order.orderNo,
    status: order.status,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt.toLocaleString("zh-CN"),
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      productImage: item.productImage,
      price: item.price,
      quantity: item.quantity,
    })),
  }));

  return <OrdersClient orders={orderData} />;
}
