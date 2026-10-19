import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Self-hosted fonts. Each file carries unicode-range, so Latin pages never download Arabic glyphs and vice versa.
import '@fontsource-variable/ibm-plex-sans';          // "IBM Plex Sans Variable" 100–700
import '@fontsource/ibm-plex-sans-arabic/400.css';    // "IBM Plex Sans Arabic"
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource-variable/readex-pro';             // "Readex Pro Variable" 160–700, Latin + Arabic
import './index.css';

import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);