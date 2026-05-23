"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { OrdersClient } from "./orders-client";

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

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("c_user");
    let phone = "";
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        phone = parsed.phone || "";
      } catch {}
    }

    if (!phone) {
      setLoggedIn(false);
      setLoading(false);
      return;
    }

    setLoggedIn(true);
    fetch(`/api/orders?phone=${phone}`)
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen mini-page flex items-center justify-center">
        <p className="text-sm text-gray-400">加载中...</p>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen mini-page">
        <div className="sticky top-0 z-40 mini-topbar">
          <div className="flex items-center h-12 px-4">
            <button onClick={() => router.back()} className="p-1 -ml-1 active:scale-95 transition-transform">
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <h1 className="flex-1 text-center text-base font-semibold text-gray-800 pr-7">
              我的订单
            </h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-24 px-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <ShoppingBag size={28} className="text-gray-300" />
          </div>
          <p className="text-sm text-gray-500 font-medium">请先登录查看订单</p>
          <Link href="/home" className="mt-5 rounded-lg bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white active:scale-95 transition-transform">
            去登录
          </Link>
        </div>
      </div>
    );
  }

  return <OrdersClient orders={orders} />;
}
