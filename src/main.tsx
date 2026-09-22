import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { OpenF1Provider } from './context/OpenF1Context';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <OpenF1Provider>
        <App />
      </OpenF1Provider>
    </AuthProvider>
  </StrictMode>,
);

