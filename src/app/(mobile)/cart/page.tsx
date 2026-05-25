"use client";

import { useState, useEffect } from "react";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCart();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(items.map((i) => i.productId))
  );

  // 同步：商品被删除后，移除已不存在的选中项
  useEffect(() => {
    setSelectedIds((prev) => {
      const productIds = new Set(items.map((i) => i.productId));
      let changed = false;
      const next = new Set<string>();
      for (const id of prev) {
        if (productIds.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [items]);

  const toggleSelect = (productId: string) => {
    const next = new Set(selectedIds);
    if (next.has(productId)) next.delete(productId);
    else next.add(productId);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.productId)));
    }
  };

  const handleDeleteSelected = () => {
    selectedIds.forEach((id) => removeItem(id));
    setSelectedIds(new Set());
  };

  const selectedItems = items.filter((i) => selectedIds.has(i.productId));
  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 mini-page">
        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <ShoppingCart size={40} className="text-blue-300" />
        </div>
        <h2 className="text-base font-semibold text-gray-700 mb-1">
          购物车是空的
        </h2>
        <p className="text-sm text-gray-400 mb-6">快去商城逛逛吧</p>
        <Link
          href="/mall"
          className="px-6 py-2.5 mini-primary text-white text-sm font-semibold shadow-lg shadow-blue-500/25 active:scale-95 transition-transform"
        >
          去逛逛
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen mini-page pb-36">
      {/* Header */}
      <div className="sticky top-0 z-40 mini-topbar">
        <div className="flex items-center justify-between h-12 px-4">
          <h1 className="text-base font-semibold text-gray-800">
            购物车 ({items.length})
          </h1>
          {selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="text-xs text-red-500 font-medium active:text-red-600"
            >
              删除所选
            </button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="px-4 py-3 space-y-2.5">
        {items.map((item) => (
          <div
            key={item.productId}
            className="mini-card p-3 flex gap-3 "
          >
            {/* Checkbox */}
            <button
              onClick={() => toggleSelect(item.productId)}
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-2 transition-colors ${
                selectedIds.has(item.productId)
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-300"
              }`}
            >
              {selectedIds.has(item.productId) && (
                <svg
                  width="10"
                  height="8"
                  viewBox="0 0 10 8"
                  fill="none"
                >
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            />

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <p className="text-xs text-gray-800 font-medium line-clamp-2 leading-snug">
                {item.name}
              </p>
              <div className="flex items-end justify-between mt-1.5">
                <span className="text-[15px] font-bold text-blue-600">
                  ¥{item.price.toFixed(2)}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center active:bg-slate-200 transition-colors"
                  >
                    <Minus size={12} className="text-gray-600" />
                  </button>
                  <span className="w-6 text-center text-xs font-semibold text-gray-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center active:bg-slate-200 transition-colors"
                  >
                    <Plus size={12} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-50 mini-bottom-bar px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                selectedIds.size === items.length && items.length > 0
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-300"
              }`}
            >
              {selectedIds.size === items.length && items.length > 0 && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            <span className="text-xs text-gray-600">全选</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500">合计</p>
              <p className="text-lg font-bold text-blue-600">
                ¥{selectedTotal.toFixed(2)}
              </p>
            </div>
            <Link
              href="/checkout"
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                selectedItems.length > 0
                  ? "mini-primary text-white shadow-lg shadow-blue-500/25 active:scale-95"
                  : "bg-gray-200 text-gray-400 pointer-events-none"
              }`}
            >
              去结算 ({selectedItems.length})
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
