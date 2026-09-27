import { MapPin } from "lucide-react";
import { ANNOUNCEMENT } from "@/lib/site";

export function AnnouncementBar() {
  return (
    <div className="flex h-8 items-center justify-center gap-2 bg-footer px-4 text-[13px] text-white">
      <MapPin className="size-4 shrink-0 text-brand" strokeWidth={1.5} aria-hidden />
      <p className="truncate">{ANNOUNCEMENT}</p>
    </div>
  );
}
