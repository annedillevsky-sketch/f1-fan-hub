import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ApiSportsProvider } from './context/ApiSportsContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ApiSportsProvider>
        <App />
      </ApiSportsProvider>
    </AuthProvider>
  </StrictMode>,
);

