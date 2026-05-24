"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

function getUserPhone(): string | null {
  try {
    const saved = localStorage.getItem("c_user");
    if (saved) { const parsed = JSON.parse(saved); return parsed.phone || null; }
  } catch {}
  return null;
}

export default function AddressPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    province: "",
    city: "",
    district: "",
    detail: "",
    isDefault: false,
  });

  useEffect(() => {
    const phone = getUserPhone();
    setUserPhone(phone);
    if (phone) {
      const saved = localStorage.getItem(`c_addresses_${phone}`);
      if (saved) { try { setAddresses(JSON.parse(saved)); } catch {} }
    }
  }, []);

  const saveAddresses = (addrs: Address[]) => {
    setAddresses(addrs);
    if (userPhone) localStorage.setItem(`c_addresses_${userPhone}`, JSON.stringify(addrs));
  };

  const resetForm = () => {
    setForm({ name: "", phone: "", province: "", city: "", district: "", detail: "", isDefault: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!form.name || !form.phone || !form.detail) {
      toast.error("请填写收货人、手机号和详细地址");
      return;
    }
    if (form.phone.length !== 11) {
      toast.error("请输入正确的手机号");
      return;
    }

    let updated: Address[];
    if (editingId) {
      updated = addresses.map((a) =>
        a.id === editingId ? { ...a, ...form } : a
      );
    } else {
      const newAddr: Address = {
        id: `addr_${Date.now()}`,
        ...form,
      };
      updated = [...addresses, newAddr];
    }

    if (form.isDefault) {
      updated = updated.map((a) => ({
        ...a,
        isDefault: a.id === (editingId || updated[updated.length - 1].id),
      }));
    }

    saveAddresses(updated);
    toast.success(editingId ? "地址已更新" : "地址已添加");
    resetForm();
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    saveAddresses(updated);
    toast.success("地址已删除");
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveAddresses(updated);
    toast.success("已设为默认地址");
  };

  const handleEdit = (addr: Address) => {
    setForm({
      name: addr.name,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      detail: addr.detail,
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  if (!userPhone) {
    return (
      <div className="min-h-screen mini-page">
        <div className="mini-topbar">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => history.back()} className="w-8 h-8 flex items-center justify-center">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-base font-bold text-gray-800 flex-1">收货地址</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <MapPin size={28} className="text-gray-300" />
          </div>
          <p className="text-sm text-gray-400 mb-4">请先登录后管理收货地址</p>
          <Link href="/mobile-login?redirect=/address" className="px-6 py-2.5 rounded-lg mini-primary text-sm font-medium active:scale-95 transition-transform">
            去登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mini-page">
      {/* Header */}
      <div className="mini-topbar">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => history.back()} className="w-8 h-8 flex items-center justify-center">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-base font-bold text-gray-800 flex-1">收货地址</h1>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="text-blue-500 text-sm font-medium"
          >
            新增
          </button>
        </div>
      </div>

      {/* Address List */}
      <div className="px-4 py-3 space-y-3">
        {addresses.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <MapPin size={28} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">暂无收货地址</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-2.5 rounded-lg mini-primary text-sm font-medium active:scale-95 transition-transform"
            >
              新增收货地址
            </button>
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className={`mini-card p-4 border ${addr.isDefault ? "border-blue-200" : "border-gray-100"} shadow-sm`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{addr.name}</span>
                    <span className="text-xs text-gray-500">{addr.phone}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 font-medium">默认</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    {addr.province} {addr.city} {addr.district} {addr.detail}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs text-gray-500 flex items-center gap-1 active:scale-95"
                  >
                    <Check size={12} /> 设为默认
                  </button>
                )}
                <div className="flex-1" />
                <button
                  onClick={() => handleEdit(addr)}
                  className="text-xs text-blue-500 px-3 py-1 active:scale-95"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-xs text-red-400 flex items-center gap-1 px-3 py-1 active:scale-95"
                >
                  <Trash2 size={12} /> 删除
                </button>
              </div>
            </div>
          ))
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="mini-card p-4  shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              {editingId ? "编辑地址" : "新增地址"}
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">收货人 *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="姓名"
                    className="w-full rounded-lg mini-input px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">手机号 *</label>
                  <input
                    type="tel"
                    maxLength={11}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                    placeholder="手机号"
                    className="w-full rounded-lg mini-input px-3 py-2.5 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">省</label>
                  <input
                    type="text"
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                    placeholder="省"
                    className="w-full rounded-lg mini-input px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">市</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="市"
                    className="w-full rounded-lg mini-input px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">区</label>
                  <input
                    type="text"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    placeholder="区"
                    className="w-full rounded-lg mini-input px-3 py-2.5 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">详细地址 *</label>
                <input
                  type="text"
                  value={form.detail}
                  onChange={(e) => setForm({ ...form, detail: e.target.value })}
                  placeholder="街道、楼栋、门牌号"
                  className="w-full rounded-lg mini-input px-3 py-2.5 text-sm"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-600">设为默认地址</span>
              </label>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={resetForm}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 active:scale-95"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-lg mini-primary text-sm font-medium active:scale-95"
              >
                保存
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom add button */}
      {!showForm && addresses.length > 0 && (
        <div className="mini-bottom-bar fixed bottom-0 left-0 right-0 p-4">
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="w-full py-3 rounded-lg mini-primary font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-blue-500/25"
          >
            <Plus size={18} />
            新增收货地址
          </button>
        </div>
      )}
    </div>
  );
}
