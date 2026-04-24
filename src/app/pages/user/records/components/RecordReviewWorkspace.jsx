import { useState } from 'react';

import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';

const DEFAULT_TABS = {
    inventory: {
        key: 'inventory',
        icon: 'ListChecks',
        helper: 'Chequeo operativo',
    },
    documents: {
        key: 'documents',
        icon: 'Archive',
        helper: 'Expediente documental',
    },
};

function WorkspaceNavButton({ active, icon, label, helper, onClick }) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={cn(
                'flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
                active
                    ? 'border-primary/30 bg-primary/10 text-foreground shadow-sm'
                    : 'border-border bg-background/80 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
            )}
        >
            <span className={cn(
                'mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                active
                    ? 'border-primary/20 bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground'
            )}>
                <Icon name={icon} size={15} />
            </span>
            <span className="min-w-0">
                <span className="block text-sm font-semibold leading-5">{label}</span>
                <span className="block text-xs text-muted-foreground">{helper}</span>
            </span>
        </button>
    );
}

export function RecordReviewWorkspace({
    inventoryLabel,
    documentsLabel,
    inventoryContent,
    documentsContent,
    defaultTab = 'inventory',
    inventoryId,
    documentsId,
    className,
}) {
    const [activeTab, setActiveTab] = useState(defaultTab);

    return (
        <section className={cn('rounded-2xl border border-border bg-card/80 p-3 shadow-sm md:p-4', className)}>
            <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
                <aside className="space-y-2" role="tablist" aria-label="Navegación documental del informe">
                    <WorkspaceNavButton
                        active={activeTab === DEFAULT_TABS.inventory.key}
                        icon={DEFAULT_TABS.inventory.icon}
                        label={inventoryLabel}
                        helper={DEFAULT_TABS.inventory.helper}
                        onClick={() => setActiveTab(DEFAULT_TABS.inventory.key)}
                    />
                    <WorkspaceNavButton
                        active={activeTab === DEFAULT_TABS.documents.key}
                        icon={DEFAULT_TABS.documents.icon}
                        label={documentsLabel}
                        helper={DEFAULT_TABS.documents.helper}
                        onClick={() => setActiveTab(DEFAULT_TABS.documents.key)}
                    />
                </aside>

                <div className="min-w-0 rounded-xl border border-border/70 bg-background/80 p-3 md:p-4">
                    <div id={inventoryId} className={cn(activeTab !== DEFAULT_TABS.inventory.key && 'hidden')} role="tabpanel">
                        {activeTab === DEFAULT_TABS.inventory.key ? inventoryContent : null}
                    </div>
                    <div id={documentsId} className={cn(activeTab !== DEFAULT_TABS.documents.key && 'hidden')} role="tabpanel">
                        {activeTab === DEFAULT_TABS.documents.key ? documentsContent : null}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default RecordReviewWorkspace;