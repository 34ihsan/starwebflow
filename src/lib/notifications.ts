import { prisma } from "@/lib/prisma";

export async function createNotification(data: {
  tenantId: string;
  title: string;
  message: string;
  type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "EMAIL";
  link?: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        tenantId: data.tenantId,
        title: data.title,
        message: data.message,
        type: data.type || "INFO",
        link: data.link,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}
