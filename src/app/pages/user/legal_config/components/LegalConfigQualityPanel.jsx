import React from 'react';
import { CheckCircle2, Eye, LayoutPanelTop, MessageSquareText } from 'lucide-react';

const QUALITY_CHECKS = [
  {
    icon: MessageSquareText,
    title: 'Lenguaje operativo',
    copy: 'La vista habla en términos de actuación, documento, regla, caso y salida; no expone nombres técnicos de datos.',
  },
  {
    icon: Eye,
    title: 'Contraste y legibilidad',
    copy: 'Panel oscuro controlado, tarjetas limpias y acciones visibles para presentación.',
  },
  {
    icon: LayoutPanelTop,
    title: 'Responsabilidades separadas',
    copy: 'Resumen, configurador, opciones visuales y simulación se entienden como áreas independientes.',
  },
  {
    icon: CheckCircle2,
    title: 'Flujo seguro',
    copy: 'La edición directa trabaja como borrador visual hasta aprobar persistencia completa.',
  },
];

export default function LegalConfigQualityPanel() {
  return (
    <section className="legal-config-quality-panel" aria-label="Control de calidad gráfico">
      <div className="legal-config-quality-panel__header">
        <span className="legal-config-section-title__eyebrow">Control de calidad gráfico</span>
        <h3>Lista de revisión visual</h3>
      </div>
      <div className="legal-config-quality-panel__grid">
        {QUALITY_CHECKS.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title}>
              <span><Icon size={15} /></span>
              <strong>{item.title}</strong>
              <p>{item.copy}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
