import { TRUST_ITEMS } from "../lib/content";

export function Trust() {
  return (
    <section className="bg-surface-lowest py-14" aria-labelledby="confianza">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="mx-auto max-w-2xl space-y-2 pb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-2">
            Transparencia desde el día uno
          </p>
          <h2 id="confianza" className="text-2xl font-extrabold md:text-3xl">
            Confianza real, sin promesas infladas
          </h2>
          <p className="text-sm text-on-surface-variant">
            Reglas claras para que alquiles y contrates con información completa.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_ITEMS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="space-y-3 rounded-2xl bg-surface-low p-5">
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary-fixed text-primary">
                <Icon className="size-6" aria-hidden />
              </span>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
