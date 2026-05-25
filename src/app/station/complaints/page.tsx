import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ComplaintsClient from "./complaints-client";

export default async function ComplaintsPage() {
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
  });

  if (!station) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">未找到站点信息</p>
      </div>
    );
  }

  const complaints = await prisma.complaint.findMany({
    where: { stationId: station.id },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ComplaintsClient
      complaints={complaints.map((c) => ({
        id: c.id,
        problemType: c.problemType,
        description: c.description,
        status: c.status,
        customerPhone: c.customer.phone,
        images: c.images,
        orderNo: c.orderNo,
        resolveType: c.resolveType,
        resolveRemark: c.resolveRemark,
        resolvedAt: c.resolvedAt?.toISOString() ?? null,
        createdAt: c.createdAt.toISOString(),
      }))}
    />
  );
}
