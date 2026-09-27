import type { Metadata } from "next";
import { DashboardView } from "@/features/protected/dashboard/components/dashboard-view";
import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = { title: "Mi panel" };

export default async function Page() {
  const user = await getCurrentUser();
  return <DashboardView user={user} />;
}
