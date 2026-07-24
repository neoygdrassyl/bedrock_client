import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileQuestion,
  FileText,
  Search,
} from 'lucide-react';

function StateBadge({ icon: Icon, children, variant = 'outline', className = '' }) {
  return (
    <Badge variant={variant} className={`explorer-state-badge ${className}`.trim()}>
      <Icon size={12} aria-hidden="true" />
      <span>{children}</span>
    </Badge>
  );
}

function getDocumentStateBadge(document, rules) {
  if (document?.stateLabel) {
    const variant = document.visualState === 'always-required' ? 'secondary' : 'outline';
    const warnClassName = document.visualState === 'non-determinable' ? 'explorer-state-badge--warn' : '';
    const Icon = document.visualState === 'always-required'
      ? CheckCircle2
      : document.visualState === 'non-determinable'
        ? AlertTriangle
        : Search;

    return (
      <StateBadge icon={Icon} variant={variant} className={warnClassName}>
        {document.stateLabel}
      </StateBadge>
    );
  }

  const activatingRules = (document.activatingRules || []);
  if (activatingRules.length === 0) {
    return <StateBadge icon={FileQuestion}>Sin regla</StateBadge>;
  }

  let hasNonDeterminable = false;
  let hasConditional = false;
  let hasAlwaysRequired = false;

  activatingRules.forEach((ruleKey) => {
    const rule = rules.find((r) => r.ruleKey === ruleKey);
    if (!rule) return;
    if (!rule.determinable) {
      hasNonDeterminable = true;
    } else if (rule.hasConditions) {
      hasConditional = true;
    } else if (rule.required) {
      hasAlwaysRequired = true;
    }
  });

  if (hasNonDeterminable) {
    return <StateBadge icon={AlertTriangle} className="explorer-state-badge--warn">Regla no determinable</StateBadge>;
  }
  if (hasConditional && !hasAlwaysRequired) {
    return <StateBadge icon={Search}>Por condición</StateBadge>;
  }
  if (hasAlwaysRequired) {
    return <StateBadge icon={CheckCircle2} variant="secondary">Siempre requerido</StateBadge>;
  }
  return <StateBadge icon={Search}>Por condición</StateBadge>;
}

export default function RequirementExplorerTree({
  explorer,
  selectedDocument,
  onSelectDocument,
  emptyMessage,
  stepLabel,
}) {
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const groups = explorer?.groups || [];
  const documents = explorer?.documents || [];
  const rules = explorer?.rules || [];

  if (!explorer || groups.length === 0) {
    return (
      <div className="explorer-tree--empty" data-testid="explorer-tree-empty">
        <FileText size={32} strokeWidth={1} />
        <p>{emptyMessage || 'No hay configuración documental disponible.'}</p>
      </div>
    );
  }

  const documentsByGroup = {};
  documents.forEach((doc) => {
    const gk = doc.groupKey || '__sin_grupo__';
    if (!documentsByGroup[gk]) documentsByGroup[gk] = [];
    documentsByGroup[gk].push(doc);
  });

  function toggleGroup(groupKey) {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  }

  return (
    <div className="explorer-tree" data-testid="explorer-tree" role="tree" aria-label={stepLabel || 'Revisa documentos'}>
      {groups.map((group) => {
        const groupDocs = documentsByGroup[group.key] || [];
        const isCollapsed = collapsedGroups[group.key] === true;

        return (
          <div key={group.key} className="explorer-tree__group" role="treeitem" aria-expanded={!isCollapsed}>
            <button
              type="button"
              className="explorer-tree__group-toggle"
              onClick={() => toggleGroup(group.key)}
              aria-controls={`explorer-tree-group-${group.key}`}
              tabIndex={0}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
              <span className="explorer-tree__group-label">{group.label}</span>
              <Badge variant="outline" className="explorer-tree__count-badge">
                {groupDocs.length}
              </Badge>
            </button>

            {!isCollapsed && (
              <div id={`explorer-tree-group-${group.key}`} className="explorer-tree__documents" role="group">
                {groupDocs.map((doc) => {
                  const isSelected = selectedDocument?.documentCode === doc.documentCode;
                  return (
                    <button
                      key={doc.documentCode}
                      type="button"
                      className={`explorer-tree__document${isSelected ? ' explorer-tree__document--selected' : ''}`}
                      onClick={() => onSelectDocument(doc)}
                      tabIndex={0}
                      data-testid={`explorer-tree-doc-${doc.documentCode}`}
                    >
                      <FileText size={14} className="explorer-tree__doc-icon" />
                      <span className="explorer-tree__doc-label">{doc.label}</span>
                      {getDocumentStateBadge(doc, rules)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
