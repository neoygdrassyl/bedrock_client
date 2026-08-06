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
                'flex h-full w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors',
                'min-w-0',
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
            <span className="min-w-0 flex-1">
                <span className="block break-words text-sm font-semibold leading-5">{label}</span>
                <span className="block break-words text-xs text-muted-foreground">{helper}</span>
            </span>
        </button>
    );
}

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

    return (
        <section className={cn('w-full min-w-0 rounded-2xl border border-border bg-card/80 p-3 shadow-sm md:p-4', className)}>
            <div className="flex min-w-0 flex-col gap-3">
                <div className="grid min-w-0 gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" role="tablist" aria-label="Navegación documental del informe">
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
                </div>

                <div className="min-w-0 rounded-xl border border-border/70 bg-background/80 p-3 md:p-4">
                    <div
                        id={inventoryId}
                        className={cn(
                            'min-w-0 pr-1',
                            inventoryExpanded
                                ? 'h-auto max-h-none overflow-visible'
                                : 'h-[32rem] max-h-[62vh] overflow-auto',
                            activeTab !== DEFAULT_TABS.inventory.key && 'hidden'
                        )}
                        role="tabpanel"
                    >
                        {activeTab === DEFAULT_TABS.inventory.key ? inventoryContent : null}
                    </div>
                    <div
                        id={documentsId}
                        className={cn('h-[32rem] max-h-[62vh] min-w-0 overflow-auto pr-1', activeTab !== DEFAULT_TABS.documents.key && 'hidden')}
                        role="tabpanel"
                    >
                        {activeTab === DEFAULT_TABS.documents.key ? documentsContent : null}
                    </div>
                </div>

                {professionalsContent ? (
                    <div className="min-w-0 rounded-xl border border-border/70 bg-background/80">
                        <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                                <Icon name="HardHat" size={14} />
                            </span>
                            <h3 className="m-0 text-sm font-semibold text-foreground">{professionalsLabel}</h3>
                        </div>
                        <div className="max-h-[24rem] min-w-0 overflow-auto p-3 md:p-4">
                            {professionalsContent}
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    );
}

export default RecordReviewWorkspace;
