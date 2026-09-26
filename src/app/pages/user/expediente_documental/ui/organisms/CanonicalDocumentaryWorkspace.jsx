import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { documentaryError } from '@/app/services/documentary.service';
import { getCanonicalDocuments, getCanonicalVersions, downloadCanonicalFile, receiveCanonicalDocument, saveCanonicalControl, createCanonicalSubmit, updateCanonicalEvidence, getCanonicalHistory } from '@/app/services/documentaryOperations.service';
import { DocumentaryGovernance } from './DocumentaryGovernance';

const fieldClass = 'mt-1 block min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const effectLabels = { complies: 'Cumple', does_not_comply: 'No cumple', not_applicable: 'No aplica', no_decision: 'Sin decisión', pending: 'Pendiente', stale: 'Requiere nueva revisión', review_unavailable: 'Revisión no disponible', no_configured_controls: 'Sin controles configurados', unreviewed: 'Pendiente de revisión' };
const effectLabel = (value) => effectLabels[value] || 'Pendiente de revisión';

function ErrorMessage({ error }) {
  return error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null;
}

function ProjectSubmitForm({ origin, onSaved, onConflict }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const command = useRef(null);
  async function save(event) {
    event.preventDefault(); if (busy) return;
    const data = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try {
      command.current ||= { vrLabel: String(data.get('vrLabel')).trim(), reason: 'Apertura de VR para recepción documental', idempotencyKey: crypto.randomUUID() };
      await createCanonicalSubmit(origin.project.fun0Id, command.current);
      onSaved('VR vinculado al expediente.');
    } catch (failure) { if(failure.response)command.current=null;if(failure.response?.status===409)onConflict();else setError(documentaryError(failure)); }
    finally { setBusy(false); }
  }
  return <details className="rounded-md border border-border p-3"><summary className="cursor-pointer text-sm">Crear VR para este expediente</summary>
    <form onSubmit={save} onChange={() => { command.current = null; }} className="space-y-2 pt-3"><fieldset disabled={busy} className="space-y-2">
      <label className="block text-sm">Consecutivo VR<input className={fieldClass} name="vrLabel" maxLength={160} required /></label>
      <Button type="submit" size="sm" disabled={busy}>{busy ? 'Guardando…' : 'Crear VR'}</Button>
    </fieldset><ErrorMessage error={error} /></form>
  </details>;
}

function ControlDecision({ origin, row, control, canReview, onSaved, onConflict }) {
  const [value, setValue] = useState(control.review?.selectedSourceValueId || '');
  const [observation, setObservation] = useState(control.review?.observation || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const command = useRef(null);
  async function save(event) {
    event.preventDefault();
    if (busy || !canReview) return;
    setBusy(true); setError('');
    try {
      command.current ||= { selectedSourceValueId: value, observation: observation.trim() || null,
        expectedEvidenceRevision: row.receipt.evidenceRevision, expectedResultRevision: control.review?.resultRevision || 0,
        idempotencyKey: crypto.randomUUID(), reason: 'Revisión de Legal y debida forma' };
      await saveCanonicalControl(origin.project.fun0Id, row.receivedDocumentRowId, control.controlId, command.current);
      onSaved('Revisión guardada.');
    } catch (failure) { if(failure.response)command.current=null;if(failure.response?.status===409)onConflict();else setError(documentaryError(failure)); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} onChange={() => { command.current = null; }} className="space-y-2 rounded-md border border-border p-3">
    <p className="text-sm font-medium">{control.title}</p>
    <p className="text-xs text-muted-foreground">{control.review?.current === false ? 'La evidencia cambió. Revise nuevamente este control.' : effectLabel(control.review?.effect)}</p>
    <fieldset disabled={busy || !canReview} className="space-y-2">
      <label className="block text-sm">Resultado<select className={fieldClass} required value={value} onChange={(event) => setValue(event.target.value)}>
        <option value="">Seleccione un resultado</option>
        {control.values.map((item) => <option key={item.sourceValueId} value={item.sourceValueId}>{item.label}</option>)}
      </select></label>
      <label className="block text-sm">Observación<textarea className={fieldClass} maxLength={4000} value={observation} onChange={(event) => setObservation(event.target.value)} required={control.values.find((item) => item.sourceValueId === value)?.effect === 'does_not_comply'} /></label>
      {canReview ? <Button type="submit" size="sm" disabled={busy}>{busy ? 'Guardando…' : 'Guardar revisión'}</Button> : null}
    </fieldset>
    <ErrorMessage error={error} />
  </form>;
}

function ReceiptForm({ origin, view, fixedSubmitId, previous, onSaved, onCancel, onConflict }) {
  const [catalogueId, setCatalogueId] = useState(String(previous?.catalogueId || ''));
  const [submitId, setSubmitId] = useState(String(fixedSubmitId || ''));
  const [physical, setPhysical] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const command = useRef(null);
  const documents = origin.catalogue.documents.filter((document) => document.catalogueId && (document.isActive === true || document.isActive === 1));
  const selected = documents.find((document) => document.catalogueId === Number(catalogueId));
  const applicableIds = new Set((view.requirements?.documents || []).map((document) => document.catalogueId));
  async function save(event) {
    event.preventDefault(); if (busy) return;
    const data = new FormData(event.currentTarget);
    const digital = data.get('digital'); const scan = data.get('scan');
    if (!selected || !view.submits.some((submit) => submit.id === Number(submitId))) { setError('Seleccione un documento publicado y un VR del expediente.'); return; }
    if (!physical && !digital?.size) { setError('Registre el soporte físico o adjunte un archivo digital.'); return; }
    if ([digital, scan].some((file) => file?.size > 52428800)) { setError('Cada archivo debe pesar como máximo 50 MB.'); return; }
    setBusy(true); setError('');
    try {
      command.current ||= { catalogueId: selected.catalogueId, submitId: Number(submitId), historicalTitle: selected.name,
        instanceLabel: String(data.get('instanceLabel') || '').trim() || null, documentKey: previous?.documentKey || null,
        previousVersionId: previous?.receivedDocumentRowId || null, expectedRowVersion: previous?.receipt.rowVersion || null,
        receivedAt: new Date().toISOString(), physical: physical ? { pages: Number(data.get('pages')), location: String(data.get('location')).trim(), reference: null } : null,
        pagesDigital: null, idempotencyKey: crypto.randomUUID(), reason: String(data.get('reason')).trim() };
      await receiveCanonicalDocument(origin.project.fun0Id, command.current, digital?.size ? digital : null, scan?.size ? scan : null);
      onSaved(previous ? 'Nueva versión recibida. Sus controles quedan pendientes de revisión.' : 'Documento recibido.');
    } catch (failure) { if(failure.response)command.current=null;if(failure.response?.status===409)onConflict();else setError(documentaryError(failure)); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} onChange={() => { command.current = null; }} className="space-y-3 rounded-md border border-border p-4">
    <h3 className="text-sm font-semibold">{previous ? 'Recibir nueva versión' : 'Recibir documento'}</h3>
    <fieldset disabled={busy} className="grid gap-3 md:grid-cols-2">
      <label className="text-sm">Documento de Central<select className={fieldClass} required disabled={Boolean(previous)} value={catalogueId} onChange={(event) => setCatalogueId(event.target.value)}>
        <option value="">Seleccione un documento</option>{documents.map((document) => <option key={document.catalogueId} value={document.catalogueId}>{document.code} · {document.name}{applicableIds.has(document.catalogueId) ? ' · Aplicable' : ''}</option>)}
      </select></label>
      <label className="text-sm">VR de recepción<select className={fieldClass} required disabled={Boolean(fixedSubmitId)} value={submitId} onChange={(event) => setSubmitId(event.target.value)}>
        <option value="">Seleccione el VR</option>{view.submits.map((submit) => <option key={submit.id} value={submit.id}>{submit.idPublic}</option>)}
      </select></label>
      {selected ? <p className="text-xs text-muted-foreground md:col-span-2">Lista: {selected.listKey || 'Sin lista publicada'} · Categorías: {origin.catalogue.classifications.filter((item) => selected.classificationIds.includes(item.id)).map((item) => item.name).join(' · ') || 'Sin clasificación publicada'}</p> : null}
      <label className="text-sm md:col-span-2">Identificación adicional (opcional)<input className={fieldClass} name="instanceLabel" maxLength={255} /></label>
      {view.capabilities.receivePhysical ? <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={physical} onChange={(event) => setPhysical(event.target.checked)} />Se recibió soporte físico</label> : null}
      {physical ? <>
        <label className="text-sm">Folios físicos<input className={fieldClass} name="pages" type="number" min={1} step={1} required /></label>
        <label className="text-sm">Ubicación o referencia física<input className={fieldClass} name="location" maxLength={512} required /></label>
        <label className="text-sm">Escaneado del físico (opcional)<input className={fieldClass} name="scan" type="file" accept="application/pdf,image/jpeg,image/png" /></label>
      </> : null}
      {view.capabilities.receiveDigital ? <label className="text-sm">Archivo digital (opcional si hay físico)<input className={fieldClass} name="digital" type="file" accept="application/pdf,image/jpeg,image/png" /></label> : null}
      <label className="text-sm md:col-span-2">Nota de recepción<input className={fieldClass} name="reason" maxLength={1000} required /></label>
      <p className="text-xs text-muted-foreground md:col-span-2">Archivos PDF, JPG o PNG; máximo 50 MB cada uno.</p>
      <div className="flex gap-2 md:col-span-2"><Button type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar recepción'}</Button><Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button></div>
    </fieldset>
    <ErrorMessage error={error} />
  </form>;
}

function DocumentFiles({ origin, receipt, onError }) {
  const [busy, setBusy] = useState(false);
  async function download(slot) {
    setBusy(true);
    try { await downloadCanonicalFile(origin.project.fun0Id, receipt.id, slot, receipt.files[slot]); }
    catch (failure) { onError(documentaryError(failure)); }
    finally { setBusy(false); }
  }
  return <div className="flex flex-wrap gap-2">{['digital', 'scan'].filter((slot) => receipt.files?.[slot]).map((slot) => <Button key={slot} type="button" variant="outline" size="sm" disabled={busy} onClick={() => download(slot)}>Descargar {slot === 'digital' ? 'digital' : 'escaneado'}</Button>)}</div>;
}

function DocumentHistory({ origin, row }) {
  const [history, setHistory] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function load() {
    setBusy(true); setError('');
    try {
      const page = await getCanonicalVersions(origin.project.fun0Id, row, history?.nextAfterId || 0);
      setHistory({ ...page, rows: [...(history?.rows || []), ...page.rows] });
    } catch (failure) { setError(documentaryError(failure)); }
    finally { setBusy(false); }
  }
  return <div className="space-y-2">
    {!history || history.nextAfterId ? <Button type="button" variant="outline" size="sm" disabled={busy} onClick={load}>{busy ? 'Consultando…' : history ? 'Más versiones' : 'Consultar versiones'}</Button> : null}
    {history?.rows.map((receipt) => <div key={receipt.id} className="space-y-2 border-l border-border pl-3 text-sm"><p>Versión {receipt.versionSequence} · {receipt.vrLabel} · {receipt.receivedAt}</p><DocumentFiles origin={origin} receipt={receipt} onError={setError} /></div>)}
    <ErrorMessage error={error} />
  </div>;
}

function EvidenceForm({origin,row,onSaved,onConflict,onCancel}){
  const [sameContent,setSameContent]=useState(false),[physical,setPhysical]=useState(row.receipt.hasPhysical),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const command=useRef(null);
  async function save(event){event.preventDefault();if(busy||!sameContent)return;const form=event.currentTarget,data=new FormData(form),digital=form.elements.digital?.files?.[0]||null,scan=form.elements.scan?.files?.[0]||null;
    if([digital,scan].some(file=>file?.size>52428800)){setError('Cada archivo debe pesar como máximo 50 MB.');return;}
    setBusy(true);setError('');try{command.current||={expectedRowVersion:row.receipt.rowVersion,expectedEvidenceRevision:row.receipt.evidenceRevision,sameContent:true,physical:physical?{pages:Number(data.get('pages')),location:String(data.get('location')).trim()||null,reference:String(data.get('reference')||'').trim()||null}:null,pagesDigital:row.receipt.pagesDigital??null,idempotencyKey:crypto.randomUUID(),reason:String(data.get('reason')).trim()};await updateCanonicalEvidence(origin.project.fun0Id,row.receivedDocumentRowId,command.current,digital,scan);onSaved('Evidencia actualizada. Revise nuevamente los controles de esta fila.');}catch(failure){if(failure.response)command.current=null;if(failure.response?.status===409)onConflict();else setError(documentaryError(failure));}finally{setBusy(false);}}
  return <form onSubmit={save} onChange={()=>{command.current=null;}} className="space-y-3 rounded-md border border-border p-4"><h3 className="text-sm font-semibold">Actualizar evidencia de la misma recepción</h3><p className="text-xs text-muted-foreground">VR {row.receipt.vrLabel} · evidencia {row.receipt.evidenceRevision}. Un contenido corregido o un VR nuevo requiere otra versión.</p><fieldset disabled={busy} className="space-y-3">
    <label className="flex gap-2 text-sm"><input type="checkbox" checked={sameContent} onChange={event=>setSameContent(event.target.checked)}/>Confirmo que corresponde al mismo contenido y al mismo VR</label>
    <label className="flex gap-2 text-sm"><input type="checkbox" checked={physical} onChange={event=>setPhysical(event.target.checked)}/>Conservar o completar soporte físico</label>
    {physical?<><label className="block text-sm">Folios de esta evidencia<input className={fieldClass} name="pages" type="number" min={1} required defaultValue={row.receipt.pagesPhysical||1}/></label><label className="block text-sm">Ubicación de esta evidencia<input className={fieldClass} name="location" maxLength={512} defaultValue={row.receipt.location||''}/></label><label className="block text-sm">Referencia física<input className={fieldClass} name="reference" maxLength={255} defaultValue={row.receipt.reference||''}/></label><label className="block text-sm">Nuevo escaneado<input className={fieldClass} name="scan" type="file" accept="application/pdf,image/jpeg,image/png"/></label></>:null}
    <label className="block text-sm">Representación digital del mismo contenido<input className={fieldClass} name="digital" type="file" accept="application/pdf,image/jpeg,image/png"/></label><label className="block text-sm">Motivo de la actualización<input className={fieldClass} name="reason" required maxLength={1000}/></label>
    <div className="flex gap-2"><Button type="submit" disabled={!sameContent}>Guardar evidencia</Button><Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button></div></fieldset><ErrorMessage error={error}/></form>;
}

function AuditHistory({origin}){
  const [page,setPage]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function load(){setBusy(true);setError('');try{const next=await getCanonicalHistory(origin.project.fun0Id,page?.nextAfterId||0);setPage({nextAfterId:next.nextAfterId,events:[...new Map([...(page?.events||[]),...next.events].map(event=>[event.id,event])).values()]});}catch(failure){setError(documentaryError(failure));}finally{setBusy(false);}}
  return <details className="space-y-3 rounded-md border border-border p-3"><summary className="cursor-pointer text-sm font-medium">Historial documental</summary>{!page||page.nextAfterId?<Button type="button" variant="outline" size="sm" disabled={busy} onClick={load}>{page?'Más eventos':'Cargar historial'}</Button>:null}
    {page?.events.map(event=><article key={event.id} className="space-y-2 border-l border-border pl-3 text-sm"><p>{event.eventType} · {event.occurredAt} · usuario {event.actorId}</p><p>{event.reason}</p>{event.receivedDocumentRowId?[event.beforeJson?.manifest,event.afterJson?.manifest].filter(Boolean).map((manifest,index)=><div key={`${event.id}:${index}`}><p>Evidencia {manifest.evidenceRevision}</p><DocumentFiles origin={origin} receipt={{id:event.receivedDocumentRowId,files:manifest.files}} onError={setError}/></div>):null}</article>)}{page&&!page.events.length?<p className="text-sm">No hay eventos documentales.</p>:null}<ErrorMessage error={error}/></details>;
}

function RequirementSummary({view}){
  const summary=view.satisfaction;
  return <details className="space-y-2 rounded-md border border-border p-3"><summary className="cursor-pointer text-sm font-medium">Requisitos y recepción</summary><p className="text-sm">{summary?.allRequirementsSatisfied===true?'Los requisitos conocidos tienen recepción. Esto no constituye aprobación de controles.':summary?.allRequirementsSatisfied===false?'Hay requisitos pendientes de recepción.':'La evaluación está incompleta o pendiente de actualizar; no se presume completitud.'}</p>
    <ul className="space-y-1 text-sm">{(view.requirements?.documents||[]).map(document=><li key={document.catalogueId||document.code}>{document.code} · {document.name} · {document.standaloneRequired?'Obligatorio independiente':document.required?'Requerido':'Alternativa o complementario'}</li>)}</ul>
    {(summary?.groups||[]).map(group=><p key={group.code} className="text-sm">{group.code} · {group.mode==='at_least_one'?'Al menos uno':group.mode==='all'?'Todos':'Complementario'} · {group.status==='satisfied'?'Recibido':group.status==='not_applicable'?'No aplicable':'Pendiente'}</p>)}</details>;
}

export function CanonicalDocumentaryWorkspace({ origin, canManage = false, fixedSubmitId, onOriginChange }) {
  const [revision, setRevision] = useState(0);
  const [cursors, setCursors] = useState([0]);
  const [result, setResult] = useState(null);
  const [entry, setEntry] = useState(null);
  const [evidence,setEvidence]=useState(null);
  const [notice, setNotice] = useState('');
  const [fileError, setFileError] = useState('');
  const afterId = cursors[cursors.length - 1];
  const requestKey = `${origin.project.fun0Id}:${origin.publication.configurationId}:${origin.publication.checksum}:${afterId}:${revision}`;
  useEffect(() => {
    const controller = new AbortController();
    getCanonicalDocuments(origin, afterId, controller.signal)
      .then((view) => { if (!controller.signal.aborted) setResult({ key: requestKey, view }); })
      .catch((failure) => { if (!controller.signal.aborted) setResult({ key: requestKey, error: documentaryError(failure) }); });
    return () => controller.abort();
  }, [origin, afterId, requestKey]);
  const current = result?.key === requestKey ? result : null;
  const view = current?.view;
  function refresh(message = '') { setEntry(null); setEvidence(null); setNotice(message); setFileError(''); setRevision((value) => value + 1); }
  function conflict(){refresh('Los datos cambiaron. Revise el estado actualizado y confirme nuevamente su decisión.');}
  const submitMatches = !fixedSubmitId || view?.submits.some((submit) => submit.id === Number(fixedSubmitId));
  const canReceive = canManage && view && !view.readOnly && view.capabilities.createDocument && submitMatches;
  return <section className="space-y-4 p-3">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold">Documentación y Legal y debida forma</h2><Button type="button" variant="outline" size="sm" onClick={() => refresh()}>Actualizar</Button></div>
    {notice ? <p role="status" className="text-sm">{notice}</p> : null}
    <ErrorMessage error={current?.error || fileError} />
    {!current ? <p role="status" className="text-sm text-muted-foreground">Consultando documentos del expediente…</p> : null}
    {view ? <>
      <DocumentaryGovernance key={`governance:${requestKey}`} origin={origin} view={view} canManage={canManage&&!view.readOnly} onSaved={(message,changed)=>{refresh(message);if(changed)onOriginChange?.();}} onConflict={conflict}/>
      <RequirementSummary view={view}/>
      {view.readOnly ? <p role="status" className="text-sm text-muted-foreground">La consulta está disponible. La recepción y la revisión requieren habilitar las capacidades pendientes del servidor.</p> : null}
      {!submitMatches ? <p role="status" className="text-sm text-muted-foreground">Este VR aún no tiene vínculo operativo con el expediente. No se pueden registrar documentos en él.</p> : null}
      {view.warnings.length ? <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{view.warnings.map((warning) => <li key={warning.code}>{warning.code.startsWith('REQUIREMENTS_') ? 'Los requisitos están pendientes de evaluación o actualización; la recepción no confirma que el expediente esté completo.' : warning.code === 'NO_CONFIGURED_CONTROLS' ? 'Esta publicación no tiene controles configurados. No se presume cumplimiento.' : warning.message}</li>)}</ul> : null}
      {canReceive && !entry ? <Button type="button" disabled={!view.submits.length} onClick={() => setEntry({})}>Recibir documento</Button> : null}
      {canReceive && !fixedSubmitId ? <ProjectSubmitForm key={requestKey} origin={origin} onSaved={refresh} onConflict={conflict} /> : null}
      {!view.submits.length ? <p className="text-sm text-muted-foreground">No hay un VR vinculado para recibir documentos.</p> : null}
      {canReceive && entry ? <ReceiptForm key={`${requestKey}:${entry.rowKey || 'new'}`} origin={origin} view={view} fixedSubmitId={fixedSubmitId} previous={entry.rowKey ? entry : null} onSaved={(message) => { setCursors([0]); refresh(message); }} onCancel={() => setEntry(null)} onConflict={conflict} /> : null}
      {canReceive && evidence?<EvidenceForm key={`evidence:${requestKey}`} origin={origin} row={evidence} onSaved={refresh} onConflict={conflict} onCancel={()=>setEvidence(null)}/>:null}
      {!view.rows.length ? <p className="text-sm text-muted-foreground">No hay documentos recibidos en esta página.</p> : null}
      {view.rows.map((row) => <article key={`${requestKey}:${row.rowKey}`} className="space-y-3 rounded-md border border-border p-4">
        <div><h3 className="text-sm font-semibold">{row.catalogueDisplay.code} · {row.catalogueDisplay.name}</h3><p className="text-xs text-muted-foreground">{row.receipt.vrLabel} · Versión {row.versionSequence} · {effectLabel(row.compliance)}{row.receipt.hasPhysical ? ` · ${row.receipt.pagesPhysical} folios físicos` : ''}</p></div>
        <DocumentFiles origin={origin} receipt={row.receipt} onError={setFileError} />
        {row.isAdditional===true?<p className="text-xs text-muted-foreground">Documento adicional: su recepción no modifica los requisitos.</p>:null}
        {canReceive&&row.actions.replace?<Button type="button" variant="outline" size="sm" onClick={()=>{setEntry(null);setEvidence(row);}}>Actualizar evidencia</Button>:null}
        {canReceive && row.actions.replace ? <Button type="button" variant="outline" size="sm" onClick={() => setEntry(row)}>Recibir nueva versión</Button> : null}
        <details><summary className="cursor-pointer py-2 text-sm font-medium">Legal y debida forma ({row.controls.length})</summary><div className="space-y-2 pt-2">
          {!row.controls.length ? <p className="text-sm text-muted-foreground">No hay controles aplicables; esto no equivale a una aprobación.</p> : null}
          {row.controls.map((control) => <ControlDecision key={control.controlId} origin={origin} row={row} control={control} canReview={Boolean(canManage && !view.readOnly && view.capabilities.review && row.actions.review)} onSaved={refresh} onConflict={conflict} />)}
        </div></details>
        <DocumentHistory origin={origin} row={row} />
      </article>)}
      <nav className="flex items-center justify-end gap-2" aria-label="Paginación documental"><Button type="button" variant="outline" disabled={cursors.length === 1} onClick={() => { setEntry(null); setCursors((items) => items.slice(0, -1)); }}>Anterior</Button><span className="text-sm">Página {cursors.length}</span><Button type="button" variant="outline" disabled={!view.pagination.nextAfterId} onClick={() => { setEntry(null); setCursors((items) => [...items, view.pagination.nextAfterId]); }}>Siguiente</Button></nav>
      <AuditHistory key={`history:${requestKey}`} origin={origin}/>
    </> : null}
  </section>;
}
