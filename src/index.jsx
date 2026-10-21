import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'jodit-pro/es2021/jodit.fat.min.css';
import '@mantine/core/styles.css';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
// MDB CSS removed — mdb-react-ui-kit eliminated, using Bootstrap 5 classes directly

import './index.css'; // MUST load after Bootstrap so our tokens/fonts/resets win
import './styles/scrollbar.css'; // Scroll unificado (capa nativa); debe ir tras las libs de terceros
import './app/utils/dayjs.config'; // dayjs plugins + locale (must load before any component)
import App from './app/App';

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <MantineProvider defaultColorScheme="auto">
      <App />
    </MantineProvider>
  </StrictMode>
);
