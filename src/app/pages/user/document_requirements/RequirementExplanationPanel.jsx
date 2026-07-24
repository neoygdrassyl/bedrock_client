import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle2,
  FileQuestion,
  FileText,
  Info,
  Search,
} from 'lucide-react';
import { getScopeLabel, SCOPE_DISCLAIMER } from './requirementConceptLabels.js';

function getDocumentRules(selectedDocument, rules) {
  const activatingKeys = selectedDocument?.activatingRuleKeys || selectedDocument?.activatingRules || [];
  return rules.filter((rule) => activatingKeys.includes(rule.ruleKey));
}

function getOverallState(selectedDocument, docRules) {
  if (!selectedDocument || docRules.length === 0) return 'Sin reglas de activación';
  const nonDeterminable = docRules.some((r) => !r.determinable);
  if (nonDeterminable) return 'Regla no determinable';
  const conditional = docRules.some((r) => r.hasConditions);
  const alwaysRequired = docRules.some((r) => r.required && !r.hasConditions);
  if (alwaysRequired) return conditional ? 'Siempre requerido (con condiciones adicionales)' : 'Siempre requerido';
  if (conditional) return 'Requerido por condición';
  return 'Requerido';
}

function getVisualScope(selectedDocument) {
  const explicitScopeCode = selectedDocument?.scopeCode || selectedDocument?.scope || selectedDocument?.scopeHint || '';

  if (typeof explicitScopeCode === 'string' && explicitScopeCode.trim()) {
    const scopeCode = getScopeLabel(explicitScopeCode) === 'Por confirmar'
      ? 'unknown'
      : explicitScopeCode.trim().toLowerCase();

    return {
      scopeCode,
      inferred: false,
    };
  }

  const documentText = [selectedDocument?.label, selectedDocument?.groupLabel]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (documentText.includes('plano')) {
    return { scopeCode: 'plano', inferred: true };
  }

  if (documentText.includes('profesional') || documentText.includes('matrícula profesional')) {
    return { scopeCode: 'profesional', inferred: true };
  }

  if (documentText.includes('titular') || documentText.includes('propietario')) {
    return { scopeCode: 'titular', inferred: true };
  }

  if (documentText.includes('predio') || documentText.includes('lote')) {
    return { scopeCode: 'predio', inferred: true };
  }

  return { scopeCode: 'solicitud', inferred: true };
}

function getStateBadgeMeta(selectedDocument, documentStateLabel) {
  if (selectedDocument?.visualState === 'non-determinable' || /no determinable/i.test(documentStateLabel)) {
    return {
      icon: AlertTriangle,
      variant: 'outline',
      className: 'explorer-explanation__state-badge explorer-explanation__state-badge--warn',
    };
  }

  if (selectedDocument?.visualState === 'always-required' || /siempre requerido/i.test(documentStateLabel)) {
    return {
      icon: CheckCircle2,
      variant: 'secondary',
      className: 'explorer-explanation__state-badge',
    };
  }

  if (/sin regla/i.test(documentStateLabel)) {
    return {
      icon: FileQuestion,
      variant: 'outline',
      className: 'explorer-explanation__state-badge',
    };
  }

  return {
    icon: Search,
    variant: 'outline',
    className: 'explorer-explanation__state-badge',
  };
}

export default function RequirementExplanationPanel({ selectedDocument, explorer, stepLabel }) {
  const rules = explorer?.rules || [];
  const groups = explorer?.groups || [];

  if (!selectedDocument) {
    return (
      <div className="explorer-explanation--empty" data-testid="explorer-explanation-empty">
        <Info size={32} strokeWidth={1} />
        <p>Selecciona un documento del árbol para ver las reglas que determinan su obligatoriedad.</p>
      </div>
    );
  }

  const docRules = getDocumentRules(selectedDocument, rules);
  const group = groups.find((g) => g.key === selectedDocument.groupKey);
  const documentStateLabel = selectedDocument.stateLabel || getOverallState(selectedDocument, docRules);
  const scopeMeta = getVisualScope(selectedDocument);
  const scopeLabel = getScopeLabel(scopeMeta.scopeCode);
  const activatingRules = selectedDocument.activatingRuleKeys || selectedDocument.activatingRules || [];
  const stateBadge = getStateBadgeMeta(selectedDocument, documentStateLabel);
  const StateBadgeIcon = stateBadge.icon;
  const conceptItems = [
    {
      label: 'Documento tipo',
      value: selectedDocument.label || 'Sin documento asociado',
      hint: 'Concepto base configurado en el explorer para esta actuación.',
    },
    {
      label: 'Requisito de esta solicitud',
      value: documentStateLabel,
      hint: 'Lectura visual según reglas activas y escenario calculado actualmente.',
    },
    {
      label: 'Archivo aportado',
      value: 'Se contrastará cuando exista evidencia cargada.',
      hint: 'En esta vista no se valida ni se cuenta el soporte entregado.',
    },
  ];

  return (
    <div
      className="explorer-explanation"
      data-testid="explorer-explanation"
      aria-label={stepLabel || 'Entiende el requisito'}
    >
      <header className="explorer-explanation__header">
        <FileText size={18} className="explorer-explanation__header-icon" />
        <div>
          <h4 className="explorer-explanation__doc-name">{selectedDocument.label}</h4>
          <p className="explorer-explanation__group-ref">
            {group?.label || selectedDocument.groupLabel || selectedDocument.groupKey || 'Sin grupo'}
          </p>
        </div>
        <Badge variant={stateBadge.variant} className={stateBadge.className}>
          <StateBadgeIcon size={12} aria-hidden="true" />
          <span>{documentStateLabel}</span>
        </Badge>
      </header>

      <section className="explorer-explanation__concepts" aria-label="Metadatos visuales del requisito">
        {conceptItems.map((item) => (
          <article key={item.label} className="explorer-explanation__concept-card">
            <span className="explorer-explanation__concept-label">{item.label}</span>
            <strong className="explorer-explanation__concept-value">{item.value}</strong>
            <p className="explorer-explanation__concept-hint">{item.hint}</p>
          </article>
        ))}
      </section>

      <section className="explorer-explanation__scope" aria-label="Alcance visual estimado">
        <div className="explorer-explanation__scope-header">
          <span className="explorer-explanation__concept-label">Alcance estimado</span>
          <Badge variant="outline" className="explorer-explanation__scope-badge">{scopeLabel}</Badge>
        </div>
        {scopeMeta.inferred && (
          <p className="explorer-explanation__scope-disclaimer">{SCOPE_DISCLAIMER}</p>
        )}
      </section>

      {docRules.length > 1 && (
        <div className="explorer-explanation__multi-rule" data-testid="explorer-multi-rule-notice">
          También aplica por {docRules.length} reglas
        </div>
      )}

      <div className="explorer-explanation__rules">
        {docRules.map((rule) => (
          <div key={rule.ruleKey} className="explorer-explanation__rule" data-testid={`explorer-rule-${rule.ruleKey}`}>
            <div className="explorer-explanation__rule-header">
              <Badge variant="outline" className="explorer-explanation__rule-key">
                {rule.ruleKey}
              </Badge>
              <span className="explorer-explanation__rule-required">
                {rule.required ? 'Requerido' : 'Opcional'}
              </span>
              {rule.allowNa && (
                <Badge variant="outline" className="explorer-explanation__na-badge">Permite N/A</Badge>
              )}
            </div>

            {!rule.determinable && (
              <div className="explorer-explanation__rule-warning">
                Regla no determinable — la configuración de esta regla no puede evaluarse automáticamente.
              </div>
            )}

            <p className="explorer-explanation__rule-condition">
              {rule.conditionSummary}
            </p>

            {rule.hasConditions && (
              <div className="explorer-explanation__rule-fields">
                Esta regla se activa según los campos de la radicación. Utiliza el
                simulador para ver si aplica con datos concretos.
              </div>
            )}

            {!rule.hasConditions && rule.determinable && (
              <div className="explorer-explanation__rule-always">
                Esta regla aplica a cualquier valor de los campos de la actuación.
              </div>
            )}
          </div>
        ))}
      </div>

      {activatingRules.length > 0 && (
        <footer className="explorer-explanation__footer">
          <span className="explorer-explanation__footer-label">Reglas de activación:</span>
          {activatingRules.map((rk) => (
            <Badge key={rk} variant="outline" className="explorer-explanation__footer-badge">{rk}</Badge>
          ))}
        </footer>
      )}
    </div>
  );
}
