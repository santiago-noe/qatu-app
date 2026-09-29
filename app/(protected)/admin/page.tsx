import { redirect } from "next/navigation";
import { ADMIN_SECTIONS } from "@/features/protected/admin/lib/admin-nav";

export default function Page() {
  redirect(ADMIN_SECTIONS[0].href);
}
