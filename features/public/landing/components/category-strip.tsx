import Link from "next/link";
import { TOOL_CATEGORIES, TRADE_CATEGORIES } from "../lib/content";
import { buildSearchUrl, toSlug } from "../lib/search";

// Tira horizontal de categorías: cada una lleva a la búsqueda ya preparada.
export function CategoryStrip() {
  const items = [
    ...TOOL_CATEGORIES.map((c) => ({
      key: `rent-${c.title}`,
      icon: c.icon,
      label: c.tag,
      href: buildSearchUrl({ tab: "rent", category: toSlug(c.tag) }),
    })),
    ...TRADE_CATEGORIES.map((c) => ({
      key: `hire-${c.title}`,
      icon: c.icon,
      label: c.title,
      href: buildSearchUrl({ tab: "hire", category: toSlug(c.title) }),
    })),
  ];

  return (
    <nav aria-label="Categorías" className="border-b border-border bg-surface">
      <ul className="no-scrollbar mx-auto flex max-w-[1280px] snap-x gap-2 overflow-x-auto px-4 py-3 md:gap-4 md:px-8">
        {items.map(({ key, icon: Icon, label, href }) => (
          <li key={key} className="snap-start">
            <Link
              href={href}
              className="flex min-w-[84px] flex-col items-center gap-1.5 rounded-xl border-b-2 border-transparent px-3 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:border-outline hover:text-on-surface"
            >
              <Icon className="size-6" aria-hidden />
              <span className="whitespace-nowrap">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
