import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app'; 
import { Providers } from '../../providers/providers';

// Register widget in YouTrack
const host = await YTApp.register();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers host={host}>
      <App/>
    </Providers>
  </React.StrictMode>
);