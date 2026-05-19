"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

interface MallProduct {
  id: string;
  name: string;
  images: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  stock: number;
  salesCount: number;
  status: string;
  createdAt: string;
}

interface MallProductsClientProps {
  products: MallProduct[];
}

export default function MallProductsClient({ products }: MallProductsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MallProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formImages, setFormImages] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formStock, setFormStock] = useState("");

  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  const resetForm = () => {
    setFormName("");
    setFormImages("");
    setFormDescription("");
    setFormPrice("");
    setFormOriginalPrice("");
    setFormStock("");
  };

  const openEditDialog = (product: MallProduct) => {
    setSelectedProduct(product);
    setFormName(product.name);
    setFormImages(product.images);
    setFormDescription(product.description ?? "");
    setFormPrice(String(product.price));
    setFormOriginalPrice(product.originalPrice ? String(product.originalPrice) : "");
    setFormStock(String(product.stock));
    setShowEditDialog(true);
  };

  const handleCreate = async () => {
    if (!formName || !formPrice) {
      toast.error("请填写必填字段");
      return;
    }
    setIsSubmitting(true);
    try {
      const imagesArray = formImages
        ? formImages.split(",").map((s) => s.trim()).filter(Boolean)
        : [`https://picsum.photos/seed/${Date.now()}/400/400`];
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          images: JSON.stringify(imagesArray),
          description: formDescription,
          price: parseFloat(formPrice),
          originalPrice: formOriginalPrice ? parseFloat(formOriginalPrice) : null,
          stock: parseInt(formStock) || 0,
        }),
      });
      if (res.ok) {
        toast.success("商品添加成功");
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
    if (!selectedProduct || !formName || !formPrice) {
      toast.error("请填写必填字段");
      return;
    }
    setIsSubmitting(true);
    try {
      const imagesArray = formImages
        ? formImages.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          images: JSON.stringify(imagesArray),
          description: formDescription,
          price: parseFloat(formPrice),
          originalPrice: formOriginalPrice ? parseFloat(formOriginalPrice) : null,
          stock: parseInt(formStock) || 0,
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
      const res = await fetch(`/api/products/${productId}`, {
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
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
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

  const getFirstImage = (imagesStr: string): string => {
    try {
      const arr = JSON.parse(imagesStr);
      return Array.isArray(arr) && arr.length > 0
        ? arr[0]
        : "https://picsum.photos/seed/default/80/80";
    } catch {
      return "https://picsum.photos/seed/default/80/80";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">商品管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理商城商品 ({products.length}个商品)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="搜索商品..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:w-48 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            添加商品
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总商品</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3">
              <Package className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">上架中</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {products.filter((p) => p.status === "ACTIVE").length}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <ShoppingBag className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总销量</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {products.reduce((sum, p) => sum + p.salesCount, 0)}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <ShoppingBag className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总库存</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {products.reduce((sum, p) => sum + p.stock, 0)}
              </p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-3">
              <Package className="h-6 w-6 text-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Product table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="text-gray-600 font-medium">商品</TableHead>
              <TableHead className="text-gray-600 font-medium">价格</TableHead>
              <TableHead className="text-gray-600 font-medium">库存</TableHead>
              <TableHead className="text-gray-600 font-medium">销量</TableHead>
              <TableHead className="text-gray-600 font-medium">状态</TableHead>
              <TableHead className="text-gray-600 font-medium">创建时间</TableHead>
              <TableHead className="text-gray-600 font-medium text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-gray-400">
                  {searchQuery ? "未找到匹配的商品" : "暂无商品，点击\"添加商品\"开始"}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        <img
                          src={getFirstImage(product.images)}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        {product.description && (
                          <p className="text-xs text-gray-400 truncate">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        ¥{product.price.toFixed(2)}
                      </p>
                      {product.originalPrice && (
                        <p className="text-xs text-gray-400 line-through">
                          ¥{product.originalPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-sm font-medium ${
                        product.stock <= 10 ? "text-red-500" : "text-gray-700"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {product.salesCount}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.status === "ACTIVE"}
                        onCheckedChange={() =>
                          handleToggleStatus(product.id, product.status)
                        }
                        className="data-checked:bg-blue-500"
                      />
                      <Badge
                        className={`text-xs ${STATUS_COLORS[product.status] ?? ""}`}
                        variant="outline"
                      >
                        {product.status === "ACTIVE" ? "上架" : "下架"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-400">
                    {format(new Date(product.createdAt), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
            <DialogTitle className="text-gray-900">添加商品</DialogTitle>
            <DialogDescription className="text-gray-500">
              添加新的商城商品
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">商品名称 *</p>
              <Input
                placeholder="输入商品名称"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">图片URL (多个用逗号分隔)</p>
              <Input
                placeholder="https://img1.jpg, https://img2.jpg"
                value={formImages}
                onChange={(e) => setFormImages(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">商品描述</p>
              <Textarea
                placeholder="输入商品描述..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1.5">售价 *</p>
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
                <p className="text-xs font-medium text-gray-600 mb-1.5">原价</p>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formOriginalPrice}
                  onChange={(e) => setFormOriginalPrice(e.target.value)}
                  className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">库存</p>
              <Input
                type="number"
                placeholder="0"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
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
              <p className="text-xs font-medium text-gray-600 mb-1.5">商品名称 *</p>
              <Input
                placeholder="输入商品名称"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">图片URL (多个用逗号分隔)</p>
              <Input
                placeholder="https://img1.jpg, https://img2.jpg"
                value={formImages}
                onChange={(e) => setFormImages(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">商品描述</p>
              <Textarea
                placeholder="输入商品描述..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1.5">售价 *</p>
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
                <p className="text-xs font-medium text-gray-600 mb-1.5">原价</p>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formOriginalPrice}
                  onChange={(e) => setFormOriginalPrice(e.target.value)}
                  className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">库存</p>
              <Input
                type="number"
                placeholder="0"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
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
