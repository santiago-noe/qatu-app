import { ANNOUNCEMENT } from "@/features/public/landing/lib/content";

export function AnnouncementBar() {
  return (
    <div className="flex h-10 items-center justify-center bg-ink px-4 text-center text-[13px] text-white md:text-sm">
      <p className="truncate">{ANNOUNCEMENT}</p>
    </div>
  );
}
