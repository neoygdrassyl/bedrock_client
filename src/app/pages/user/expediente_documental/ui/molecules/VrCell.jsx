import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { VrBadge } from '../atoms/VrBadge';
import { getDocumentVrDisplayValue } from '../../../shared/expediente-documental.utils';

function dedupeVrValues(latestVr, vrValues) {
    const seen = new Set();
    const ordered = [];

    [latestVr, ...vrValues].forEach((rawValue) => {
        const value = String(rawValue || '').trim();
        if (!value || seen.has(value)) {
            return;
        }
        seen.add(value);
        ordered.push(value);
    });

    return ordered;
}

export function VrCell({ latestVr, vrValues = [], className }) {
    const values = dedupeVrValues(latestVr, vrValues);
    const [primaryValue, ...extraValues] = values;

    return <div className={cn('flex items-center gap-1.5', className)} data-testid="vr-cell">
        <VrBadge value={primaryValue} />
        {extraValues.length ? <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Badge
                    variant="outline"
                    role="button"
                    tabIndex={0}
                    aria-label={`Ver ${extraValues.length} VR adicionales`}
                    className="cursor-pointer rounded-full border-border bg-muted/40 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground hover:bg-muted"
                >
                    +{extraValues.length}
                </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuLabel>VR asociados</DropdownMenuLabel>
                {extraValues.map((value) => <DropdownMenuItem key={value} className="font-mono text-xs">
                    {getDocumentVrDisplayValue(value)}
                </DropdownMenuItem>)}
            </DropdownMenuContent>
        </DropdownMenu> : null}
    </div>;
}

export default VrCell;
