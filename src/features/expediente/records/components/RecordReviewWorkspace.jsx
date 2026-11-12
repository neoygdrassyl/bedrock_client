import { useId, useRef, useState } from 'react';

import { cn } from '@/shared/lib/utils';

const DEFAULT_TABS = {
    inventory: {
        key: 'inventory',
        helper: 'Chequeo operativo',
    },
    documents: {
        key: 'documents',
        helper: 'Expediente documental',
    },
};

const TAB_ORDER = [DEFAULT_TABS.inventory.key, DEFAULT_TABS.documents.key];

/**
 * Inventory / documentary file switcher of a report section. It renders flat content for
 * the section card that hosts it: the module tab strip (Bootstrap nav-tabs markup, turned
 * into the shared segmented look by legacy-bridge.css), one panel and the professionals group.
 */
export function RecordReviewWorkspace({
    inventoryLabel,
    documentsLabel,
    inventoryContent,
    documentsContent,
    professionalsContent,
    professionalsLabel = 'Profesionales',
    defaultTab = 'inventory',
    inventoryId,
    documentsId,
    inventoryExpanded = false,
    className,
}) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const baseId = useId();
    const tabRefs = useRef({});

    const panelIds = {
        [DEFAULT_TABS.inventory.key]: inventoryId || `${baseId}-panel-inventory`,
        [DEFAULT_TABS.documents.key]: documentsId || `${baseId}-panel-documents`,
    };
    const tabs = [
        { ...DEFAULT_TABS.inventory, label: inventoryLabel },
        { ...DEFAULT_TABS.documents, label: documentsLabel },
    ];

    // Arrow keys move between the two tabs (WAI-ARIA tabs pattern, automatic activation).
    const handleKeyDown = (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const index = TAB_ORDER.indexOf(activeTab);
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % TAB_ORDER.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + TAB_ORDER.length) % TAB_ORDER.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = TAB_ORDER.length - 1;
        const nextKey = TAB_ORDER[next];
        setActiveTab(nextKey);
        tabRefs.current[nextKey]?.focus();
    };

    return (
        <div className={cn('ew-review-workspace w-full min-w-0', className)}>
            <ul className="nav nav-tabs mb-3" role="tablist" aria-label="Navegación documental del informe" onKeyDown={handleKeyDown}>
                {tabs.map((tab) => {
                    const active = activeTab === tab.key;
                    return (
                        <li key={tab.key} className="nav-item" role="presentation">
                            <button
                                ref={(node) => { tabRefs.current[tab.key] = node; }}
                                type="button"
                                role="tab"
                                id={`${baseId}-tab-${tab.key}`}
                                aria-controls={panelIds[tab.key]}
                                aria-selected={active}
                                tabIndex={active ? 0 : -1}
                                title={tab.helper}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn('nav-link', active && 'active')}
                            >
                                {tab.label}
                            </button>
                        </li>
                    );
                })}
            </ul>

            <div
                id={panelIds[DEFAULT_TABS.inventory.key]}
                className={cn(
                    'ew-review-workspace__panel min-w-0',
                    inventoryExpanded
                        ? 'h-auto max-h-none overflow-visible'
                        : 'max-h-[40rem] overflow-auto',
                    activeTab !== DEFAULT_TABS.inventory.key && 'hidden'
                )}
                role="tabpanel"
                aria-labelledby={`${baseId}-tab-${DEFAULT_TABS.inventory.key}`}
                tabIndex={0}
            >
                {activeTab === DEFAULT_TABS.inventory.key ? inventoryContent : null}
            </div>
            <div
                id={panelIds[DEFAULT_TABS.documents.key]}
                className={cn('ew-review-workspace__panel max-h-[40rem] min-w-0 overflow-auto', activeTab !== DEFAULT_TABS.documents.key && 'hidden')}
                role="tabpanel"
                aria-labelledby={`${baseId}-tab-${DEFAULT_TABS.documents.key}`}
                tabIndex={0}
            >
                {activeTab === DEFAULT_TABS.documents.key ? documentsContent : null}
            </div>

            {professionalsContent ? (
                <>
                    <h3 className="ew-subheading">{professionalsLabel}</h3>
                    <div className="min-w-0">
                        {professionalsContent}
                    </div>
                </>
            ) : null}
        </div>
    );
}

export default RecordReviewWorkspace;
