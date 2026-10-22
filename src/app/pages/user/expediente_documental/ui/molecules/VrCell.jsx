import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Tag } from '../atoms/Tag';
import { cn } from '@/shared/lib/utils';
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
                <Tag
                    as="button"
                    type="button"
                    aria-label={`Ver ${extraValues.length} VR adicionales`}
                    pill
                >
                    +{extraValues.length}
                </Tag>
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
