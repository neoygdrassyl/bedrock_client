import { describe, expect, it } from 'vitest';
import { parseExpedienteWorkspaceSearch } from '../fun/fun_forms/utils/expedienteWorkspaceRoute';
import {
  buildSectionSearchParams,
  findNavSection,
  getExpedienteNavGroups,
  sectionToWorkspaceTarget,
} from './expedienteNavConfig';

const idsByGroup = (groups) => Object.fromEntries(groups.map((group) => [group.id, group.items.map((item) => item.id)]));

describe('getExpedienteNavGroups', () => {
  it('shows every standard module when the expediente is editable and has publicity', () => {
    expect(idsByGroup(getExpedienteNavGroups({ canEdit: true, canShowPublicidad: true }))).toEqual({
      consulta: ['detalles', 'tiempos'],
      documentos: ['documentos-new', 'documentos', 'actualizar', 'chequeo', 'publicidad'],
      informes: ['juridico', 'arquitectonico', 'estructural'],
      cierre: ['acta', 'expedicion'],
    });
  });

  it('hides Actualizar and Publicidad without the matching permissions', () => {
    const groups = idsByGroup(getExpedienteNavGroups({ canEdit: false, canShowPublicidad: false }));
    expect(groups.documentos).toEqual(['documentos-new', 'documentos', 'chequeo']);

    const editOnly = idsByGroup(getExpedienteNavGroups({ canEdit: true, canShowPublicidad: false }));
    expect(editOnly.documentos).toEqual(['documentos-new', 'documentos', 'actualizar', 'chequeo']);
  });

  it('swaps the discipline reports for Informe P.H., drops Acta and relabels Expedición for P.H.', () => {
    const groups = getExpedienteNavGroups({ canEdit: true, canShowPublicidad: true, isPropertyHorizontal: true });
    expect(idsByGroup(groups).informes).toEqual(['ph']);
    expect(idsByGroup(groups).cierre).toEqual(['expedicion']);
    expect(findNavSection(groups, 'expedicion').item.label).toBe('Expedición P.H.');
    expect(findNavSection(groups, 'acta')).toBeNull();
  });

  it('tags each item with its group tone and strips internal flags', () => {
    const groups = getExpedienteNavGroups({ canEdit: true, canShowPublicidad: true });
    const { group, item } = findNavSection(groups, 'juridico');
    // The group id stays `informes` (URL/storage contract); only its visible label changed.
    expect(group).toMatchObject({ id: 'informes', label: 'Evaluación', tone: 'evaluacion' });
    expect(item).toMatchObject({ tone: group.tone, label: 'Inf. jurídico', ariaLabel: 'Informe jurídico' });
    expect(groups.map((entry) => [entry.id, entry.label, entry.tone])).toEqual([
      ['consulta', 'Consulta', 'consulta'],
      ['documentos', 'Documentos', 'documentos'],
      ['informes', 'Evaluación', 'evaluacion'],
      ['cierre', 'Expedición', 'expedicion'],
    ]);
    expect(item).not.toHaveProperty('standardReport');
  });
});

describe('section <-> URL sync', () => {
  it('maps report sections to section=informes&report=<id>', () => {
    expect(sectionToWorkspaceTarget('arquitectonico')).toEqual({ section: 'informes', report: 'arquitectonico' });
    expect(sectionToWorkspaceTarget('ph')).toEqual({ section: 'informes', report: 'ph' });
    expect(sectionToWorkspaceTarget('chequeo')).toEqual({ section: 'chequeo', report: null });
    expect(sectionToWorkspaceTarget('unknown')).toEqual({ section: 'detalles', report: null });
  });

  it('writes the section while preserving unrelated params such as panel', () => {
    const next = buildSectionSearchParams('?panel=open&foo=1', 'tiempos');
    expect(next.get('section')).toBe('tiempos');
    expect(next.get('panel')).toBe('open');
    expect(next.get('foo')).toBe('1');
  });

  it('removes section/report for Detalles and report for non-report modules', () => {
    expect(buildSectionSearchParams('?section=informes&report=estructural&panel=closed', 'detalles').toString()).toBe('panel=closed');
    expect(buildSectionSearchParams('?section=informes&report=estructural', 'acta').toString()).toBe('section=acta');
  });

  it('returns null when the URL already points at the section (no redundant navigation)', () => {
    expect(buildSectionSearchParams('', 'detalles')).toBeNull();
    expect(buildSectionSearchParams('?section=chequeo', 'chequeo')).toBeNull();
    expect(buildSectionSearchParams('?section=informes&report=juridico', 'juridico')).toBeNull();
  });

  it.each(['detalles', 'tiempos', 'documentos-new', 'documentos', 'actualizar', 'chequeo', 'publicidad', 'juridico', 'arquitectonico', 'estructural', 'ph', 'acta', 'expedicion'])(
    'round-trips %s through parseExpedienteWorkspaceSearch',
    (sectionId) => {
      const params = buildSectionSearchParams('', sectionId) || new URLSearchParams();
      const parsed = parseExpedienteWorkspaceSearch(params);
      const target = sectionToWorkspaceTarget(sectionId);
      expect(parsed.section).toBe(target.section);
      if (target.report) expect(parsed.report).toBe(target.report);
    },
  );
});
