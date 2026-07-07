import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { ThemeProvider } from '@/common/theme/ThemeProvider';
import { AuthProvider } from '@/common/auth/AuthContext';
import { queryClient } from '@/common/query/queryClient';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="system" storageKey="trash_here_theme">
          <AuthProvider>
            <App />
            <Toaster position="top-right" richColors closeButton />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
