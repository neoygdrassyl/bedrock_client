import { expect, it, vi } from 'vitest';
import { validateDocumentaryView } from '../pages/user/expediente_documental/documentaryViewContract';
import * as api from './documentaryOperations.service';
import http from '../../http-common';
vi.mock('../../http-common',()=>({default:{get:vi.fn(),put:vi.fn(),post:vi.fn(),patch:vi.fn()}}));
const checksum='a'.repeat(64), key='11111111-1111-4111-8111-111111111111';
const receipt={id:10,fun0Id:1,configurationId:2,catalogueId:3,documentKey:key,versionSequence:1,rowVersion:1,evidenceRevision:1,hasPhysical:true,hasDigital:false,hasScan:false,files:{digital:null,scan:null}};
function view(){return {schemaVersion:'dovela-backoffice/documentary-view/v1',mode:'canonical',readOnly:false,context:null,project:{fun0Id:1,idPublic:'FUN'},configuration:{id:2,tenantCode:'fixture',sourceReleaseId:'release',releaseVersion:1,schemaVersion:'dovela-central/c-5',checksum,selection:'pinned'},capabilities:{createDocument:true,receivePhysical:true,receiveDigital:true,review:true},requirements:{documents:[],requirementGroups:[],typologyOptions:[],warnings:[]},governance:{inputRevision:1,cacheState:'current',evaluationStatus:'complete'},rows:[{rowKey:'canonical:'+key,persistence:'canonical',documentKey:key,projectDocumentId:null,catalogueId:3,currentVersionId:10,receivedDocumentRowId:10,receipt,controls:[],catalogueDisplay:{code:'D1',name:'Document'},sources:[],versions:[]}],submits:[],warnings:[],pagination:{limit:25,afterId:0,nextAfterId:null},counts:{visibleRows:1}};}
it('validates canonical identity without relaxing the preview branch or accepting storage authority',()=>{
  expect(validateDocumentaryView(view()).mode).toBe('canonical');
  const forged=view();forged.rows[0].projectDocumentId=99;expect(()=>validateDocumentaryView(forged)).toThrow();
  const file=view();file.rows[0].receipt={...receipt,files:{digital:{storageKey:'private'},scan:null}};expect(()=>validateDocumentaryView(file)).toThrow();
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
  const form=new FormData();api.appendDocumentarySourceCommand(form,{documentConfigurationId:2,documentaryInputRevision:4});
  expect(form.get('documentaryExpectedInputRevision')).toBe('4');expect(form.get('documentaryCommandKey')).toBeTruthy();
  const traditional=new FormData();api.appendDocumentarySourceCommand(traditional,{documentConfigurationId:null});expect(traditional.has('documentaryExpectedInputRevision')).toBe(false);
});
it('selects exact canonical FUN versions even when a larger future version precedes them',()=>{
  const rows=[{version:1},{version:99},{version:2},{version:3}];
  expect(api.documentaryVersionIndex({documentConfigurationId:2},rows,3)).toBe(3);
  expect(api.documentaryVersionIndex({documentConfigurationId:null},rows,3)).toBe(2);
  expect(api.documentaryVersionIndex({documentConfigurationId:2},[{version:1},{version:1}],1)).toBe(-1);
});
it('recovers source conflicts by reloading and requiring confirmation, never retrying the write',async()=>{
  const formData=new FormData();formData.set('documentaryCommandKey','stale-command');
  const reload=vi.fn().mockResolvedValue({}),notify=vi.fn();
  expect(await api.recoverDocumentarySourceConflict({response:{status:409}},{root:{id:1,documentConfigurationId:2},formData,reload,notify})).toBe(true);
  expect(reload).toHaveBeenCalledExactlyOnceWith(1);expect(formData.has('documentaryCommandKey')).toBe(false);
  expect(notify).toHaveBeenCalledWith(expect.objectContaining({text:expect.stringMatching(/confirme nuevamente/i)}));
  expect(await api.recoverDocumentarySourceConflict(new Error('Network'),{root:{id:1,documentConfigurationId:2},formData,reload,notify})).toBe(false);
  expect(reload).toHaveBeenCalledTimes(1);
});
