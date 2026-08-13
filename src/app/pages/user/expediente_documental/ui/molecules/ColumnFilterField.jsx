import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Radix `Select.Item` forbids an empty-string value, so the legacy
// `<option value="">Todos</option>` reset option needs a sentinel that this
// component maps back to `''` before calling `onChange`.
const ALL_VALUE = '__all__';

export function ColumnFilterField({
    type = 'text',
    value = '',
    onChange,
    placeholder = '',
    options = [],
    allLabel = 'Todos',
    icon: IconComponent,
    className,
    ...rest
}) {
    if (type === 'select') {
        return <Select value={value || ALL_VALUE} onValueChange={(next) => onChange?.(next === ALL_VALUE ? '' : next)}>
            <SelectTrigger data-testid="column-filter-select" className={cn('h-8 text-xs', className)} {...rest}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={ALL_VALUE}>{allLabel}</SelectItem>
                {options.map((option) => <SelectItem key={option.value} value={option.value}>
                    {option.label}{typeof option.count === 'number' ? ` (${option.count})` : ''}
                </SelectItem>)}
            </SelectContent>
        </Select>;
    }

    return <div className="relative">
        {IconComponent ? <IconComponent size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" /> : null}
        <Input
            type="text"
            data-testid="column-filter-input"
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            placeholder={placeholder}
            className={cn('h-8 text-xs', IconComponent && 'pl-8', className)}
            {...rest}
        />
    </div>;
}

export default ColumnFilterField;
