import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import RecruitmentClient from "./recruitment-client";

export default async function RecruitmentPage() {
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

  const jobs = await prisma.job.findMany({
    where: { stationId: station.id },
    include: {
      applications: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <RecruitmentClient
      jobs={jobs.map((j) => ({
        id: j.id,
        title: j.title,
        requirements: j.requirements,
        salary: j.salary,
        workLocation: j.workLocation,
        contactPhone: j.contactPhone,
        status: j.status,
        createdAt: j.createdAt.toISOString(),
        applications: j.applications.map((a) => ({
          id: a.id,
          name: a.name,
          phone: a.phone,
          status: a.status,
          createdAt: a.createdAt.toISOString(),
        })),
      }))}
    />
  );
}
