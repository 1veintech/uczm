import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import QRCodeClient from "./qr-code-client";

export default async function QRCodePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "STATION_MASTER" && session.user.role !== "SUPER_ADMIN")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">无权访问</p>
      </div>
    );
  }

  const station = await prisma.station.findFirst({
    where: { userId: session.user.id },
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
