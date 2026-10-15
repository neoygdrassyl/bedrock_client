import {beforeEach,expect,it,vi} from 'vitest';
import {fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import {DocumentaryGovernance} from './DocumentaryGovernance';
import * as api from '@/app/services/documentaryOperations.service';
vi.mock('@/app/services/documentaryOperations.service',()=>({getDocumentaryGovernance:vi.fn(),activateDocumentaryProject:vi.fn(),changeDocumentaryConfiguration:vi.fn(),returnDocumentaryProjectToLegacy:vi.fn(),refreshDocumentaryRequirements:vi.fn(),getRequirementAdditions:vi.fn(),addRequirementAddition:vi.fn(),removeRequirementAddition:vi.fn()}));
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
const current=()=>screen.findByTestId('governance-current');
const openDialog=async()=>{await current();fireEvent.click(screen.getByRole('button',{name:'Cambiar versión'}));return screen.findByRole('dialog');};
const choose=(dialog,name)=>fireEvent.click(within(dialog).getByRole('radio',{name}));
// Selection no longer waits on a projection readiness check; options are never requested.
beforeEach(()=>{vi.clearAllMocks();api.getRequirementAdditions.mockResolvedValue({additions:[],catalogue:[]});});

it('summarises the version in use and the vigente, and lists every option in the dialog',async()=>{
  api.getDocumentaryGovernance.mockResolvedValue(governance({selected:3}));
  render(<DocumentaryGovernance origin={canonicalOrigin} canManage/>);
  expect(await current()).toHaveTextContent('Publicación 3 · En uso');
  expect(screen.getByText('Vigente: Publicación 4')).toBeInTheDocument();
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  const dialog=await openDialog();
  const labels=within(dialog).getAllByRole('radio').map(radio=>radio.closest('label').textContent);
  expect(labels).toEqual(['Legacy (documentación tradicional)','Publicación 4 · Vigente','Publicación 3 · En uso']);
  expect(within(dialog).getByRole('radio',{name:'Publicación 3 · En uso'})).toBeChecked();
  expect(within(dialog).getByText(/Elija una opción distinta/)).toBeInTheDocument();
});

it('activates a Central configuration for a traditional expediente without manual inputs',async()=>{
  api.getDocumentaryGovernance.mockResolvedValue(governance());api.activateDocumentaryProject.mockResolvedValue({});const saved=vi.fn();
  render(<DocumentaryGovernance origin={{mode:'traditional',project:{fun0Id:1}}} canManage onSaved={saved}/>);
  expect(await current()).toHaveTextContent('Legacy (documentación tradicional) · En uso');
  const dialog=await openDialog();
  choose(dialog,'Publicación 4 · Vigente');
  expect(within(dialog).getByText(/Se activará la Publicación 4/)).toBeInTheDocument();
  fireEvent.change(within(dialog).getByLabelText('Motivo del cambio documental'),{target:{value:'Adopción de Central'}});
  const apply=within(dialog).getByRole('button',{name:'Aplicar configuración'});expect(apply).toBeDisabled();
  fireEvent.click(within(dialog).getByLabelText(/Solo gobernará/));
  await waitFor(()=>expect(apply).toBeEnabled());fireEvent.click(apply);
  await waitFor(()=>expect(api.activateDocumentaryProject).toHaveBeenCalledWith(1,{configurationId:4,expectedChecksum:'c4',expectedInputRevision:0,idempotencyKey:expect.any(String),reason:'Adopción de Central'}));
  expect(saved).toHaveBeenCalledWith(expect.any(String),true);
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

it('changes the configuration between two publications',async()=>{
  api.getDocumentaryGovernance.mockResolvedValue(governance({selected:3,inputRevision:1}));api.changeDocumentaryConfiguration.mockResolvedValue({});
  render(<DocumentaryGovernance origin={canonicalOrigin} canManage/>);
  const dialog=await openDialog();
  choose(dialog,'Publicación 4 · Vigente');
  expect(within(dialog).getByText('El expediente pasará de la Publicación 3 a la Publicación 4.')).toBeInTheDocument();
  fireEvent.change(within(dialog).getByLabelText('Motivo del cambio documental'),{target:{value:'Nueva publicación'}});
  fireEvent.click(within(dialog).getByRole('button',{name:'Aplicar configuración'}));
  await waitFor(()=>expect(api.changeDocumentaryConfiguration).toHaveBeenCalledWith(1,{configurationId:4,expectedChecksum:'c4',expectedInputRevision:1,idempotencyKey:expect.any(String),reason:'Nueva publicación'}));
});

it('returns a Central expediente to legacy before evidence',async()=>{
  api.getDocumentaryGovernance.mockResolvedValue(governance({selected:3,inputRevision:6}));api.returnDocumentaryProjectToLegacy.mockResolvedValue({});
  render(<DocumentaryGovernance origin={canonicalOrigin} canManage/>);
  const dialog=await openDialog();
  choose(dialog,'Legacy (documentación tradicional)');
  expect(within(dialog).getByText(/volverá a la documentación tradicional/)).toBeInTheDocument();
  fireEvent.change(within(dialog).getByLabelText('Motivo del cambio documental'),{target:{value:'Error de radicación'}});
  fireEvent.click(within(dialog).getByRole('button',{name:'Aplicar configuración'}));
  await waitFor(()=>expect(api.returnDocumentaryProjectToLegacy).toHaveBeenCalledWith(1,{expectedInputRevision:6,idempotencyKey:expect.any(String),reason:'Error de radicación'}));
});

it('disables the change and explains why once evidence was received',async()=>{
  api.getDocumentaryGovernance.mockResolvedValue(governance({selected:3,changeAllowed:false,lockedReason:'EVIDENCE_RECEIVED'}));
  render(<DocumentaryGovernance origin={canonicalOrigin} canManage/>);
  await current();
  expect(screen.getByRole('button',{name:'Cambiar versión'})).toBeDisabled();
  expect(screen.getAllByText(/ya tiene evidencia recibida/).length).toBeGreaterThan(0);
  expect(screen.getByRole('button',{name:'Actualizar requisitos'})).toBeEnabled();
});

it('shows the referenced expediente data read-only and refreshes from it',async()=>{
  api.getDocumentaryGovernance.mockResolvedValue(governance({selected:3,inputRevision:2}));api.refreshDocumentaryRequirements.mockResolvedValue({});
  render(<DocumentaryGovernance origin={canonicalOrigin} canManage/>);
  const panel=await screen.findByRole('region',{name:'Datos del expediente usados en la evaluación'});
  expect(within(panel).getByText('Formulario FUN 1 · versión 3 · registro 40')).toBeInTheDocument();
  expect(within(panel).getByText('Tipo de actuación')).toBeInTheDocument();expect(within(panel).getByText('Licencia de Construcción')).toBeInTheDocument();
  expect(within(panel).getByText('Sin dato')).toBeInTheDocument();
  expect(within(panel).getByText(/no se editan aquí/)).toBeInTheDocument();
  expect(within(panel).queryByRole('button',{name:'Corregir datos del FUN'})).not.toBeInTheDocument();
  expect(within(panel).queryByRole('textbox')).not.toBeInTheDocument();expect(within(panel).queryByRole('checkbox')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Actualizar requisitos'}));
  await waitFor(()=>expect(api.refreshDocumentaryRequirements).toHaveBeenCalledWith(1,{expectedInputRevision:2,idempotencyKey:expect.any(String),reason:expect.any(String)}));
});

it('lets users without the manage permission see the selection but not change it',async()=>{
  api.getDocumentaryGovernance.mockResolvedValue(governance({selected:3}));
  render(<DocumentaryGovernance origin={canonicalOrigin}/>);
  await current();
  expect(screen.getByRole('button',{name:'Cambiar versión'})).toBeDisabled();
  expect(screen.getByText(/Solo los roles autorizados/)).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Actualizar requisitos'})).not.toBeInTheDocument();
});

it('shows plain-language diagnostics and a link to correct the FUN',async()=>{
  const fix=vi.fn();
  api.getDocumentaryGovernance.mockResolvedValue({...governance({selected:3}),source:{...source,fields:[{field:'m_lic',value:'A,G'},{field:'usos',value:'Z'}],diagnostics:[{code:'UNRECOGNIZED_VALUE',field:'usos',value:'Z'}]}});
  render(<DocumentaryGovernance origin={canonicalOrigin} canManage onFixFun={fix}/>);
  const panel=await screen.findByRole('region',{name:'Datos del expediente usados en la evaluación'});
  expect(within(panel).getByText('Obra Nueva, Demolición: Total')).toBeInTheDocument();
  expect(within(panel).getByText(/no corresponde a ninguna opción del formulario/)).toBeInTheDocument();
  expect(within(panel).queryByText(/valor no reconocido/)).not.toBeInTheDocument();
  fireEvent.click(within(panel).getByRole('button',{name:'Corregir datos del FUN'}));
  expect(fix).toHaveBeenCalledTimes(1);
});

const addition={documentId:'D-1',documentCode:'511',title:'Plano extra',reason:'Pedido del curador',addedBy:7,addedByName:'Ana Pérez',addedAt:'2026-10-14T15:00:00.000Z'};
const catalogue=[
  {documentId:'D-1',code:'511',name:'Plano extra',alreadyRequired:false},
  {documentId:'D-2',code:'600',name:'Plano de localización',alreadyRequired:false},
  {documentId:'D-3',code:'601',name:'Ya exigido por la configuración',alreadyRequired:true},
];
const additionsSection=()=>screen.findByRole('region',{name:'Documentos agregados al expediente'});

it('lists the documents added to the expediente with motive, author and date',async()=>{
  api.getDocumentaryGovernance.mockResolvedValue(governance({selected:3}));
  api.getRequirementAdditions.mockResolvedValue({additions:[addition],catalogue});
  render(<DocumentaryGovernance origin={canonicalOrigin} canManage/>);
  const section=await additionsSection();
  const item=await within(section).findByTestId('addition-D-1');
  expect(item).toHaveTextContent('511');expect(item).toHaveTextContent('Plano extra');
  expect(item).toHaveTextContent('Motivo: Pedido del curador');expect(item).toHaveTextContent('Agregado por Ana Pérez');expect(item).toHaveTextContent('2026');
  expect(api.getRequirementAdditions).toHaveBeenCalledWith(1,expect.any(AbortSignal));
});

it('hides the additions for legacy expedientes and the add/remove actions without permission',async()=>{
  api.getDocumentaryGovernance.mockResolvedValue(governance());
  const {unmount}=render(<DocumentaryGovernance origin={{mode:'traditional',project:{fun0Id:1}}} canManage/>);
  await current();
  expect(screen.queryByRole('region',{name:'Documentos agregados al expediente'})).not.toBeInTheDocument();
  expect(api.getRequirementAdditions).not.toHaveBeenCalled();
  unmount();
  api.getDocumentaryGovernance.mockResolvedValue(governance({selected:3}));
  api.getRequirementAdditions.mockResolvedValue({additions:[addition],catalogue});
  render(<DocumentaryGovernance origin={canonicalOrigin}/>);
  const section=await additionsSection();
  await within(section).findByTestId('addition-D-1');
  expect(within(section).queryByRole('button',{name:'Agregar documento'})).not.toBeInTheDocument();
  expect(within(section).queryByRole('button',{name:/^Quitar/})).not.toBeInTheDocument();
});

it('adds a catalogue document with a motive, excluding the ones already required, and refreshes the module',async()=>{
  api.getDocumentaryGovernance.mockResolvedValue(governance({selected:3}));
  api.getRequirementAdditions.mockResolvedValue({additions:[addition],catalogue});
  api.addRequirementAddition.mockResolvedValue({});const saved=vi.fn();
  render(<DocumentaryGovernance origin={canonicalOrigin} canManage onSaved={saved}/>);
  const section=await additionsSection();
  await within(section).findByTestId('addition-D-1');
  fireEvent.click(within(section).getByRole('button',{name:'Agregar documento'}));
  const dialog=await screen.findByRole('dialog');
  // Neither the documents the configuration already requires nor the ones already added are offered.
  const options=within(dialog).getAllByRole('option');
  expect(options).toHaveLength(1);expect(options[0]).toHaveTextContent('600');
  const confirm=within(dialog).getByRole('button',{name:'Agregar'});expect(confirm).toBeDisabled();
  fireEvent.click(options[0]);
  fireEvent.change(within(dialog).getByLabelText('Motivo'),{target:{value:'Lo exige el predio'}});
  await waitFor(()=>expect(confirm).toBeEnabled());fireEvent.click(confirm);
  await waitFor(()=>expect(api.addRequirementAddition).toHaveBeenCalledWith(1,{documentId:'D-2',reason:'Lo exige el predio',idempotencyKey:expect.any(String)}));
  expect(saved).toHaveBeenCalledWith('Documento agregado a los requisitos del expediente.',true);
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

it('keeps the add dialog open with the rule message when the document is already added',async()=>{
  api.getDocumentaryGovernance.mockResolvedValue(governance({selected:3}));
  api.getRequirementAdditions.mockResolvedValue({additions:[],catalogue});
  api.addRequirementAddition.mockRejectedValue({response:{status:409,data:{error:{code:'REQUIREMENT_ALREADY_ADDED'}}}});const saved=vi.fn();
  render(<DocumentaryGovernance origin={canonicalOrigin} canManage onSaved={saved}/>);
  const section=await additionsSection();
  await waitFor(()=>expect(within(section).getByRole('button',{name:'Agregar documento'})).toBeEnabled());
  fireEvent.click(within(section).getByRole('button',{name:'Agregar documento'}));
  const dialog=await screen.findByRole('dialog');
  fireEvent.click(within(dialog).getAllByRole('option')[0]);
  fireEvent.change(within(dialog).getByLabelText('Motivo'),{target:{value:'Otro intento'}});
  fireEvent.click(within(dialog).getByRole('button',{name:'Agregar'}));
  expect(await within(dialog).findByText('Este documento ya fue agregado al expediente.')).toBeInTheDocument();
  expect(saved).not.toHaveBeenCalled();
});

it('removes an added document only after confirming with a motive',async()=>{
  api.getDocumentaryGovernance.mockResolvedValue(governance({selected:3}));
  api.getRequirementAdditions.mockResolvedValue({additions:[addition],catalogue});
  api.removeRequirementAddition.mockResolvedValue({});const saved=vi.fn();
  render(<DocumentaryGovernance origin={canonicalOrigin} canManage onSaved={saved}/>);
  const section=await additionsSection();
  fireEvent.click(await within(section).findByRole('button',{name:'Quitar 511 · Plano extra'}));
  const dialog=await screen.findByRole('dialog');
  expect(dialog).toHaveTextContent('Se dejará de exigir «511 · Plano extra» en este expediente.');
  const confirm=within(dialog).getByRole('button',{name:'Quitar'});expect(confirm).toBeDisabled();
  expect(api.removeRequirementAddition).not.toHaveBeenCalled();
  fireEvent.change(within(dialog).getByLabelText('Motivo'),{target:{value:'Ya no aplica'}});
  fireEvent.click(confirm);
  await waitFor(()=>expect(api.removeRequirementAddition).toHaveBeenCalledWith(1,'D-1',{reason:'Ya no aplica',idempotencyKey:expect.any(String)}));
  expect(saved).toHaveBeenCalledWith('Documento quitado de los requisitos del expediente.',true);
});
