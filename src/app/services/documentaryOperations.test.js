import { expect, it, vi } from 'vitest';
import { validateDocumentaryView } from '../pages/user/expediente_documental/documentaryViewContract';
import * as api from './documentaryOperations.service';
import http from '../../http-common';
vi.mock('../../http-common',()=>({default:{get:vi.fn(),put:vi.fn(),post:vi.fn(),patch:vi.fn(),delete:vi.fn()}}));
const checksum='a'.repeat(64), key='11111111-1111-4111-8111-111111111111';
const documentId='c-doc-1';
const receipt={id:10,fun0Id:1,configurationId:2,documentClass:'requirement',documentId,listTitle:'Lista A',versionCount:1,documentKey:key,versionSequence:1,rowVersion:1,evidenceRevision:1,hasPhysical:true,hasDigital:false,hasScan:false,files:{digital:null,scan:null}};
function view(){return {schemaVersion:'dovela-backoffice/documentary-view/v1',mode:'canonical',readOnly:false,context:null,project:{fun0Id:1,idPublic:'FUN'},configuration:{id:2,tenantCode:'fixture',sourceReleaseId:'release',releaseVersion:1,schemaVersion:'dovela-central/c-5',checksum,selection:'pinned'},capabilities:{createDocument:true,receivePhysical:true,receiveDigital:true,review:true},requirements:{documents:[],requirementGroups:[],typologyOptions:[],warnings:[]},governance:{inputRevision:1,cacheState:'current',evaluationStatus:'complete'},rows:[{rowKey:'canonical:'+key,persistence:'canonical',documentKey:key,projectDocumentId:null,documentClass:'requirement',documentId,listTitle:'Lista A',versionSequence:1,versionCount:1,currentVersionId:10,receivedDocumentRowId:10,receipt,controls:[],catalogueDisplay:{code:'D1',name:'Document'},sources:[],versions:[]}],submits:[],warnings:[],pagination:{limit:25,afterId:0,nextAfterId:null},counts:{visibleRows:1}};}
it('validates canonical identity without relaxing the preview branch or accepting storage authority',()=>{
  expect(validateDocumentaryView(view()).mode).toBe('canonical');
  const forged=view();forged.rows[0].projectDocumentId=99;expect(()=>validateDocumentaryView(forged)).toThrow();
  const file=view();file.rows[0].receipt={...receipt,files:{digital:{storageKey:'private'},scan:null}};expect(()=>validateDocumentaryView(file)).toThrow();
  const numericId=view();numericId.rows[0].documentId=3;numericId.rows[0].receipt={...receipt,documentId:3};expect(()=>validateDocumentaryView(numericId)).toThrow();
});
it('accepts annex rows without a Central document id but rejects requirement rows without one',()=>{
  const annex=view();const annexReceipt={...receipt,documentClass:'annex',documentId:null,listTitle:'Anexos VR-2'};
  Object.assign(annex.rows[0],{documentClass:'annex',documentId:null,listTitle:'Anexos VR-2',receipt:annexReceipt});
  expect(validateDocumentaryView(annex).rows[0].documentClass).toBe('annex');
  const missing=view();missing.rows[0].documentId=null;missing.rows[0].receipt={...receipt,documentId:null};expect(()=>validateDocumentaryView(missing)).toThrow();
  const mismatch=view();mismatch.rows[0].receipt={...receipt,documentClass:'annex'};expect(()=>validateDocumentaryView(mismatch)).toThrow();
});
it('PATCH evidence keeps the row route and multipart command; history arrays become bounded cursor pages',async()=>{
  http.patch.mockResolvedValue({data:{row:receipt}});
  const command={expectedRowVersion:1,expectedEvidenceRevision:1,sameContent:true,idempotencyKey:'one',reason:'Scan'};
  await api.updateCanonicalEvidence(1,10,command,null,new File(['scan'],'scan.pdf',{type:'application/pdf'}));
  expect(http.patch.mock.calls[0][0]).toBe('/fun/documentary/v1/projects/1/documents/10/evidence');
  expect(JSON.parse(http.patch.mock.calls[0][1].get('command'))).toEqual(command);
  http.get.mockResolvedValue({data:[{id:7,fun0Id:1,eventType:'received',beforeJson:null,afterJson:{}}]});
  expect((await api.getCanonicalHistory(1,0,1)).nextAfterId).toBe(7);
});
it('captures the edit-time root revision rather than fetching a fresh revision just before overwriting',()=>{
  const form=new FormData();api.appendDocumentarySourceCommand(form,{centralReleaseId:'release-1',documentaryRevision:4});
  expect(form.get('documentaryExpectedInputRevision')).toBe('4');expect(form.get('documentaryCommandKey')).toBeTruthy();
  const traditional=new FormData();api.appendDocumentarySourceCommand(traditional,{centralReleaseId:null});expect(traditional.has('documentaryExpectedInputRevision')).toBe(false);
  expect(()=>api.appendDocumentarySourceCommand(new FormData(),{centralReleaseId:'release-1',documentaryRevision:null})).toThrow(/Recargue/);
});
it('selects exact canonical FUN versions even when a larger future version precedes them',()=>{
  const rows=[{version:1},{version:99},{version:2},{version:3}];
  expect(api.documentaryVersionIndex({centralReleaseId:'release-1'},rows,3)).toBe(3);
  expect(api.documentaryVersionIndex({centralReleaseId:null},rows,3)).toBe(2);
  expect(api.documentaryVersionIndex({centralReleaseId:'release-1'},[{version:1},{version:1}],1)).toBe(-1);
});
it('recovers source conflicts by reloading and requiring confirmation, never retrying the write',async()=>{
  const formData=new FormData();formData.set('documentaryCommandKey','stale-command');
  const reload=vi.fn().mockResolvedValue({}),notify=vi.fn();
  expect(await api.recoverDocumentarySourceConflict({response:{status:409}},{root:{id:1,centralReleaseId:'release-1'},formData,reload,notify})).toBe(true);
  expect(reload).toHaveBeenCalledExactlyOnceWith(1);expect(formData.has('documentaryCommandKey')).toBe(false);
  expect(notify).toHaveBeenCalledWith(expect.objectContaining({text:expect.stringMatching(/confirme nuevamente/i)}));
  expect(await api.recoverDocumentarySourceConflict(new Error('Network'),{root:{id:1,centralReleaseId:'release-1'},formData,reload,notify})).toBe(false);
  expect(reload).toHaveBeenCalledTimes(1);
});
it('reads the documentary inventory and rejects responses of another expediente or shape',async()=>{
  const inventory={schemaVersion:'dovela-backoffice/documentary-inventory/v1',mode:'canonical',applicable:true,project:{fun0Id:1,idPublic:'FUN'},
    items:[{id:3,documentKey:key,documentClass:'requirement',documentCode:'511',documentId,title:'Formulario',listKey:'list_61',listTitle:'Lista',versionSequence:1,versionCount:1,isCurrent:true,submitId:10,vrLabel:'VR-10',registeredAt:'2026-10-01T00:00:00.000Z',registeredBy:7,hasPhysical:true,pagesPhysical:2,pagesDigital:null,hasDigital:false,hasScan:false,contributor:null,channel:'counter'}],
    requirements:[{documentCode:'511',documentId,title:'Formulario',required:true,standaloneRequired:true,groupCode:null,status:'present',satisfiedBy:{submitId:10,vrLabel:'VR-10',registeredAt:'2026-10-01T00:00:00.000Z'}}],
    evaluation:{state:'current',evaluatedAt:null}};
  http.get.mockResolvedValue({data:inventory});
  expect((await api.getDocumentaryInventory(1)).items).toHaveLength(1);
  expect(http.get.mock.calls.at(-1)[0]).toBe('/fun/documentary/v1/projects/1/inventory');
  await expect(api.getDocumentaryInventory(2)).rejects.toThrow();
  http.get.mockResolvedValue({data:{...inventory,requirements:[{...inventory.requirements[0],status:'done'}]}});
  await expect(api.getDocumentaryInventory(1)).rejects.toThrow();
  http.get.mockResolvedValue({data:{...inventory,mode:'traditional',applicable:false,items:[],requirements:[],evaluation:{state:'not_applicable',evaluatedAt:null}}});
  expect((await api.getDocumentaryInventory(1)).mode).toBe('traditional');
});

it('downloads migrated legacy files through the legacy-migration route and native files through the documents route', () => {
  const legacy = api.canonicalFileRequest(1640, 77, 'scan', { downloadUrl: '/api/fun/documentary/v1/projects/1640/legacy-migration/files/77/scan', evidenceRevision: 1 });
  expect(legacy).toEqual({ url: '/fun/documentary/v1/projects/1640/legacy-migration/files/77/scan', params: {} });
  // A downloadUrl for another row or project is never trusted.
  const foreign = api.canonicalFileRequest(1640, 77, 'scan', { downloadUrl: '/api/fun/documentary/v1/projects/1640/legacy-migration/files/78/scan', evidenceRevision: 2 });
  expect(foreign.url).toBe('/fun/documentary/v1/projects/1640/documents/77/files/scan');
  expect(foreign.params).toEqual({ evidenceRevision: 2 });
  const native = api.canonicalFileRequest(1, 21, 'digital', { downloadUrl: '/api/fun/documentary/v1/projects/1/documents/21/files/digital?evidenceRevision=1', evidenceRevision: 1 });
  expect(native).toEqual({ url: '/fun/documentary/v1/projects/1/documents/21/files/digital', params: { evidenceRevision: 1 } });
});

const evaluationView=(evaluation)=>{const value=view();value.rows[0].evaluation=evaluation;return value;};
it('validates the per-delivery evaluation of view rows leniently',()=>{
  expect(validateDocumentaryView(view()).rows[0].evaluation).toBeUndefined(); // older backends
  const approved={status:'approved',source:'review',verdict:'complies',reviewRevision:2,observation:null,folioRange:'1-3',reviewedBy:4,reviewedByName:'Marta Ruiz',reviewedAt:'2026-10-14T15:00:00.000Z'};
  expect(validateDocumentaryView(evaluationView(approved)).rows[0].evaluation.status).toBe('approved');
  expect(validateDocumentaryView(evaluationView({status:'not_applicable',source:null})).rows[0].evaluation.source).toBeNull();
  expect(()=>validateDocumentaryView(evaluationView({status:'done'}))).toThrow();
  expect(()=>validateDocumentaryView(evaluationView({status:'approved',source:'magic'}))).toThrow();
  expect(()=>validateDocumentaryView(evaluationView('approved'))).toThrow();
});
it('requests the view with the scope and class filters only when they are given',async()=>{
  const origin={project:{fun0Id:1},publication:{configurationId:2,checksum}};
  http.get.mockResolvedValue({data:view()});
  await api.getCanonicalDocuments(origin,0);
  expect(http.get.mock.calls.at(-1)[1].params).toEqual({afterId:0,limit:25});
  await api.getCanonicalDocuments(origin,25,undefined,{scope:'input',documentClass:'requirement'});
  expect(http.get.mock.calls.at(-1)[0]).toBe('/fun/documentary/v1/projects/1/view');
  expect(http.get.mock.calls.at(-1)[1].params).toEqual({afterId:25,limit:25,scope:'input',documentClass:'requirement'});
  await api.getCanonicalDocuments(origin,0,undefined,{scope:'issued'});
  expect(http.get.mock.calls.at(-1)[1].params).toEqual({afterId:0,limit:25,scope:'issued'});
});
it('validates the evaluation of the version rows',async()=>{
  const row={...receipt,evaluation:{status:'pending',source:'review',reviewRevision:0}};
  http.get.mockResolvedValue({data:{schemaVersion:'dovela-backoffice/documentary-versions/v1',documentKey:key,rows:[row],nextAfterId:null}});
  const page=await api.getCanonicalVersions(1,{receivedDocumentRowId:10,documentKey:key});
  expect(page.rows[0].evaluation.status).toBe('pending');
  http.get.mockResolvedValue({data:{schemaVersion:'dovela-backoffice/documentary-versions/v1',documentKey:key,rows:[{...receipt,evaluation:{status:'weird'}}],nextAfterId:null}});
  await expect(api.getCanonicalVersions(1,{receivedDocumentRowId:10,documentKey:key})).rejects.toThrow();
});
it('PUTs the reviewer verdict of one delivery row as a JSON command and rejects invalid verdicts before sending',async()=>{
  http.put.mockResolvedValue({data:{unchanged:false,review:{},evaluation:{status:'approved'}}});
  const command={verdict:'complies',folioRange:'1-3',observation:null,expectedReviewRevision:0,idempotencyKey:'k',reason:'Revisión'};
  await expect(api.saveCanonicalReview(1,21,command)).resolves.toMatchObject({unchanged:false});
  expect(http.put.mock.calls.at(-1)[0]).toBe('/fun/documentary/v1/projects/1/documents/21/review');
  expect(http.put.mock.calls.at(-1)[1]).toEqual(command);
  expect(http.put.mock.calls.at(-1)[2].headers['Content-Type']).toBe('application/json');
  http.put.mockClear();
  await expect(api.saveCanonicalReview(1,21,{...command,verdict:'pending'})).rejects.toThrow(/veredicto/);
  await expect(api.saveCanonicalReview(1,'x',command)).rejects.toThrow();
  expect(http.put).not.toHaveBeenCalled();
});
it('reads, adds and removes requirement additions with JSON commands',async()=>{
  http.get.mockResolvedValue({data:{additions:[{documentId:'D-1',documentCode:'511',title:'Plano',reason:'x',addedBy:1,addedByName:'Ana',addedAt:'2026-10-14T15:00:00.000Z'}],catalogue:[{documentId:'D-2',code:'600',name:'Otro',alreadyRequired:false}]}});
  const data=await api.getRequirementAdditions(1);
  expect(http.get.mock.calls.at(-1)[0]).toBe('/fun/documentary/v1/projects/1/requirements/additions');
  expect(data.additions).toHaveLength(1);
  http.get.mockResolvedValue({data:{additions:null,catalogue:[]}});
  await expect(api.getRequirementAdditions(1)).rejects.toThrow();
  http.post.mockResolvedValue({data:{ok:true}});
  const add={documentId:'D-2',reason:'Lo exige el predio',idempotencyKey:'k'};
  await api.addRequirementAddition(1,add);
  expect(http.post.mock.calls.at(-1)[0]).toBe('/fun/documentary/v1/projects/1/requirements/additions');
  expect(http.post.mock.calls.at(-1)[1]).toEqual(add);
  expect(http.post.mock.calls.at(-1)[2].headers['Content-Type']).toBe('application/json');
  http.delete.mockResolvedValue({data:{ok:true}});
  const remove={reason:'Ya no aplica',idempotencyKey:'k2'};
  await api.removeRequirementAddition(1,'D 1/2',remove);
  expect(http.delete.mock.calls.at(-1)[0]).toBe('/fun/documentary/v1/projects/1/requirements/additions/D%201%2F2');
  expect(http.delete.mock.calls.at(-1)[1]).toEqual({data:remove,headers:{'Content-Type':'application/json'}});
  await expect(api.removeRequirementAddition(1,'x'.repeat(37),remove)).rejects.toThrow();
});
