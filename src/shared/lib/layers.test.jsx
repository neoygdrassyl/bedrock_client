import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Z_CLASS, Z_INDEX } from './layers';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/shared/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/shared/ui/alert-dialog';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/shared/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';

describe('layer scale', () => {
  it('keeps the Tailwind classes in sync with the numeric scale', () => {
    expect(Z_CLASS.workspace).toBe(`z-[${Z_INDEX.workspace}]`);
    expect(Z_CLASS.dock).toBe(`z-[${Z_INDEX.dock}]`);
    expect(Z_CLASS.modal).toBe(`z-[${Z_INDEX.modal}]`);
    expect(Z_CLASS.floating).toBe(`z-[${Z_INDEX.floating}]`);
  });

  it('stacks portaled surfaces above the expediente workspace and below SweetAlert', () => {
    expect(Z_INDEX.pageModal).toBeLessThan(Z_INDEX.workspace);
    expect(Z_INDEX.launcher).toBeLessThan(Z_INDEX.workspace);
    expect(Z_INDEX.workspace).toBeLessThan(Z_INDEX.dock);
    expect(Z_INDEX.dock).toBeLessThan(Z_INDEX.modal);
    expect(Z_INDEX.modal).toBeLessThan(Z_INDEX.floating);
    expect(Z_INDEX.floating).toBeLessThan(Z_INDEX.systemAlert);
  });
});

describe('portaled primitives', () => {
  it.each([
    ['dialog', <Dialog open><DialogContent><DialogTitle>Diálogo</DialogTitle><DialogDescription>d</DialogDescription></DialogContent></Dialog>],
    ['alertdialog', <AlertDialog open><AlertDialogContent><AlertDialogTitle>Diálogo</AlertDialogTitle><AlertDialogDescription>a</AlertDialogDescription></AlertDialogContent></AlertDialog>],
    ['dialog', <Sheet open><SheetContent><SheetTitle>Diálogo</SheetTitle><SheetDescription>p</SheetDescription></SheetContent></Sheet>],
  ])('renders the %s surface and its overlay on the modal layer', (role, element) => {
    render(element);
    const surface = screen.getByRole(role, { name: 'Diálogo' });
    expect(surface).toHaveClass(Z_CLASS.modal);
    // The overlay is the sibling rendered right before the content.
    expect(surface.previousElementSibling).toHaveClass(Z_CLASS.modal);
  });

  it('lets a caller override the layer explicitly', () => {
    render(<Dialog open><DialogContent className="z-[10050]"><DialogTitle>Alarmas</DialogTitle><DialogDescription>d</DialogDescription></DialogContent></Dialog>);
    const dialog = screen.getByRole('dialog', { name: 'Alarmas' });
    expect(dialog).toHaveClass('z-[10050]');
    expect(dialog).not.toHaveClass(Z_CLASS.modal);
  });

  it('render floating content above modal surfaces', () => {
    render(
      <TooltipProvider>
        <Popover open><PopoverTrigger>Abrir</PopoverTrigger><PopoverContent>Contenido emergente</PopoverContent></Popover>
        <DropdownMenu open><DropdownMenuTrigger>Menú</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Opción</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        <Tooltip open><TooltipTrigger>Ayuda</TooltipTrigger><TooltipContent>Texto de ayuda</TooltipContent></Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByText('Contenido emergente')).toHaveClass(Z_CLASS.floating);
    expect(screen.getByRole('menu')).toHaveClass(Z_CLASS.floating);
    expect(screen.getAllByText('Texto de ayuda')[0].closest(`.${CSS.escape(Z_CLASS.floating)}`)).not.toBeNull();
  });
});
