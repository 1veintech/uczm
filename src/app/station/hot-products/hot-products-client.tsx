"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Flame,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface HotProduct {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  pddPath: string;
  sortOrder: number;
  status: string;
  createdAt: string;
}

interface HotProductsClientProps {
  products: HotProduct[];
}

export default function HotProductsClient({ products }: HotProductsClientProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<HotProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formPddPath, setFormPddPath] = useState("");

  const resetForm = () => {
    setFormTitle("");
    setFormImageUrl("");
    setFormPrice("");
    setFormPddPath("");
  };

  const openEditDialog = (product: HotProduct) => {
    setSelectedProduct(product);
    setFormTitle(product.title);
    setFormImageUrl(product.imageUrl);
    setFormPrice(String(product.price));
    setFormPddPath(product.pddPath);
    setShowEditDialog(true);
  };

  const handleCreate = async () => {
    if (!formTitle || !formPrice || !formPddPath) {
      toast.error("请填写必填字段");
      return;
    }
    if (products.length >= 20) {
      toast.error("最多添加20个爆品");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/hot-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          imageUrl: formImageUrl || `https://picsum.photos/seed/${Date.now()}/400/400`,
          price: parseFloat(formPrice),
          pddPath: formPddPath,
          sortOrder: products.length,
        }),
      });
      if (res.ok) {
        toast.success("添加成功");
        setShowCreateDialog(false);
        resetForm();
        window.location.reload();
      } else {
        toast.error("添加失败");
      }
    } catch {
      toast.error("添加失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedProduct || !formTitle || !formPrice) {
      toast.error("请填写必填字段");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/hot-products/${selectedProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          imageUrl: formImageUrl,
          price: parseFloat(formPrice),
          pddPath: formPddPath,
        }),
      });
      if (res.ok) {
        toast.success("更新成功");
        setShowEditDialog(false);
        setSelectedProduct(null);
        resetForm();
        window.location.reload();
      } else {
        toast.error("更新失败");
      }
    } catch {
      toast.error("更新失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`/api/hot-products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(newStatus === "ACTIVE" ? "已上架" : "已下架");
        window.location.reload();
      } else {
        toast.error("操作失败");
      }
    } catch {
      toast.error("操作失败，请重试");
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("确定要删除此商品吗？")) return;
    try {
      const res = await fetch(`/api/hot-products/${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("删除成功");
        window.location.reload();
      } else {
        toast.error("删除失败");
      }
    } catch {
      toast.error("删除失败，请重试");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">爆品管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            管理推荐商品，最多添加20个 ({products.length}/20)
          </p>
        </div>
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
          onClick={() => setShowCreateDialog(true)}
          disabled={products.length >= 20}
        >
          <Plus className="mr-2 h-4 w-4" />
          添加商品
        </Button>
      </div>

      {/* Product grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16">
          <div className="rounded-full bg-gray-100 p-4 mb-4">
            <Flame className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium mb-1">暂无爆品商品</p>
          <p className="text-sm text-gray-400 mb-5">添加商品推荐给客户</p>
          <Button
            variant="outline"
            className="border-gray-200 text-gray-600 hover:bg-gray-50"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            添加第一个商品
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className="bg-white border border-gray-200 overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-lg font-bold text-white">¥{product.price.toFixed(2)}</p>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge
                    className={`text-xs font-medium ${
                      product.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}
                    variant="outline"
                  >
                    {product.status === "ACTIVE" ? "上架中" : "已下架"}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-3">
                  {product.title}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={product.status === "ACTIVE"}
                      onCheckedChange={() =>
                        handleToggleStatus(product.id, product.status)
                      }
                      className="data-checked:bg-blue-500"
                    />
                    <span className="text-xs text-gray-500">
                      {product.status === "ACTIVE" ? "上架" : "下架"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                      onClick={() => openEditDialog(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">添加爆品</DialogTitle>
            <DialogDescription className="text-gray-500">
              添加推荐商品，展示给客户
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">商品标题 *</p>
              <Input
                placeholder="输入商品标题"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">图片URL</p>
              <Input
                placeholder="https://... (留空使用随机图片)"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">价格 *</p>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">拼多多路径 *</p>
              <Input
                placeholder="拼多多商品路径"
                value={formPddPath}
                onChange={(e) => setFormPddPath(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
            >
              取消
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
              onClick={handleCreate}
              disabled={isSubmitting}
            >
              {isSubmitting ? "添加中..." : "添加商品"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            setSelectedProduct(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">编辑商品</DialogTitle>
            <DialogDescription className="text-gray-500">
              修改商品信息
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">商品标题 *</p>
              <Input
                placeholder="输入商品标题"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">图片URL</p>
              <Input
                placeholder="https://..."
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">价格 *</p>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">拼多多路径 *</p>
              <Input
                placeholder="拼多多商品路径"
                value={formPddPath}
                onChange={(e) => setFormPddPath(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedProduct(null);
                resetForm();
              }}
            >
              取消
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
              onClick={handleUpdate}
              disabled={isSubmitting}
            >
              {isSubmitting ? "保存中..." : "保存修改"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
