import { ArrowUpRight, Ban, FolderPlus } from 'lucide-react';
import { DovelaButton } from '@/shared/dovela-ui';
import { SheetClose } from '@/shared/ui/sheet';
import { cn } from '@/shared/lib/utils';
import { expedienteHref } from '../components/ExpedienteLink';

// The primitive `border` is Bootstrap's !important utility, so tone borders use `border-[1px]`.
const DANGER_OUTLINE = 'border-[1px] border-solid border-[hsl(var(--destructive)/0.45)] bg-transparent text-[hsl(var(--destructive))] shadow-none hover:bg-[hsl(var(--destructive)/0.08)] hover:text-[hsl(var(--destructive))]';
const LINK_BUTTON = 'inline-flex h-[var(--button-height-md)] items-center justify-center gap-2 rounded-[var(--button-radius)] bg-[hsl(var(--primary))] px-[1rem] text-sm font-medium text-[hsl(var(--primary-foreground))] no-underline shadow-[shadow:var(--button-shadow)] transition-colors hover:bg-[hsl(var(--primary)/0.9)] hover:text-[hsl(var(--primary-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:size-4';

/** Sticky footer: decisions for pending requests, navigation for radicated ones. */
export function DetailFooter({ item, disabled, onRadicate, onReject, primaryRef, liquidation = null, onApprovePayment }) {
  const pending = item.status === 'pending';
  // With a liquidation, the request is radicated only by approving the payment.
  const inLiquidation = pending && Boolean(liquidation) && liquidation.status !== 'approved';
  const href = item.status === 'radicated' ? expedienteHref(item.funIdPublic) : '';

  return (
    <footer className="flex shrink-0 flex-wrap items-center justify-between gap-x-[1rem] gap-y-2 border-t bg-[hsl(var(--card))] px-6 py-[0.875rem]">
      <p className="mb-0 min-w-0 flex-1 basis-[16rem] text-xs leading-5 text-muted-foreground">
        {inLiquidation
          ? 'Al aprobar el pago se radica la solicitud: se asignan el número de expediente y el VR.'
          : pending
          ? 'Al llevar a radicación se asignan el número de expediente y el VR.'
          : item.status === 'radicated'
            ? 'La solicitud ya forma parte de la Ventanilla Única.'
            : 'Las solicitudes rechazadas no consumen consecutivos.'}
      </p>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {pending ? (
          <>
            <DovelaButton tone="neutral" leadingIcon={Ban} disabled={disabled} onClick={onReject} className={cn(DANGER_OUTLINE)}>
              Rechazar
            </DovelaButton>
            {inLiquidation ? (
              <DovelaButton ref={primaryRef} tone="primary" leadingIcon={FolderPlus} disabled={disabled || liquidation.status !== 'receipt_submitted'} onClick={onApprovePayment}>
                Aprobar pago y radicar
              </DovelaButton>
            ) : (
              <DovelaButton ref={primaryRef} tone="primary" leadingIcon={FolderPlus} disabled={disabled} onClick={onRadicate}>
                Llevar a radicación
              </DovelaButton>
            )}
          </>
        ) : (
          <>
            <SheetClose asChild>
              <DovelaButton tone="neutral">Cerrar</DovelaButton>
            </SheetClose>
            {href ? (
              <a ref={primaryRef} href={href} target="_blank" rel="noopener noreferrer" className={LINK_BUTTON}>
                Abrir expediente
                <ArrowUpRight aria-hidden="true" />
                <span className="sr-only"> (pestaña nueva)</span>
              </a>
            ) : null}
          </>
        )}
      </div>
    </footer>
  );
}
