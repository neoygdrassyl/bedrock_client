import { setupServer } from 'msw/node';

import { buildSubmitHandlers } from './handlers/submit.handlers';
import { buildFunHandlers } from './handlers/fun.handlers';
import { buildRecordsHandlers } from './handlers/records.handlers';
import { buildExpeditionHandlers } from './handlers/expedition.handlers';
import { buildPqrsHandlers } from './handlers/pqrs.handlers';

function createInitialStore() {
  return {
    submitEntries: [],
    funRecords: [],
    clocks: [],
    records: {
      law: [],
      arc: [],
      eng: [],
    },
    expeditions: [],
    expeditionAreas: [],
    pqrs: {
      items: [],
    },
  };
}

export const workflowStore = createInitialStore();

export function resetWorkflowDb() {
  Object.assign(workflowStore, createInitialStore());
}

export const handlers = [
  ...buildSubmitHandlers(workflowStore),
  ...buildFunHandlers(workflowStore),
  ...buildRecordsHandlers(workflowStore),
  ...buildExpeditionHandlers(workflowStore),
  ...buildPqrsHandlers(workflowStore),
];

export const server = setupServer(...handlers);
