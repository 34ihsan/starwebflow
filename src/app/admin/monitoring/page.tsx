import { Metadata } from "next";
import MonitoringClient from "./MonitoringClient";

export const metadata: Metadata = {
  title: "Service Monitoring & Uptime",
  description: "Monitor websites, web apps, AI agents, and automations.",
};

export default function MonitoringPage() {
  return (
    <div className="flex flex-col gap-6 w-full p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Track uptime, detect issues, and manage maintenance contracts for client services.
          </p>
        </div>
      </div>
      
      <MonitoringClient />
    </div>
  );
}
