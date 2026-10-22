import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import DataService from '@/shared/api/data.service';
import RegistryConsolidate from './RegistryConsolidate';
import RegistryDetail from './RegistryDetail';
import RegistryForm from './RegistryForm';
import RegistryList from './RegistryList';
import RegistryReview from './RegistryReview';
import { canWriteRegistry } from './professionalRegistry.utils';

export default function ProfessionalRegistryPage() {
  const canWrite = canWriteRegistry(DataService.getUserData());
  const [view, setView] = useState('profesionales');
  const [detailId, setDetailId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [consolidateOpen, setConsolidateOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const refresh = () => setRefreshToken((value) => value + 1);

  return (
    <div className="w-full space-y-4 animate-fade-in-up">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">BD PROFESIONALES</h1>
          <p className="text-xs text-muted-foreground">Un registro por profesional, con sus roles, experiencia y expedientes. Se alimenta de la sección 5.2 de los expedientes.</p>
        </div>
        {canWrite ? (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setConsolidateOpen(true)}><RefreshCw className="mr-1 h-4 w-4" aria-hidden="true" />Reconciliar</Button>
            <Button type="button" onClick={() => setCreateOpen(true)}><Plus className="mr-1 h-4 w-4" aria-hidden="true" />Nuevo profesional</Button>
          </div>
        ) : null}
      </header>

      <nav className="flex gap-2" aria-label="Vistas de BD PROFESIONALES">
        <Button type="button" variant={view === 'profesionales' ? 'default' : 'outline'} aria-current={view === 'profesionales' ? 'page' : undefined} onClick={() => setView('profesionales')}>Profesionales</Button>
        <Button type="button" variant={view === 'revision' ? 'default' : 'outline'} aria-current={view === 'revision' ? 'page' : undefined} onClick={() => setView('revision')}>Por revisar</Button>
      </nav>

      {view === 'profesionales'
        ? <RegistryList onOpen={setDetailId} refreshToken={refreshToken} />
        : <RegistryReview canWrite={canWrite} onChanged={refresh} onOpen={setDetailId} />}

      {detailId ? <RegistryDetail id={detailId} canWrite={canWrite} onClose={() => setDetailId(null)} onChanged={refresh} onOpen={setDetailId} /> : null}
      <RegistryForm
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSaved={(created) => { setCreateOpen(false); refresh(); if (created?.id) setDetailId(created.id); }}
        onOpenExisting={(id) => { setCreateOpen(false); setDetailId(id); }}
      />
      <RegistryConsolidate open={consolidateOpen} onClose={() => setConsolidateOpen(false)} onApplied={refresh} />
    </div>
  );
}
