"use client";

import { useState } from "react";
import { ArrowLeft, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";

interface OrderItemData {
  id: string;
  productName: string;
  productImage: string | null;
  price: number;
  quantity: number;
}

interface OrderData {
  id: string;
  orderNo: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItemData[];
}

const orderTabs = [
  { key: "ALL", label: "全部" },
  { key: "UNPAID", label: "待付款" },
  { key: "PAID", label: "待发货" },
  { key: "SHIPPED", label: "已发货" },
  { key: "COMPLETED", label: "已完成" },
];

export function OrdersClient({ orders }: { orders: OrderData[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("ALL");

  const filteredOrders =
    activeTab === "ALL"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center h-12 px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1 active:scale-95 transition-transform">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="flex-1 text-center text-base font-semibold text-gray-800 pr-7">
            我的订单
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex px-2 overflow-x-auto scrollbar-hide">
          {orderTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-4 py-3 text-xs font-medium transition-colors relative ${
                activeTab === tab.key
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Order List */}
      <div className="px-4 py-3 space-y-2.5">
        {filteredOrders.map((order) => {
          const statusLabel =
            ORDER_STATUS_LABELS[order.status] || order.status;
          const statusColor = STATUS_COLORS[order.status] || "";

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-50"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <span className="text-[11px] text-gray-400 font-mono">
                  {order.orderNo}
                </span>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColor}`}
                >
                  {statusLabel}
                </span>
              </div>

              {/* Order Items */}
              <div className="px-4 pb-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3 py-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.productImage || `https://picsum.photos/seed/${item.id}/100/100`}
                      alt={item.productName}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <p className="text-xs text-gray-800 font-medium line-clamp-1 flex-1 mr-3">
                        {item.productName}
                      </p>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-gray-800">
                          ¥{item.price.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          x{item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50 bg-slate-50/50">
                <span className="text-[11px] text-gray-400">
                  {order.createdAt}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    共{order.items.reduce((s, i) => s + i.quantity, 0)}件
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    ¥{order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Package size={40} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">暂无订单</p>
          </div>
        )}
      </div>
    </div>
  );
}
