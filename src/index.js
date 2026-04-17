import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import './app/utils/dayjs.config'; // dayjs plugins + locale (must load before any component)
import './app/components/jsons/global-id';
import App from './app/App';

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
// MDB CSS removed — mdb-react-ui-kit eliminated, using Bootstrap 5 classes directly
// import 'mdb-react-ui-kit/dist/css/mdb.min.css'

//import reportWebVitals from './reportWebVitals';

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

//reportWebVitals();
