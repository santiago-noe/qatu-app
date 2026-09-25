import { TOOL_CATEGORIES, TRADE_CATEGORIES } from "../lib/content";

// Categorías informativas: los enlaces a búsqueda se activan con la feature 005.
export function Categories() {
  return (
    <>
      <section id="herramientas" className="bg-surface py-14" aria-labelledby="h-herr">
        <div className="mx-auto max-w-[1200px] space-y-8 px-4 md:px-6">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Alquiler
            </p>
            <h2 id="h-herr" className="text-2xl font-extrabold md:text-3xl">
              Herramientas y equipos
            </h2>
            <p className="max-w-xl text-sm text-on-surface-variant">
              Categorías con las que empezamos en el piloto de Huamanga.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOL_CATEGORIES.map(({ icon: Icon, tag, title, text }) => (
              <li
                key={title}
                className="space-y-3 rounded-2xl bg-surface-lowest p-5 shadow-sm"
              >
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary-fixed text-primary">
                  <Icon className="size-6" aria-hidden />
                </span>
                <p className="text-xs font-bold uppercase tracking-wide text-secondary">
                  {tag}
                </p>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="text-sm text-on-surface-variant">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="servicios" className="bg-surface-low py-14" aria-labelledby="h-serv">
        <div className="mx-auto max-w-[1200px] space-y-8 px-4 md:px-6">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Servicios
            </p>
            <h2 id="h-serv" className="text-2xl font-extrabold md:text-3xl">
              Oficios para tu hogar o negocio
            </h2>
            <p className="max-w-xl text-sm text-on-surface-variant">
              Contrata con precio fijo o pide cotizaciones a varios técnicos.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRADE_CATEGORIES.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="space-y-3 rounded-2xl bg-surface-lowest p-5 shadow-sm"
              >
                <span className="flex size-12 items-center justify-center rounded-xl bg-secondary-fixed text-secondary">
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="text-sm text-on-surface-variant">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
