import React from 'react';
import { Icon } from '@/components/icon';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function getVisualState(bookmarkState) {
  if (bookmarkState?.personal && bookmarkState?.team) {
    return {
      icon: 'star',
      className: 'text-accent',
      label: 'Destacado para mí y para el equipo',
    };
  }

  if (bookmarkState?.team) {
    return {
      icon: 'star',
      className: 'text-primary',
      label: 'Destacado para el equipo',
    };
  }

  if (bookmarkState?.personal) {
    return {
      icon: 'star',
      className: 'text-warning',
      label: 'Destacado solo para mí',
    };
  }

  return {
    icon: 'star',
    className: 'text-muted-foreground opacity-40',
    label: 'Abrir opciones de destacado',
  };
}

export function BookmarkQuickMenu({
  bookmarkState,
  onToggleScope,
  rowId,
  triggerClassName = '',
  triggerTestIdPrefix = 'bookmark-menu-trigger',
  menuTestIdPrefix = 'bookmark-menu',
  disabled = false,
}) {
  const visualState = getVisualState(bookmarkState);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={triggerClassName}
          title={visualState.label}
          aria-label={visualState.label}
          data-testid={`${triggerTestIdPrefix}-${rowId}`}
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <Icon
            name={visualState.icon}
            size={16}
            className={visualState.className}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-56"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <DropdownMenuLabel>Destacar expediente</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={Boolean(bookmarkState?.personal)}
          onCheckedChange={(checked) => onToggleScope?.('personal', Boolean(checked))}
          data-testid={`${menuTestIdPrefix}-personal-${rowId}`}
        >
          Solo para mí
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={Boolean(bookmarkState?.team)}
          onCheckedChange={(checked) => onToggleScope?.('team', Boolean(checked))}
          data-testid={`${menuTestIdPrefix}-team-${rowId}`}
        >
          Para el equipo
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
