import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ComplaintDetailClient from "./complaint-detail-client";

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: { customer: true, station: true },
  });

  if (!complaint) {
    notFound();
  }

  return (
    <ComplaintDetailClient
      complaint={{
        id: complaint.id,
        problemType: complaint.problemType,
        description: complaint.description,
        status: complaint.status,
        customerPhone: complaint.customer.phone,
        customerNickname: complaint.customer.nickname,
        images: complaint.images,
        orderNo: complaint.orderNo,
        resolveType: complaint.resolveType,
        resolveRemark: complaint.resolveRemark,
        resolvedAt: complaint.resolvedAt?.toISOString() ?? null,
        createdAt: complaint.createdAt.toISOString(),
      }}
    />
  );
}
