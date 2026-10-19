import { CircleAlert, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getLabels, getMetadata, getSnapshot } from '../onlineRadicationModel';
import { DocumentEntriesSection } from './DocumentEntriesSection';
import { DocumentsSection } from './DocumentsSection';
import { OutcomeNotice } from './OutcomeNotice';
import { ProfessionalsSection, ResponsibleSection, TitleholdersSection } from './PeopleSections';
import { SelfAssessmentSection } from './SelfAssessmentSection';
import { BoundariesSection, CharacteristicsSection, NeighborsSection } from './SiteSections';
import { ApplicantSection, PropertySection, RequestSummarySection } from './SummarySections';
import { TechnicalContextSection } from './TechnicalContextSection';

function DetailSkeleton() {
  const bone = 'motion-reduce:animate-none';
  return (
    <div className="flex flex-col gap-[1rem]" aria-hidden="true">
      {[5, 6, 4].map((rows, index) => (
        <div key={index} className="rounded-xl border bg-[hsl(var(--card))] shadow-sm">
          <div className="flex items-center gap-2.5 border-b px-[1rem] py-2.5">
            <Skeleton className={`h-7 w-7 rounded-lg ${bone}`} />
            <Skeleton className={`h-4 w-40 ${bone}`} />
          </div>
          <div className="grid gap-x-6 gap-y-[0.875rem] px-[1rem] py-[0.875rem] sm:grid-cols-2">
            {Array.from({ length: rows }, (_, row) => (
              <div key={row} className="space-y-1.5">
                <Skeleton className={`h-3 w-24 ${bone}`} />
                <Skeleton className={`h-4 w-44 max-w-full ${bone}`} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Scrollable body of the detail sheet, in the agreed order. Without snapshot (older portal
 * clients) only the summary columns and the evaluated requirements exist.
 */
export function DetailBody({ item, now, loaded, loading, error, onRetry, entryActionsDisabled, onReceiveEntry, onRejectEntry, onViewFile }) {
  if (!loaded) {
    return (
      <div className="flex flex-col gap-[1rem] px-6 py-[1.25rem]">
        <OutcomeNotice item={item} />
        {error ? (
          <Alert variant="destructive" className="flex-wrap items-center">
            <CircleAlert aria-hidden="true" />
            <AlertDescription className="min-w-0 flex-1">{error.message}</AlertDescription>
            <Button type="button" variant="outline" size="sm" className="h-8 bg-background px-[0.75rem]" onClick={onRetry}>Reintentar</Button>
          </Alert>
        ) : null}
        {loading ? (
          <>
            <p role="status" className="sr-only">Cargando el detalle de la solicitud…</p>
            <DetailSkeleton />
          </>
        ) : null}
      </div>
    );
  }

  const metadata = getMetadata(item);
  const labels = getLabels(item);
  const sectionProps = { item, metadata, labels };

  return (
    <div className="flex flex-col gap-[1rem] px-6 py-[1.25rem]">
      <OutcomeNotice item={item} />
      {error ? (
        <Alert variant="destructive" className="flex-wrap items-center">
          <CircleAlert aria-hidden="true" />
          <AlertDescription className="min-w-0 flex-1">No fue posible actualizar el detalle: {error.message}</AlertDescription>
          <Button type="button" variant="outline" size="sm" className="h-8 bg-background px-[0.75rem]" onClick={onRetry}>Reintentar</Button>
        </Alert>
      ) : null}
      {!metadata ? (
        <Alert variant="neutral" role="note">
          <Info aria-hidden="true" />
          <AlertDescription className="min-w-0 flex-1">
            {getSnapshot(item)
              ? 'El portal no envió los datos del formulario de esta solicitud. Se muestran los datos de resumen y los documentos.'
              : 'El portal envió solo los códigos del catálogo para esta solicitud. Se muestran los datos de resumen y los requisitos evaluados.'}
          </AlertDescription>
        </Alert>
      ) : null}

      <RequestSummarySection {...sectionProps} />
      <DocumentEntriesSection
        item={item}
        now={now}
        actionsDisabled={entryActionsDisabled}
        onReceive={onReceiveEntry}
        onReject={onRejectEntry}
        onViewFile={onViewFile}
      />
      <ApplicantSection {...sectionProps} />
      <PropertySection {...sectionProps} />
      {metadata ? (
        <>
          <TitleholdersSection {...sectionProps} />
          <ProfessionalsSection {...sectionProps} />
          <ResponsibleSection {...sectionProps} />
          <NeighborsSection {...sectionProps} />
          <BoundariesSection {...sectionProps} />
          <CharacteristicsSection {...sectionProps} />
        </>
      ) : null}
      <DocumentsSection item={item} onViewFile={onViewFile} />
      <SelfAssessmentSection item={item} />
      <TechnicalContextSection item={item} />
    </div>
  );
}
