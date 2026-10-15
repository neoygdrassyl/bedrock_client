import {beforeEach,expect,it,vi} from 'vitest';
import {fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import {DocumentaryGovernance} from './DocumentaryGovernance';
import * as api from '@/app/services/documentaryOperations.service';
vi.mock('@/app/services/documentaryOperations.service',()=>({getDocumentaryGovernance:vi.fn(),activateDocumentaryProject:vi.fn(),changeDocumentaryConfiguration:vi.fn(),returnDocumentaryProjectToLegacy:vi.fn(),refreshDocumentaryRequirements:vi.fn()}));
vi.mock('@/app/services/documentary.service',()=>({documentaryError:error=>error.message||'Error'}));

const source={table:'fun_1s',selectedFunVersion:3,sourceRowId:40,diagnostics:[],fields:[{field:'tipo',sourceKey:'tipoAny',value:'D',tokens:['D']},{field:'cultural',sourceKey:'culturalAny',value:null,tokens:['UNSET']}]};
function governance({selected=null,changeAllowed=true,lockedReason=null,inputRevision=0}={}){
  return {mode:selected?'canonical':'legacy',inputRevision,capabilities:{activationReady:true},source,selection:{configurationId:selected,changeAllowed,lockedReason,evidenceCount:changeAllowed?0:2,options:[
    {kind:'legacy',configurationId:null,isCurrent:false,selected:selected==null},
    {kind:'central',configurationId:4,releaseVersion:4,sourceReleaseId:'rel-4',checksum:'c4',isCurrent:true,selected:selected===4},
    {kind:'central',configurationId:3,releaseVersion:3,sourceReleaseId:'rel-3',checksum:'c3',isCurrent:false,selected:selected===3},
  ]}};
}
const canonicalOrigin={mode:'canonical',project:{fun0Id:1},publication:{configurationId:3,checksum:'c3'}};
const select=()=>screen.findByLabelText('Configuración que gobierna el expediente');
// Selection no longer waits on a projection readiness check; options are never requested.
beforeEach(()=>{vi.clearAllMocks();});

it('offers legacy and every enabled configuration, marking the vigente and the one in use',async()=>{
  api.getDocumentaryGovernance.mockResolvedValue(governance({selected:3}));
  render(<DocumentaryGovernance origin={canonicalOrigin} canManage/>);
  const control=await select();
  const labels=within(control).getAllByRole('option').map(option=>option.textContent);
  expect(labels).toEqual(['Legacy (documentación tradicional)','Publicación 4 · Vigente','Publicación 3 · En uso']);
  expect(control).toHaveValue('3');
  expect(control).toBeEnabled();
});

it('activates a Central configuration for a traditional expediente without manual inputs',async()=>{
  api.getDocumentaryGovernance.mockResolvedValue(governance());api.activateDocumentaryProject.mockResolvedValue({});const saved=vi.fn();
  render(<DocumentaryGovernance origin={{mode:'traditional',project:{fun0Id:1}}} canManage onSaved={saved}/>);
  const control=await select();expect(control).toHaveValue('legacy');
  fireEvent.change(control,{target:{value:'4'}});
  fireEvent.change(await screen.findByLabelText('Motivo del cambio documental'),{target:{value:'Adopción de Central'}});
  const apply=screen.getByRole('button',{name:'Aplicar configuración'});expect(apply).toBeDisabled();
  fireEvent.click(screen.getByLabelText(/Solo gobernará/));
  await waitFor(()=>expect(apply).toBeEnabled());fireEvent.click(apply);
  await waitFor(()=>expect(api.activateDocumentaryProject).toHaveBeenCalledWith(1,{configurationId:4,expectedChecksum:'c4',expectedInputRevision:0,idempotencyKey:expect.any(String),reason:'Adopción de Central'}));
  expect(saved).toHaveBeenCalledWith(expect.any(String),true);
});

it('returns a Central expediente to legacy before evidence',async()=>{
  api.getDocumentaryGovernance.mockResolvedValue(governance({selected:3,inputRevision:6}));api.returnDocumentaryProjectToLegacy.mockResolvedValue({});
  render(<DocumentaryGovernance origin={canonicalOrigin} canManage/>);
  fireEvent.change(await select(),{target:{value:'legacy'}});
  expect(screen.getByText(/volverá a la documentación tradicional/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Motivo del cambio documental'),{target:{value:'Error de radicación'}});
  fireEvent.click(screen.getByRole('button',{name:'Aplicar configuración'}));
  await waitFor(()=>expect(api.returnDocumentaryProjectToLegacy).toHaveBeenCalledWith(1,{expectedInputRevision:6,idempotencyKey:expect.any(String),reason:'Error de radicación'}));
});

it('is read-only and explains why once evidence was received',async()=>{
  api.getDocumentaryGovernance.mockResolvedValue(governance({selected:3,changeAllowed:false,lockedReason:'EVIDENCE_RECEIVED'}));
  render(<DocumentaryGovernance origin={canonicalOrigin} canManage/>);
  expect(await select()).toBeDisabled();
  expect(screen.getByText(/ya tiene evidencia recibida/)).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Aplicar configuración'})).not.toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Actualizar requisitos'})).toBeEnabled();
});

it('shows the referenced expediente data read-only and refreshes from it',async()=>{
  api.getDocumentaryGovernance.mockResolvedValue(governance({selected:3,inputRevision:2}));api.refreshDocumentaryRequirements.mockResolvedValue({});
  render(<DocumentaryGovernance origin={canonicalOrigin} canManage/>);
  const panel=await screen.findByRole('region',{name:'Datos del expediente usados en la evaluación'});
  expect(within(panel).getByText('Formulario FUN 1 · versión 3 · registro 40')).toBeInTheDocument();
  expect(within(panel).getByText('Tipo de actuación')).toBeInTheDocument();expect(within(panel).getByText('D')).toBeInTheDocument();
  expect(within(panel).getByText('Sin dato')).toBeInTheDocument();
  expect(within(panel).getByText(/Corrija el FUN/)).toBeInTheDocument();
  expect(within(panel).queryByRole('textbox')).not.toBeInTheDocument();expect(within(panel).queryByRole('checkbox')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Actualizar requisitos'}));
  await waitFor(()=>expect(api.refreshDocumentaryRequirements).toHaveBeenCalledWith(1,{expectedInputRevision:2,idempotencyKey:expect.any(String),reason:expect.any(String)}));
});

it('lets users without the manage permission see the selection but not change it',async()=>{
  api.getDocumentaryGovernance.mockResolvedValue(governance({selected:3}));
  render(<DocumentaryGovernance origin={canonicalOrigin}/>);
  expect(await select()).toBeDisabled();
  expect(screen.queryByRole('button',{name:'Actualizar requisitos'})).not.toBeInTheDocument();
});
