import { Link } from 'react-router-dom';
import { Icon } from '@/components/icon';

const SIMULATOR_OPTIONS = [
  {
    title: 'Documentos y requisitos',
    description: 'Simula los documentos aplicables por tipo de actuación, trámite, modalidad, uso y condición del predio.',
    path: '/simulador/documentos',
    icon: 'FileCheck',
    badge: 'Principal',
    tone: 'primary',
  },
  {
    title: 'Flujo legal',
    description: 'Abre la guía jurídica existente para revisar etapas, notificaciones, desistimientos y recursos.',
    path: '/simulador/legal',
    icon: 'Gavel',
    badge: 'Guía actual',
    tone: 'accent',
  },
];

const TONE_CLASSES = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  accent: 'bg-accent/10 text-accent border-accent/20',
};

export default function SimuladorPage() {
  return (
    <main className="w-full space-y-4 animate-fade-in-up" aria-labelledby="simulador-page-title">
      <header className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border/70 bg-muted/30 px-4 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name="SearchCheck" size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 id="simulador-page-title" className="mb-1 text-xl font-semibold tracking-tight text-foreground">
                Simulador
              </h1>
              <p className="mb-0 max-w-3xl text-sm leading-6 text-muted-foreground">
                Accede a herramientas de simulación para anticipar requisitos documentales y revisar el flujo jurídico sin modificar expedientes.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="badge rounded-pill text-bg-light border">Sin persistencia</span>
            <span className="badge rounded-pill text-bg-light border">Cálculo local</span>
          </div>
        </div>
        <div className="px-4 py-3 text-xs leading-5 text-muted-foreground">
          La simulación de Documentos/Requisitos es el flujo principal. Legal reutiliza la guía existente para conservar la lógica actual.
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2" aria-label="Opciones del simulador">
        {SIMULATOR_OPTIONS.map((option) => (
          <Link
            key={option.path}
            to={option.path}
            className="group flex min-h-44 flex-col justify-between rounded-xl border border-border bg-card p-4 text-foreground no-underline shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="flex items-start justify-between gap-3">
              <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${TONE_CLASSES[option.tone]}`}>
                <Icon name={option.icon} size={20} aria-hidden="true" />
              </span>
              <span className="badge rounded-pill text-bg-light border">{option.badge}</span>
            </div>
            <div className="mt-4 space-y-2">
              <h2 className="mb-0 text-base font-semibold text-foreground">{option.title}</h2>
              <p className="mb-0 text-sm leading-6 text-muted-foreground">{option.description}</p>
            </div>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors group-hover:text-primary/80">
              Abrir módulo
              <Icon name="ArrowRight" size={16} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
