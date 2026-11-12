import { ChevronDown, Wrench } from 'lucide-react';
import Icon from '@/shared/components/icon';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

/**
 * Labeled "Herramientas" menu of the Tiempos module (it replaces the floating toolbox
 * button). Same actions and ids as before; `onAction(id)` is handled by the module.
 */
export const ToolsMenu = ({ onAction, canAddSuspension, canAddExtension, isDesisted }) => {
    const menuItems = [
        { id: 'schedule', label: 'Programar tiempos', icon: 'CalendarCheck', show: true },
        { id: 'breakdown', label: 'Desglose de días', icon: 'PieChart', show: true },
        { id: 'gantt', label: 'Ver Gantt completo', icon: 'Network', show: true },
        { id: 'time-travel', label: 'Emulador de fecha', icon: 'UserClock', show: true },
        { id: 'calendar', label: 'Calendario de días hábiles', icon: 'Calendar', show: true },
        { isDivider: true, show: !isDesisted && (canAddSuspension || canAddExtension) },
        { id: 'suspension', label: 'Añadir suspensión', icon: 'Pause', show: !isDesisted && canAddSuspension },
        { id: 'extension', label: 'Añadir prórroga', icon: 'Clock', show: !isDesisted && canAddExtension },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg px-3 text-[13px] font-medium" data-tiempos-tools-trigger="">
                    <Wrench className="h-4 w-4" aria-hidden="true" />
                    Herramientas
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={6} className="min-w-[14rem]">
                {menuItems.map((item, index) => {
                    if (!item.show) return null;
                    if (item.isDivider) return <DropdownMenuSeparator key={`divider-${index}`} />;

                    return (
                        <DropdownMenuItem
                            key={item.id}
                            className="cursor-pointer text-[13px]"
                            onSelect={() => onAction(item.id)}
                        >
                            <Icon name={item.icon} size={15} aria-hidden="true" />
                            {item.label}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
