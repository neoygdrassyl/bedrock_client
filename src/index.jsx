import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
// Mantine's global styles and the Inter @font-face rules stay global: they affect
// every page. Editor-only CSS loads with its lazy chunk instead (jodit-pro in the
// modules that render JoditEditor, @blocknote/mantine in rich-text-editor.jsx);
// it is scoped to editor classes, so loading it after index.css does not change
// the cascade of our own rules.
import '@mantine/core/styles.css';
import '@blocknote/core/fonts/inter.css';
// MDB CSS removed — mdb-react-ui-kit eliminated, using Bootstrap 5 classes directly

import './index.css'; // MUST load after Bootstrap so our tokens/fonts/resets win
import './shared/styles/scrollbar.css'; // Scroll unificado (capa nativa); debe ir tras las libs de terceros
import './shared/utils/dayjs.config'; // dayjs plugins + locale (must load before any component)
import './shared/config/jsons/global-id';
import App from './app/App';
import { purgeLegacyErrorReportStorage } from './app/legacy-storage-cleanup';
import { installGlobalErrorListeners } from './shared/observability/logger';
import { installChunkPreloadHandler } from './shared/components/errors/errorKinds';
import { installBrokenImageFallback } from './shared/observability/imageFallback';

purgeLegacyErrorReportStorage();
installGlobalErrorListeners();
installChunkPreloadHandler();
installBrokenImageFallback();

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <MantineProvider defaultColorScheme="auto">
      <App />
    </MantineProvider>
  </StrictMode>
);
