"use client";

import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  Printer,
  MapPin,
  Phone,
  Store,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface QRCodeClientProps {
  stationName: string;
  stationPhone: string;
  stationAddress: string;
  qrCodeUrl: string | null;
  stationId: string;
}

export default function QRCodeClient({
  stationName,
  stationPhone,
  stationAddress,
  qrCodeUrl,
  stationId,
}: QRCodeClientProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  // The QR code value - links to customer binding page
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrValue = qrCodeUrl ?? `${baseUrl}/join/${stationId}`;

  const handleDownload = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 800;
      canvas.height = 800;
      ctx!.fillStyle = "white";
      ctx!.fillRect(0, 0, 800, 800);
      ctx!.drawImage(img, 0, 0, 800, 800);

      const link = document.createElement("a");
      link.download = `${stationName}-二维码.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success("二维码已下载");
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("无法打开打印窗口，请允许弹窗");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${stationName} - 二维码</title>
        <style>
          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
          }
          .qr-container {
            text-align: center;
            padding: 40px;
          }
          .station-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .station-info {
            font-size: 14px;
            color: #666;
            margin-bottom: 24px;
          }
          .qr-code {
            margin: 20px 0;
          }
          .instructions {
            font-size: 12px;
            color: #999;
            margin-top: 24px;
            max-width: 300px;
          }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="station-name">${stationName}</div>
          <div class="station-info">${stationAddress}</div>
          <div class="qr-code">${svgData}</div>
          <div class="station-info">扫码进入商城 · 优质生鲜送到家</div>
          <div class="instructions">
            <p>使用说明：</p>
            <p>1. 将此二维码打印并张贴在站点显眼位置</p>
            <p>2. 客户扫描二维码即可进入您的专属商城</p>
            <p>3. 建议尺寸：10cm x 10cm 或更大</p>
          </div>
        </div>
        <button class="no-print" onclick="window.print()" style="margin-top:20px;padding:10px 20px;cursor:pointer;">
          打印
        </button>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">我的二维码</h1>
        <p className="text-sm text-gray-500 mt-1">
          客户扫描二维码即可进入您的专属商城
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* QR Code display */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-base font-semibold">站点二维码</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div
                ref={qrRef}
                className="rounded-2xl bg-white p-6 shadow-lg shadow-blue-500/5 border border-gray-100"
              >
                <QRCodeSVG
                  value={qrValue}
                  size={280}
                  level="H"
                  includeMargin={true}
                  bgColor="#FFFFFF"
                  fgColor="#1F2937"
                  imageSettings={{
                    src: "https://picsum.photos/seed/ddcm-logo/60/60",
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>
              <div className="mt-6 text-center">
                <p className="text-lg font-semibold text-gray-900">{stationName}</p>
                <p className="text-sm text-blue-500 font-medium mt-1">
                  取货有问题？缺货/破损，扫这里！
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  站长马上处理，不走平台！
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  下载二维码
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-200 text-gray-600 hover:bg-gray-50"
                  onClick={handlePrint}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  打印
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Station info & instructions */}
        <div className="space-y-6">
          {/* Station info */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-900 text-base font-semibold">站点信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                  <Store className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">站点名称</p>
                  <p className="text-sm font-medium text-gray-900">{stationName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                  <Phone className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">联系电话</p>
                  <p className="text-sm font-medium text-gray-900">{stationPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                  <MapPin className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">站点地址</p>
                  <p className="text-sm font-medium text-gray-900">{stationAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-900 text-base font-semibold flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                使用说明
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-500">
                    1
                  </div>
                  <p className="text-sm text-gray-600 pt-0.5">
                    点击"下载二维码"按钮，保存二维码图片到手机
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-500">
                    2
                  </div>
                  <p className="text-sm text-gray-600 pt-0.5">
                    将二维码打印出来，建议尺寸 10cm x 10cm 或更大
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-500">
                    3
                  </div>
                  <p className="text-sm text-gray-600 pt-0.5">
                    将打印好的二维码张贴在站点门口、收银台等显眼位置
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-500">
                    4
                  </div>
                  <p className="text-sm text-gray-600 pt-0.5">
                    客户使用微信扫码即可进入您的专属商城下单购买
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
