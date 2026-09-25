import type { Metadata } from "next";
import { DashboardView } from "@/features/protected/dashboard/components/dashboard-view";

export const metadata: Metadata = { title: "Mi panel" };

export default function Page() {
  return <DashboardView />;
}
