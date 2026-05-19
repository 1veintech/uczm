import { prisma } from "@/lib/prisma";
import QRCodeClient from "./qr-code-client";

export default async function QRCodePage() {
  const station = await prisma.station.findFirst({
    where: { user: { email: "zhang@ddcm.com" } },
    include: { user: true },
  });

  if (!station) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">未找到站点信息</p>
      </div>
    );
  }

  return (
    <QRCodeClient
      stationName={station.name}
      stationPhone={station.phone}
      stationAddress={station.address}
      qrCodeUrl={station.qrCodeUrl}
      stationId={station.id}
    />
  );
}
