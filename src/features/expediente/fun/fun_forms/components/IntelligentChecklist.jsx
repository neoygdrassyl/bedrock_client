import { useMemo, useState } from 'react';
import ChecklistEvaluationSelect from './ChecklistEvaluationSelect';
import RequirementManagementModal from './RequirementManagementModal';
import VRChecklistNavigator from './VRChecklistNavigator';
import { buildVisibleRows, buildVisibleSections } from '../utils/intelligentChecklist.utils';

export default function IntelligentChecklist({
  requirements,
  vrs,
  digitalDocuments,
  readOnly,
  isRequirementApplicable,
  onEvaluationChange,
  onLinkDocument,
}) {
  const [selectedVrId, setSelectedVrId] = useState(null);
  const [managedRequirement, setManagedRequirement] = useState(null);
  const visibleRows = useMemo(
    () => buildVisibleRows({ requirements, selectedVrId, isRequirementApplicable }),
    [requirements, selectedVrId, isRequirementApplicable]
  );
  const visibleSections = useMemo(() => buildVisibleSections(visibleRows), [visibleRows]);

  const handleLink = async (entry) => {
    await onLinkDocument?.(managedRequirement, entry);
    setManagedRequirement(null);
  };

  return (
    <section className="space-y-3 rounded-xl border border-border bg-background p-3 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Checklist inteligente</p>
          <h3 className="text-base font-semibold text-foreground">Lista general de chequeo de documentos</h3>
        </div>
        <p className="text-xs text-muted-foreground">{visibleRows.length} requisito(s) aplicable(s)</p>
      </div>

      <VRChecklistNavigator vrs={vrs} selectedVrId={selectedVrId} onSelect={setSelectedVrId} />

      <div className="max-h-[calc(100vh-260px)] min-h-[260px] overflow-auto rounded-lg border border-border">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 border-b border-border bg-muted text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-[58%] px-3 py-2 text-left">Requisito</th>
              <th className="px-3 py-2 text-left">Evaluación</th>
              <th className="px-3 py-2 text-left">VR</th>
              <th className="px-3 py-2 text-right">Gestionar</th>
            </tr>
          </thead>
          <tbody className="bg-background">
            {visibleSections.map((section) => (
              <FragmentSection
                key={section.id}
                section={section}
                readOnly={readOnly}
                onEvaluationChange={onEvaluationChange}
                onManage={setManagedRequirement}
              />
            ))}
            {!visibleSections.length && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No hay requisitos aplicables para mostrar.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <RequirementManagementModal
        open={Boolean(managedRequirement)}
        requirement={managedRequirement}
        vrs={vrs}
        digitalDocuments={digitalDocuments}
        onClose={() => setManagedRequirement(null)}
        onLink={handleLink}
      />
    </section>
  );
}

function FragmentSection({ section, readOnly, onEvaluationChange, onManage }) {
  return (
    <>
      <tr className="border-t border-border bg-muted/40">
        <td colSpan={4} className="px-3 py-2 text-sm font-bold uppercase tracking-wide text-foreground">
          {section.title}
        </td>
      </tr>
      {section.groups.map((group) => (
        <FragmentGroup
          key={group.id}
          group={group}
          readOnly={readOnly}
          onEvaluationChange={onEvaluationChange}
          onManage={onManage}
        />
      ))}
    </>
  );
}

function FragmentGroup({ group, readOnly, onEvaluationChange, onManage }) {
  return (
    <>
      {(group.title || group.note) && (
        <tr className="bg-background">
          <td colSpan={4} className="px-4 pb-1 pt-2">
            {group.title && <p className="text-sm font-semibold text-foreground">{group.title}</p>}
            {group.note && <p className="text-xs text-muted-foreground">{group.note}</p>}
          </td>
        </tr>
      )}
      {group.rows.map((row) => (
        <tr key={row.code} className="border-t border-border/70 hover:bg-muted/30">
          <td className="px-4 py-1.5 align-middle">
            <div className="max-w-[760px]">
              <span className="block font-mono text-[11px] leading-4 text-muted-foreground">{row.code}</span>
              <span className="block text-[13px] font-medium leading-5 text-foreground">{row.label}</span>
            </div>
          </td>
          <td className="px-3 py-1.5 align-middle">
            <ChecklistEvaluationSelect
              value={row.evaluation}
              disabled={readOnly}
              onChange={(value) => onEvaluationChange?.(row, value)}
            />
          </td>
          <td className="px-3 py-1.5 align-middle text-xs text-muted-foreground">{row.contextualVrId || 'Sin VR'}</td>
          <td className="px-3 py-1.5 text-right align-middle">
            <button
              type="button"
              className="min-h-[36px] rounded-md border border-border px-3 text-xs font-semibold text-primary hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
              onClick={() => onManage(row)}
              aria-label={`Gestionar requisito ${row.code}`}
            >
              Gestionar
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}
