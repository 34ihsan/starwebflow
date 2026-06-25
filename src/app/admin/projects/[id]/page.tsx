import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProjectDetailClient from "./ProjectDetailClient";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      manager: true,
      tasks: true,
      assets: true,
      invoices: true,
    },
  });

  if (!project) {
    return notFound();
  }

  const users = await prisma.user.findMany({
    where: {
      tenantId: project.tenantId,
      deletedAt: null,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return <ProjectDetailClient project={project} users={users} />;
}
