"use client";

import { useState } from "react";
import { Plus, Search, ShoppingCart, SlidersHorizontal, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCart, useCartItemCount, useCartTotal } from "@/hooks/use-cart";

interface ProductItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  salesCount: number;
  stock: number;
}

const categories = [
  { key: "all", label: "推荐" },
  { key: "fresh", label: "生鲜" },
  { key: "daily", label: "日用" },
  { key: "beauty", label: "美妆" },
  { key: "home", label: "家居" },
  { key: "hot", label: "爆款" },
];

export function MallClient({ products }: { products: ProductItem[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const addItem = useCart((s) => s.addItem);
  const total = useCartTotal();
  const itemCount = useCartItemCount();

  const filtered = search.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const handleAddToCart = (product: ProductItem) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
    });
  };

  return (
    <div className="min-h-screen mini-premium-bg pb-6">
      <section className="px-4 pt-4">
        <div className="mini-glass-panel-dark overflow-hidden p-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.2em] text-white/65">STATION MALL</p>
              <h1 className="mt-2 text-2xl font-semibold">站长商场</h1>
              <p className="mt-2 text-sm leading-5 text-white/72">
                优选好物、购物车、订单结算集中管理。
              </p>
            </div>
            <Link href="/cart" className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-white/14 backdrop-blur-md transition active:scale-95">
              <ShoppingCart size={21} />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-white/12 px-3 py-3">
              <p className="text-[11px] text-white/60">精选商品</p>
              <p className="mt-1 text-lg font-semibold">{products.length}</p>
            </div>
            <div className="rounded-lg bg-white/12 px-3 py-3">
              <p className="text-[11px] text-white/60">购物车</p>
              <p className="mt-1 text-lg font-semibold">{itemCount}</p>
            </div>
            <div className="rounded-lg bg-white/12 px-3 py-3">
              <p className="text-[11px] text-white/60">合计</p>
              <p className="mt-1 text-lg font-semibold">¥{total.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pt-4">
        <div className="mini-glass-panel p-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索商品、品牌、分类"
              className="mini-input h-11 w-full pl-10 pr-11 text-sm placeholder:text-slate-400"
            />
            <SlidersHorizontal size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  activeCategory === cat.key
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "bg-white/80 text-slate-500"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 pt-3">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((product) => (
            <article key={product.id} className="mini-glass-panel overflow-hidden transition-transform active:scale-[0.98]">
              <Link href={`/mall/${product.id}`} className="block">
                <div className="relative aspect-[1/1.05] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  {product.originalPrice != null && product.originalPrice > product.price && (
                    <span className="absolute left-2 top-2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      省{(product.originalPrice - product.price).toFixed(0)}
                    </span>
                  )}
                </div>
              </Link>
              <div className="p-3">
                <div className="mb-2 flex items-center gap-1 text-[10px] font-medium text-blue-600">
                  <Sparkles size={11} />
                  站长精选
                </div>
                <p className="line-clamp-2 min-h-[36px] text-xs font-semibold leading-snug text-slate-800">
                  {product.name}
                </p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-base font-bold text-blue-600">
                      <span className="text-[10px]">¥</span>{product.price.toFixed(1)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      已售{product.salesCount > 1000 ? `${(product.salesCount / 1000).toFixed(1)}k` : product.salesCount}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 transition active:scale-90"
                    aria-label="加入购物车"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Search size={40} className="mb-3 text-slate-300" />
          <p className="text-sm text-slate-400">没有找到相关商品</p>
        </div>
      )}

      {itemCount > 0 && (
        <Link
          href="/cart"
          className="fixed bottom-24 right-4 z-50 flex items-center gap-2.5 rounded-full bg-slate-950 py-2.5 pl-4 pr-5 text-white shadow-2xl shadow-slate-900/20 transition active:scale-95"
        >
          <ShoppingCart size={18} />
          <span className="text-sm font-bold">¥{total.toFixed(2)}</span>
        </Link>
      )}
    </div>
  );
}
