import {useEffect,useId,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {documentaryError,getDocumentaryConfigurations} from '@/app/services/documentary.service';
import {getDocumentaryGovernance,getDocumentaryConfigurationOptions,activateDocumentaryProject,changeDocumentaryConfiguration,saveDocumentaryInputs,refreshDocumentaryRequirements} from '@/app/services/documentaryOperations.service';
const field='mt-1 block min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';
export function DocumentaryGovernance({origin,view,canManage=false,onSaved=()=>{},onConflict=()=>{}}){
  const formId=useId();
  const canonical=origin.mode==='canonical';
  const [governance,setGovernance]=useState(null),[configurations,setConfigurations]=useState(canonical?[{id:origin.publication.configurationId,checksum:origin.publication.checksum,releaseVersion:origin.publication.releaseVersion}]:[]);
  const [selected,setSelected]=useState(String(origin.publication?.configurationId||'')),[options,setOptions]=useState(null),[acts,setActs]=useState([]),[selections,setSelections]=useState({});
  const [error,setError]=useState(''),[busy,setBusy]=useState(false),[confirmed,setConfirmed]=useState(false),[reason,setReason]=useState('');
  const command=useRef(null);
  useEffect(()=>{const abort=new AbortController();getDocumentaryGovernance(origin.project.fun0Id,abort.signal).then(value=>{if(!abort.signal.aborted){setGovernance(value);setActs(value.inputs?.explicitActuationIds||[]);setSelections(value.inputs?.typologySelections||{});}}).catch(failure=>{if(!abort.signal.aborted)setError(documentaryError(failure));});if(!canonical)getDocumentaryConfigurations(abort.signal).then(value=>{if(!abort.signal.aborted)setConfigurations(value);}).catch(failure=>{if(!abort.signal.aborted)setError(documentaryError(failure));});return()=>abort.abort();},[origin.project.fun0Id,canonical]);
  useEffect(()=>{if(!selected){setOptions(null);return undefined;}const abort=new AbortController();setOptions(null);getDocumentaryConfigurationOptions(Number(selected),abort.signal).then(value=>{if(!abort.signal.aborted)setOptions(value);}).catch(failure=>{if(!abort.signal.aborted)setError(documentaryError(failure));});return()=>abort.abort();},[selected]);
  async function execute(operation){
    if(busy||!canManage)return;setBusy(true);setError('');
    try{
      const configuration=configurations.find(item=>item.id===Number(selected));
      if(!reason.trim())throw new Error('Indique el motivo del cambio.');
      if(operation==='activate'&&(!confirmed||!options?.projectionReady||!governance?.capabilities?.activationReady))throw new Error('La activación aún no está disponible.');
      const base={expectedInputRevision:governance?.inputRevision||0,idempotencyKey:crypto.randomUUID(),reason:reason.trim()};
       if(command.current?.operation!==operation)command.current=null;
       command.current ||= {operation,body:{...base,...(operation==='refresh'?{}:{explicitActuationIds:acts,typologySelections:selections}),...(['activate','configuration'].includes(operation)?{configurationId:configuration.id,expectedChecksum:configuration.checksum}:{})}};
      const api={activate:activateDocumentaryProject,configuration:changeDocumentaryConfiguration,inputs:saveDocumentaryInputs,refresh:refreshDocumentaryRequirements}[operation];
      await api(origin.project.fun0Id,command.current.body);command.current=null;
      onSaved(operation==='activate'?'Activación explícita registrada para futuras recepciones.':'Configuración documental actualizada.',operation==='activate'||operation==='configuration');
    }catch(failure){if(failure.response)command.current=null;if(failure.response?.status===409)onConflict();else setError(documentaryError(failure));}
    finally{setBusy(false);}
  }
  async function loadConfigurations(){try{setConfigurations(await getDocumentaryConfigurations());}catch(failure){setError(documentaryError(failure));}}
  const pinned=Boolean(view?.counts?.receivedVersions);
  return <details className="space-y-3 rounded-md border border-border p-3"><summary className="cursor-pointer text-sm font-medium">Gobierno y requisitos documentales</summary>
    <p className="text-sm text-muted-foreground">{canonical?`Revisión de entrada ${governance?.inputRevision??'…'} · ${view?.governance?.cacheState||governance?.cacheState||'Sin caché'}`:'La activación es explícita; los documentos históricos permanecen en su fuente original.'}</p>
    {error?<p role="alert" className="text-sm text-destructive">{error}</p>:null}
    <form onSubmit={event=>{event.preventDefault();execute(canonical?'inputs':'activate');}} onChange={()=>{command.current=null;}} className="space-y-3">
      <fieldset disabled={busy||!canManage} className="space-y-3">
        <label htmlFor={`${formId}-publication`} className="block text-sm">Publicación documental<select id={`${formId}-publication`} name="configurationId" className={field} value={selected} disabled={pinned} onChange={event=>{setSelected(event.target.value);setActs([]);setSelections({});setConfirmed(false);}}><option value="">Seleccione una publicación</option>{configurations.map(item=><option key={item.id} value={item.id}>Publicación {item.releaseVersion} · {item.id}</option>)}</select></label>
        {canonical&&!pinned?<Button type="button" variant="outline" size="sm" onClick={loadConfigurations}>Elegir otra publicación</Button>:null}
        {pinned?<p className="text-xs text-muted-foreground">La publicación quedó fijada al recibir evidencia.</p>:null}
        {options?.projectionReady===false?<p role="status" className="text-sm">La publicación requiere materialización administrativa antes de activarse.</p>:null}
        <fieldset className="space-y-1"><legend className="text-sm font-medium">Actuaciones explícitas</legend>{(options?.actuations||[]).map(item=>{const inputId=`${formId}-actuation-${item.id}`;return <label htmlFor={inputId} key={item.id} className="flex gap-2 text-sm"><input id={inputId} name="explicitActuationIds" type="checkbox" checked={acts.includes(item.id)} onChange={event=>setActs(current=>event.target.checked?[...current,item.id]:current.filter(id=>id!==item.id))}/>{item.code} · {item.name}</label>;})}</fieldset>
        {(options?.typologyOptions||[]).filter(item=>item.options.length).map(typology=><fieldset key={typology.typologyCode} className="space-y-1"><legend className="text-sm font-medium">{typology.name||typology.typologyCode}</legend>{typology.options.map(option=>{const inputId=`${formId}-typology-${typology.typologyCode}-${option.id}`;return <label htmlFor={inputId} key={option.id} className="flex gap-2 text-sm"><input id={inputId} type={typology.selectionMode==='single'?'radio':'checkbox'} name={`typology-${typology.typologyCode}`} checked={(selections[typology.typologyCode]||[]).includes(option.id)} onChange={event=>setSelections(current=>({...current,[typology.typologyCode]:typology.selectionMode==='single'?[option.id]:event.target.checked?[...(current[typology.typologyCode]||[]),option.id]:(current[typology.typologyCode]||[]).filter(id=>id!==option.id)}))}/>{option.label}</label>;})}</fieldset>)}
        <label htmlFor={`${formId}-reason`} className="block text-sm">Motivo del cambio documental<input id={`${formId}-reason`} name="reason" className={field} maxLength={1000} required value={reason} onChange={event=>setReason(event.target.value)}/></label>
        {!canonical?<label htmlFor={`${formId}-future-only`} className="flex gap-2 text-sm"><input id={`${formId}-future-only`} name="confirmFutureReceipts" type="checkbox" checked={confirmed} onChange={event=>setConfirmed(event.target.checked)}/>Solo gobernará futuras recepciones; no convertirá documentos históricos.</label>:null}
        {canManage?<div className="flex flex-wrap gap-2">{!canonical?<Button type="submit" disabled={!confirmed||!options?.projectionReady||!governance?.capabilities?.activationReady}>Activar para futuras recepciones</Button>:<><Button type="submit" disabled={!governance||selected!==String(origin.publication.configurationId)}>Guardar selecciones</Button><Button type="button" variant="outline" onClick={()=>execute('refresh')}>Actualizar requisitos</Button>{!pinned&&selected!==String(origin.publication.configurationId)?<Button type="button" disabled={!options?.projectionReady} onClick={()=>execute('configuration')}>Cambiar publicación</Button>:null}</>}</div>:null}
      </fieldset>
    </form>
  </details>;
}
