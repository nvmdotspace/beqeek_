import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';

import '@workspace/ui/globals.css';
import '@workspace/active-tables-core/lexical-styles.css';
import '@workspace/comments/styles';

import { routeTree } from './routeTree.gen';
import { AppProviders } from '@/providers/app-providers';

// Create router instance
const router = createRouter({ routeTree });

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const bootstrap = () => {
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

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </React.StrictMode>,
  );
};

bootstrap();
