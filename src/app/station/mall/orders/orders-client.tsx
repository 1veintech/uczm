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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ORDER_STATUS_LABELS,
  STATUS_COLORS,
  LOGISTICS_COMPANIES,
} from "@/lib/constants";
import { format } from "date-fns";
import {
  Eye,
  Truck,
  Search,
  Package,
  ShoppingBag,
  DollarSign,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  productName: string;
  productImage: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: string;
  logisticsCompany: string | null;
  logisticsNo: string | null;
  remark: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface OrdersClientProps {
  orders: Order[];
}

export default function OrdersClient({ orders }: OrdersClientProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showShipDialog, setShowShipDialog] = useState(false);
  const [shipCompany, setShipCompany] = useState("");
  const [shipNo, setShipNo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredOrders = orders.filter((o) => {
    if (activeTab !== "all" && o.status !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderNo.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
      );
    }
    return true;
  });

  const handleShip = async () => {
    if (!selectedOrder || !shipCompany || !shipNo) {
      toast.error("请填写物流信息");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logisticsCompany: shipCompany,
          logisticsNo: shipNo,
        }),
      });
      if (res.ok) {
        toast.success("发货成功");
        setShowShipDialog(false);
        setShipCompany("");
        setShipNo("");
        window.location.reload();
      } else {
        toast.error("发货失败");
      }
    } catch {
      toast.error("发货失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "PAID").length,
    shipped: orders.filter((o) => o.status === "SHIPPED").length,
    completed: orders.filter((o) => o.status === "COMPLETED").length,
    totalAmount: orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.totalAmount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">订单管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理商城订单</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="搜索订单号、客户..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:w-64 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总订单</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3">
              <Package className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待发货</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已发货</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">{stats.shipped}</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3">
              <Truck className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总成交额</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">
                ¥{stats.totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <DollarSign className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" onValueChange={(v) => setActiveTab(v ?? "all")}>
        <TabsList className="bg-gray-100 border border-gray-200 p-1">
          <TabsTrigger value="all" className="data-[active]:bg-white data-[active]:text-gray-900 data-[active]:shadow-sm text-gray-500">
            全部 ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="PAID" className="data-[active]:bg-white data-[active]:text-amber-600 data-[active]:shadow-sm text-gray-500">
            待发货 ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="SHIPPED" className="data-[active]:bg-white data-[active]:text-blue-600 data-[active]:shadow-sm text-gray-500">
            已发货 ({stats.shipped})
          </TabsTrigger>
          <TabsTrigger value="COMPLETED" className="data-[active]:bg-white data-[active]:text-emerald-600 data-[active]:shadow-sm text-gray-500">
            已完成 ({stats.completed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="text-gray-600 font-medium">订单号</TableHead>
                  <TableHead className="text-gray-600 font-medium">客户</TableHead>
                  <TableHead className="text-gray-600 font-medium">商品</TableHead>
                  <TableHead className="text-gray-600 font-medium">金额</TableHead>
                  <TableHead className="text-gray-600 font-medium">状态</TableHead>
                  <TableHead className="text-gray-600 font-medium">下单时间</TableHead>
                  <TableHead className="text-gray-600 font-medium text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-gray-400">
                      暂无订单
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-mono text-xs text-gray-500">
                        {order.orderNo}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                          <p className="text-xs text-gray-400">
                            {order.customerPhone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {order.items.slice(0, 2).map((item, i) => (
                            <div
                              key={i}
                              className="h-8 w-8 rounded bg-gray-100 overflow-hidden border border-gray-200"
                            >
                              <img
                                src={
                                  item.productImage ??
                                  `https://picsum.photos/seed/item${i}/32/32`
                                }
                                alt={item.productName}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{order.items.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-900">
                        ¥{order.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${STATUS_COLORS[order.status] ?? ""}`}
                          variant="outline"
                        >
                          {ORDER_STATUS_LABELS[order.status] ?? order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-400">
                        {format(new Date(order.createdAt), "MM-dd HH:mm")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status === "PAID" && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowShipDialog(true);
                              }}
                            >
                              <Truck className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-lg bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">订单详情</DialogTitle>
            <DialogDescription className="text-gray-500">
              订单号: {selectedOrder?.orderNo}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">收货人</p>
                  <p className="text-sm font-medium text-gray-900">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">联系电话</p>
                  <p className="text-sm text-gray-700">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">订单金额</p>
                  <p className="text-sm font-semibold text-blue-600">
                    ¥{selectedOrder.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">订单状态</p>
                  <Badge
                    className={`text-xs mt-0.5 ${STATUS_COLORS[selectedOrder.status] ?? ""}`}
                    variant="outline"
                  >
                    {ORDER_STATUS_LABELS[selectedOrder.status] ?? selectedOrder.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">商品列表</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                    >
                      <div className="h-10 w-10 rounded bg-gray-200 overflow-hidden border border-gray-200">
                        <img
                          src={
                            item.productImage ??
                            "https://picsum.photos/seed/default/40/40"
                          }
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-400">
                          ¥{item.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ¥{item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.logisticsCompany && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">物流信息</p>
                  <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                    <p className="text-sm text-gray-700">
                      {selectedOrder.logisticsCompany} - {selectedOrder.logisticsNo}
                    </p>
                  </div>
                </div>
              )}

              {selectedOrder.remark && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">备注</p>
                  <p className="text-sm text-gray-600 rounded-lg bg-gray-50 border border-gray-100 p-3">
                    {selectedOrder.remark}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ship dialog */}
      <Dialog
        open={showShipDialog}
        onOpenChange={(open) => {
          setShowShipDialog(open);
          if (!open) {
            setShipCompany("");
            setShipNo("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">订单发货</DialogTitle>
            <DialogDescription className="text-gray-500">
              填写物流信息完成发货
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">物流公司</p>
              <Select value={shipCompany} onValueChange={(v) => setShipCompany(v ?? "")}>
                <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                  <SelectValue placeholder="选择物流公司" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {LOGISTICS_COMPANIES.map((company) => (
                    <SelectItem
                      key={company}
                      value={company}
                      className="text-gray-900 hover:bg-gray-50"
                    >
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">物流单号</p>
              <Input
                placeholder="输入物流单号"
                value={shipNo}
                onChange={(e) => setShipNo(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
              onClick={() => {
                setShowShipDialog(false);
                setShipCompany("");
                setShipNo("");
              }}
            >
              取消
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
              onClick={handleShip}
              disabled={isSubmitting}
            >
              {isSubmitting ? "发货中..." : "确认发货"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
