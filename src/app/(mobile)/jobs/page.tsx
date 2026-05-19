import { prisma } from "@/lib/prisma";
import { JobsClient } from "./jobs-client";

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    where: { status: "HIRING" },
    orderBy: { createdAt: "desc" },
  });

  const items = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    salary: job.salary,
    workLocation: job.workLocation,
    workLocationDetail: job.workLocationDetail || job.workLocation,
    requirements: job.requirements || "",
    contactPhone: job.contactPhone || "",
  }));

  return <JobsClient jobs={items} />;
}
