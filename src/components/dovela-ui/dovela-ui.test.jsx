import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertTriangle, Save } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { operationalStateFromFunStatus } from '@/app/pages/user/fun_forms/utils/severity';
import {
  DOCUMENT_TYPE_META,
  OPERATIONAL_STATE_META,
  getDocumentTypeMeta,
  getOperationalStateMeta,
} from './dovela-operational';
import { DovelaDocumentChip } from './dovela-document-chip';
import { DovelaOperationalState } from './dovela-operational-state';
import {
  DovelaBadge,
  DovelaButton,
  DovelaCard,
  DovelaCardContent,
  DovelaCardDescription,
  DovelaCardHeader,
  DovelaCardTitle,
  DovelaField,
  DovelaInput,
  DovelaInlineAlert,
  DovelaPageHeader,
  DovelaSectionPanel,
  DovelaSelect,
  DovelaTextarea,
} from '@/components/dovela-ui';

describe('DovelaButton', () => {
  it('bloquea la accion y muestra la etiqueta de carga durante guardado', () => {
    render(
      <DovelaButton loading loadingLabel="Guardando..." leadingIcon={Save}>
        Guardar borrador
      </DovelaButton>
    );

    const button = screen.getByRole('button', { name: /Guardando/i });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-dovela-ui', 'button');
    expect(button).toHaveAttribute('data-tone', 'primary');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });
});

describe('DovelaBadge', () => {
  it('expone un tono semantico reutilizable para estados operativos', () => {
    render(
      <DovelaBadge tone="warning" icon={AlertTriangle}>
        Cambio pendiente
      </DovelaBadge>
    );

    const badge = screen.getByText('Cambio pendiente');

    expect(badge).toHaveAttribute('data-dovela-ui', 'badge');
    expect(badge).toHaveAttribute('data-tone', 'warning');
    expect(badge.querySelector('svg')).toBeInTheDocument();
  });
});

describe('DovelaInlineAlert', () => {
  it('mantiene role de alerta y permite cerrarse cuando es descartable', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(
      <DovelaInlineAlert tone="danger" onDismiss={onDismiss}>
        Error al publicar la configuracion.
      </DovelaInlineAlert>
    );

    const alert = screen.getByRole('alert');

    expect(alert).toHaveAttribute('data-dovela-ui', 'inline-alert');
    expect(alert).toHaveAttribute('data-tone', 'danger');

    await user.click(screen.getByRole('button', { name: /Cerrar mensaje/i }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('DovelaCard', () => {
  it('compone encabezado, descripcion y contenido bajo la misma superficie', () => {
    render(
      <DovelaCard tone="warning">
        <DovelaCardHeader>
          <DovelaCardTitle>Configuracion documental</DovelaCardTitle>
          <DovelaCardDescription>Superficie comun para edicion y resumen.</DovelaCardDescription>
        </DovelaCardHeader>
        <DovelaCardContent>
          <p>Contenido del panel</p>
        </DovelaCardContent>
      </DovelaCard>
    );

    const card = screen.getByText('Configuracion documental').closest('[data-dovela-ui="card"]');

    expect(card).toHaveAttribute('data-tone', 'warning');
    expect(screen.getByText('Superficie comun para edicion y resumen.')).toBeInTheDocument();
    expect(screen.getByText('Contenido del panel')).toBeInTheDocument();
  });

  it('permite elegir el elemento semantico de la superficie', () => {
    render(
      <DovelaCard as="article" aria-label="Resumen de requisito">
        Contenido resumido
      </DovelaCard>
    );

    const card = screen.getByRole('article', { name: 'Resumen de requisito' });

    expect(card).toHaveAttribute('data-dovela-ui', 'card');
    expect(card).toHaveTextContent('Contenido resumido');
  });
});

describe('DovelaField', () => {
  it('conecta label, ayuda y error con el control del formulario', () => {
    render(
      <DovelaField label="Editor JSON" helperText="Pega JSON valido." error="JSON invalido.">
        <DovelaTextarea aria-label="Editor JSON" />
      </DovelaField>
    );

    const textarea = screen.getByLabelText('Editor JSON');

    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAccessibleDescription(/Pega JSON valido. JSON invalido./i);
    expect(screen.getByText('JSON invalido.')).toHaveAttribute('role', 'alert');
  });
});

describe('DovelaInput', () => {
  it('aplica densidad e invalidacion como contrato parametrizado', () => {
    render(<DovelaInput aria-label="Buscar" density="compact" invalid />);

    const input = screen.getByLabelText('Buscar');

    expect(input).toHaveAttribute('data-dovela-ui', 'input');
    expect(input).toHaveAttribute('data-density', 'compact');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('DovelaSelect', () => {
  it('renderiza opciones desde una configuracion simple', () => {
    render(
      <DovelaSelect
        aria-label="Estado"
        placeholder="Selecciona estado"
        options={[
          { value: 'draft', label: 'Borrador' },
          { value: 'published', label: 'Publicada' },
        ]}
      />
    );

    const select = screen.getByRole('combobox', { name: 'Estado' });

    expect(select).toHaveAttribute('data-dovela-ui', 'select');
    expect(screen.getByText('Selecciona estado')).toBeInTheDocument();
  });
});

describe('DovelaPageHeader', () => {
  it('renderiza titulo, descripcion, metadata y acciones sin depender de CSS local', () => {
    render(
      <DovelaPageHeader
        eyebrow="Configuracion"
        title="Requisitos documentales"
        description="Gestiona reglas documentales versionadas."
        meta={<DovelaBadge tone="neutral">Fuente backend</DovelaBadge>}
        actions={<DovelaButton size="sm">Guardar</DovelaButton>}
      />
    );

    expect(screen.getByRole('heading', { name: 'Requisitos documentales' })).toBeInTheDocument();
    expect(screen.getByText('Configuracion')).toBeInTheDocument();
    expect(screen.getByText('Gestiona reglas documentales versionadas.')).toBeInTheDocument();
    expect(screen.getByText('Fuente backend')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });
});

describe('DovelaSectionPanel', () => {
  it('usa estructura semantica de seccion y encabezado reutilizable', () => {
    render(
      <DovelaSectionPanel title="Borrador estructurado" description="JSON tecnico versionado.">
        <p>Contenido del panel</p>
      </DovelaSectionPanel>
    );

    const section = screen.getByRole('region', { name: 'Borrador estructurado' });

    expect(section).toHaveAttribute('data-dovela-ui', 'section-panel');
    expect(screen.getByText('JSON tecnico versionado.')).toBeInTheDocument();
    expect(screen.getByText('Contenido del panel')).toBeInTheDocument();
  });
});

describe('Dovela operational semantics', () => {
  it('define el orden y los requisitos de estados municipales', () => {
    expect(Object.keys(OPERATIONAL_STATE_META)).toEqual([
      'en_revision',
      'requiere_subsanacion',
      'pendiente_respuesta',
      'respondido',
      'vencido',
      'proximo_a_vencer',
      'archivado',
      'bloqueado',
    ]);
    expect(OPERATIONAL_STATE_META.vencido).toMatchObject({
      label: 'Vencido',
      tone: 'danger',
      requiresDueDate: true,
      requiresNextAction: true,
    });
    expect(OPERATIONAL_STATE_META.proximo_a_vencer.tone).toBe('warning');
  });

  it('define tipos documentales y fallbacks gobernados', () => {
    expect(Object.keys(DOCUMENT_TYPE_META)).toEqual([
      'requisito',
      'soporte',
      'respuesta',
      'acto_administrativo',
      'revision_tecnica',
    ]);
    expect(getDocumentTypeMeta('acto_administrativo').label).toBe('Acto administrativo');
    expect(getOperationalStateMeta('desconocido').id).toBe('en_revision');
    expect(getDocumentTypeMeta('desconocido').id).toBe('soporte');
  });
});

describe('DovelaOperationalState', () => {
  it('renders state label with due date, responsible and next action', () => {
    render(
      <DovelaOperationalState
        state="vencido"
        dueDate="2026-07-02"
        responsible="Revisión jurídica"
        nextAction="Responder requerimiento"
      />
    );

    expect(screen.getByText('Vencido')).toBeInTheDocument();
    expect(screen.getByText('Vence: 2026-07-02')).toBeInTheDocument();
    expect(screen.getByText('Responsable: Revisión jurídica')).toBeInTheDocument();
    expect(screen.getByText('Siguiente acción: Responder requerimiento')).toBeInTheDocument();
  });

  it('does not rely on color alone for critical states', () => {
    render(<DovelaOperationalState state="proximo_a_vencer" dueDate="2026-07-05" />);

    expect(screen.getByText('Próximo a vencer')).toBeInTheDocument();
    expect(screen.getByText(/El plazo está cerca de cumplirse/)).toBeInTheDocument();
  });
});

describe('DovelaDocumentChip', () => {
  it('renders document type, name and status text', () => {
    render(
      <DovelaDocumentChip
        type="requisito"
        name="Certificado de tradición"
        status="Pendiente de revisión"
      />
    );

    expect(screen.getByText('Requisito')).toBeInTheDocument();
    expect(screen.getByText('Certificado de tradición')).toBeInTheDocument();
    expect(screen.getByText('Pendiente de revisión')).toBeInTheDocument();
  });
});

describe('FUN severity operational mapping', () => {
  it.each([
    ['VENCIDO', 'vencido'],
    ['ALERTA_VENCIMIENTO', 'proximo_a_vencer'],
    ['PRONTO_A_VENCER', 'proximo_a_vencer'],
    ['EN_TERMINO', 'en_revision'],
    ['SUSPENDIDO', 'bloqueado'],
  ])('maps %s to %s', (funStatus, expectedState) => {
    expect(operationalStateFromFunStatus(funStatus)).toBe(expectedState);
  });
});
