"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Loader2, CheckCircle2, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";

interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [orderNo, setOrderNo] = useState("");
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  // Load saved addresses and auto-fill default
  useEffect(() => {
    const saved = localStorage.getItem("c_addresses");
    if (saved) {
      try {
        const addrs: SavedAddress[] = JSON.parse(saved);
        setSavedAddresses(addrs);
        const def = addrs.find((a) => a.isDefault);
        if (def) {
          setName(def.name);
          setPhone(def.phone);
          setAddress(`${def.province} ${def.city} ${def.district} ${def.detail}`);
        }
      } catch {}
    }
  }, []);

  const selectAddress = (addr: SavedAddress) => {
    setName(addr.name);
    setPhone(addr.phone);
    setAddress(`${addr.province} ${addr.city} ${addr.district} ${addr.detail}`);
    setShowAddressPicker(false);
  };

  const saveCurrentAddress = () => {
    if (!name.trim() || !phone.trim() || !address.trim()) return;
    // Parse address string back into parts (simple split)
    const parts = address.split(" ");
    const newAddr: SavedAddress = {
      id: `addr_${Date.now()}`,
      name,
      phone,
      province: parts[0] || "",
      city: parts[1] || "",
      district: parts[2] || "",
      detail: parts.slice(3).join(" ") || address,
      isDefault: savedAddresses.length === 0,
    };
    const exists = savedAddresses.some(
      (a) => a.name === name && a.phone === phone && a.detail === newAddr.detail
    );
    if (!exists) {
      const updated = [...savedAddresses, newAddr];
      setSavedAddresses(updated);
      localStorage.setItem("c_addresses", JSON.stringify(updated));
    }
  };

  const total = getTotal();

  const handlePay = async () => {
    if (!name.trim()) {
      toast.error("请填写收货人姓名");
      return;
    }
    if (!phone.trim() || phone.length < 11) {
      toast.error("请填写正确的手机号");
      return;
    }
    if (!address.trim()) {
      toast.error("请填写收货地址");
      return;
    }

    // Auto-save address
    saveCurrentAddress();

    setPaying(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverName: name,
          receiverPhone: phone,
          receiverAddress: address,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "创建订单失败");
        setPaying(false);
        return;
      }

      setOrderNo(data.orderNo);
      clearCart();
      setPaid(true);
      toast.success("支付成功");
    } catch {
      toast.error("网络错误，请稍后重试");
    } finally {
      setPaying(false);
    }
  };

  if (paid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">支付成功</h2>
        <p className="text-sm text-gray-500 mb-1">订单号: {orderNo}</p>
        <p className="text-xs text-gray-400 mb-6">请留意手机短信通知</p>
        <div className="flex gap-3">
          <Link
            href="/orders"
            className="mini-secondary px-5 py-2 text-sm"
          >
            查看订单
          </Link>
          <Link
            href="/"
            className="mini-primary px-5 py-2 text-sm font-medium"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <p className="text-sm text-gray-400 mb-4">购物车为空</p>
        <Link
          href="/mall"
          className="mini-primary px-6 py-2.5 text-sm font-semibold"
        >
          去购物
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen mini-page">
      {/* Header */}
      <div className="sticky top-0 z-40 mini-topbar">
        <div className="flex items-center h-12 px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="flex-1 text-center text-base font-semibold text-gray-800 pr-7">
            确认订单
          </h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 pb-32">
        {/* Receiver Info */}
        <div className="mini-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-800">收货信息</h3>
            </div>
            {savedAddresses.length > 0 && (
              <button
                onClick={() => setShowAddressPicker(!showAddressPicker)}
                className="text-xs text-blue-500 flex items-center gap-0.5"
              >
                选择地址 <ChevronDown size={12} className={showAddressPicker ? "rotate-180" : ""} />
              </button>
            )}
          </div>

          {/* Saved address picker */}
          {showAddressPicker && savedAddresses.length > 0 && (
            <div className="mb-3 space-y-2 max-h-40 overflow-y-auto">
              {savedAddresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => selectAddress(addr)}
                  className="w-full text-left p-2.5 rounded-lg mini-input hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-700">{addr.name}</span>
                    <span className="text-xs text-gray-500">{addr.phone}</span>
                    {addr.isDefault && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-blue-50 text-blue-500">默认</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                    {addr.province} {addr.city} {addr.district} {addr.detail}
                  </p>
                </button>
              ))}
            </div>
          )}

          <p className="text-[10px] text-blue-500 mb-2">下单后地址会自动保存</p>
          <div className="space-y-2.5">
            <div className="flex gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="收货人姓名"
                className="mini-input flex-1 px-3 py-2.5 text-sm placeholder:text-gray-400"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="手机号"
                maxLength={11}
                className="mini-input flex-1 px-3 py-2.5 text-sm placeholder:text-gray-400"
              />
            </div>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="详细收货地址"
              rows={2}
              className="mini-input w-full px-3 py-2.5 text-sm placeholder:text-gray-400 resize-none"
            />
          </div>
        </div>

        {/* Order Items */}
        <div className="mini-card p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            商品清单 ({items.length}件)
          </h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <p className="text-xs text-gray-800 font-medium line-clamp-2 leading-tight">
                    {item.name}
                  </p>
                  <div className="flex items-end justify-between">
                    <span className="text-sm font-bold text-blue-600">
                      ¥{item.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-400">
                      x{item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="mini-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">商品合计</span>
            <span className="text-base font-bold text-blue-600">
              ¥{total.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-600">配送费</span>
            <span className="text-sm text-green-500 font-medium">免运费</span>
          </div>
        </div>
      </div>

      {/* Bottom Pay Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 mini-bottom-bar px-4 py-3 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">需支付</p>
            <p className="text-xl font-bold text-blue-600">
              ¥{total.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handlePay}
            disabled={paying}
            className="mini-primary flex items-center gap-2 px-8 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {paying ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                支付中...
              </>
            ) : (
              "确认支付"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
