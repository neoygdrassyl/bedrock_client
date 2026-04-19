import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
// MDB CSS removed — mdb-react-ui-kit eliminated, using Bootstrap 5 classes directly

import './index.css'; // MUST load after Bootstrap so our tokens/fonts/resets win
import './app/utils/dayjs.config'; // dayjs plugins + locale (must load before any component)
import './app/components/jsons/global-id';
import App from './app/App';

//import reportWebVitals from './reportWebVitals';

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

//reportWebVitals();
