import { useId, useState } from 'react';
import FUNG_CHECKLIST from '../fun_g_checklist';
import FUN_CHECKLIST_N from './fun_checklist_n';

const LEGACY_TAB = 'legacy';
const INTELLIGENT_TAB = 'intelligent';

function FunChecklistWindowSwitcher({
  translation,
  swaMsg,
  globals,
  currentItem,
  currentVersion,
  requestUpdate,
  readOnly,
  vrDocs,
  LegacyChecklistComponent = FUNG_CHECKLIST,
  IntelligentChecklistComponent = FUN_CHECKLIST_N,
}) {
  const [activeTab, setActiveTab] = useState(LEGACY_TAB);
  const baseId = useId();
  const EffectiveLegacyChecklistComponent = LegacyChecklistComponent || FUNG_CHECKLIST;

  const legacyTabId = `${baseId}-legacy-tab`;
  const intelligentTabId = `${baseId}-intelligent-tab`;
  const legacyPanelId = `${baseId}-legacy-panel`;
  const intelligentPanelId = `${baseId}-intelligent-panel`;

  const sharedProps = {
    translation,
    swaMsg,
    globals,
    currentItem,
    currentVersion,
  };

  const intelligentProps = {
    ...sharedProps,
    requestUpdate,
    readOnly,
    vrDocs,
  };

  const legacyProps = {
    ...sharedProps,
    requestUpdate,
    readOnly,
  };

  return (
    <div className="fun-checklist-window-switcher">
      <div className="nav nav-tabs" role="tablist" aria-label="Ventanas de lista de chequeo FUN">
        <div className="nav-item" role="presentation">
          <button
            id={legacyTabId}
            type="button"
            role="tab"
            className={`nav-link ${activeTab === LEGACY_TAB ? 'active' : ''}`}
            aria-selected={activeTab === LEGACY_TAB}
            aria-controls={legacyPanelId}
            onClick={() => setActiveTab(LEGACY_TAB)}
          >
            Versión anterior
          </button>
        </div>
        <div className="nav-item" role="presentation">
          <button
            id={intelligentTabId}
            type="button"
            role="tab"
            className={`nav-link ${activeTab === INTELLIGENT_TAB ? 'active' : ''}`}
            aria-selected={activeTab === INTELLIGENT_TAB}
            aria-controls={intelligentPanelId}
            onClick={() => setActiveTab(INTELLIGENT_TAB)}
          >
            Versión nueva
          </button>
        </div>
      </div>

      <div className="border border-top-0 p-3 bg-white">
        {activeTab === LEGACY_TAB && (
          <div id={legacyPanelId} role="tabpanel" aria-labelledby={legacyTabId}>
            <EffectiveLegacyChecklistComponent {...legacyProps} />
          </div>
        )}

        {activeTab === INTELLIGENT_TAB && (
          <div id={intelligentPanelId} role="tabpanel" aria-labelledby={intelligentTabId}>
            <IntelligentChecklistComponent {...intelligentProps} />
          </div>
        )}
      </div>
    </div>
  );
}

export default FunChecklistWindowSwitcher;
