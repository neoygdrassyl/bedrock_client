import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './app/App';

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'mdb-react-ui-kit/dist/css/mdb.min.css'

//import reportWebVitals from './reportWebVitals';

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

//reportWebVitals();
