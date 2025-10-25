import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';

import '@workspace/ui/globals.css';

import { router } from './router';

const enableMocking = async () => {
  const mode = import.meta.env.VITE_API_MODE ?? 'mock';
  console.log('API Mode:', mode, 'DEV:', import.meta.env.DEV);

  if (mode === 'mock') {
    const { worker } = await import('./mocks/browser');
    console.log('Starting MSW worker...');

    try {
      await worker.start({
        onUnhandledRequest: 'warn',
      });
      console.log('MSW worker started successfully!');
    } catch (error) {
      console.error('Failed to start MSW worker:', error);
    }
  }
};

const bootstrap = async () => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Failed to find the root element');
  }

  document.documentElement.style.setProperty(
    '--font-geist-sans',
    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  );
  document.documentElement.style.setProperty(
    '--font-geist-mono',
    "Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  );

  await enableMocking();

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
};

void bootstrap();
