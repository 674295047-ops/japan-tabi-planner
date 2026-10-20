import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { DestinationProvider } from './context/DestinationContext';
import './index.css';
import App from './App.tsx';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '293184247193-i396je507fng7btdqq2vkvgupjg98ppv.apps.googleusercontent.com';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <DestinationProvider>
          <App />
        </DestinationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
