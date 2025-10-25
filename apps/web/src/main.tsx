import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';

import '@workspace/ui/globals.css';

import { router } from './router';

const enableMockingWithReady = async (timeoutMs = 1500) => {
  const mode = import.meta.env.VITE_API_MODE ?? 'mock';
  console.log('API Mode:', mode, 'DEV:', import.meta.env.DEV);

  if (mode !== 'mock') {
    return;
  }

  const w = window as any;

  // Avoid starting MSW multiple times across HMR/reloads
  if (w.__msw_worker_started) {
    console.log('MSW worker already started, skipping re-init');
    return;
  }

  try {
    const { worker } = await import('./mocks/browser');

    // Keep a reference globally to guard against duplicate starts
    w.__msw_worker = worker;

    // Start MSW and wait up to timeoutMs to reduce race on initial fetches
    console.log('Starting MSW worker...');
    const startPromise = worker
      .start({ onUnhandledRequest: 'warn' })
      .then(() => {
        w.__msw_worker_started = true;
        console.log('MSW worker started successfully!');
      })
      .catch((error: unknown) => {
        console.error('Failed to start MSW worker:', error);
        w.__msw_worker_started = false;
      });

    // Gate readiness with a timeout so we don’t hang indefinitely
    await Promise.race([
      startPromise,
      new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
    ]);

    // Ensure we stop worker on HMR dispose to avoid duplicates
    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        try {
          w.__msw_worker?.stop();
        } catch {}
        w.__msw_worker_started = false;
      });
    }
  } catch (error) {
    console.error('MSW init failed:', error);
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

  // Wait briefly for MSW readiness in mock mode to avoid initial race
  await enableMockingWithReady(1500);

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
};

void bootstrap();
