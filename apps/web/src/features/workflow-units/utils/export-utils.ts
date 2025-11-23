/**
 * Export Utilities
 *
 * Utilities for exporting workflow canvas to PNG/SVG formats
 * using html-to-image library.
 */

import { toPng, toSvg } from 'html-to-image';

interface ExportOptions {
  fileName?: string;
  pixelRatio?: number;
  backgroundColor?: string;
  quality?: number;
}

const DEFAULT_OPTIONS: Required<ExportOptions> = {
  fileName: 'workflow',
  pixelRatio: 2, // Retina quality
  backgroundColor: '#ffffff',
  quality: 1.0,
};

/**
 * Exports workflow canvas to PNG format
 *
 * @param elementId - ID of the React Flow wrapper element
 * @param options - Export configuration options
 * @returns Promise that resolves when export is complete
 */
export async function exportWorkflowToPng(
  elementId: string = 'workflow-canvas',
  options: ExportOptions = {},
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Find the React Flow wrapper element
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  try {
    // Hide UI chrome (controls, minimap, panels) during export
    const viewportElement = element.querySelector('.react-flow__viewport');
    if (!viewportElement) {
      throw new Error('React Flow viewport not found');
    }

    // Generate PNG data URL
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: opts.pixelRatio,
      backgroundColor: opts.backgroundColor,
      quality: opts.quality,
      filter: (node) => {
        // Filter out UI chrome elements
        if (node instanceof HTMLElement) {
          // Keep only the viewport (nodes and edges)
          const classList = node.classList;
          if (
            classList.contains('react-flow__controls') ||
            classList.contains('react-flow__minimap') ||
            classList.contains('react-flow__panel') ||
            classList.contains('react-flow__attribution')
          ) {
            return false;
          }
        }
        return true;
      },
    });

    // Download the image
    downloadImage(dataUrl, `${opts.fileName}.png`);
  } catch (error) {
    console.error('Failed to export workflow to PNG:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to export workflow');
  }
}

/**
 * Exports workflow canvas to SVG format
 *
 * @param elementId - ID of the React Flow wrapper element
 * @param options - Export configuration options
 * @returns Promise that resolves when export is complete
 */
export async function exportWorkflowToSvg(
  elementId: string = 'workflow-canvas',
  options: ExportOptions = {},
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  try {
    const dataUrl = await toSvg(element, {
      cacheBust: true,
      backgroundColor: opts.backgroundColor,
      filter: (node) => {
        if (node instanceof HTMLElement) {
          const classList = node.classList;
          if (
            classList.contains('react-flow__controls') ||
            classList.contains('react-flow__minimap') ||
            classList.contains('react-flow__panel') ||
            classList.contains('react-flow__attribution')
          ) {
            return false;
          }
        }
        return true;
      },
    });

    downloadImage(dataUrl, `${opts.fileName}.svg`);
  } catch (error) {
    console.error('Failed to export workflow to SVG:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to export workflow');
  }
}

/**
 * Downloads image data URL as a file
 *
 * @param dataUrl - Image data URL
 * @param fileName - Name of the downloaded file
 */
function downloadImage(dataUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}

/**
 * Gets workflow canvas element for export
 *
 * @returns Canvas element or null if not found
 */
export function getWorkflowCanvasElement(): HTMLElement | null {
  return document.getElementById('workflow-canvas');
}

/**
 * Validates if workflow canvas is ready for export
 *
 * @returns True if canvas is ready, false otherwise
 */
export function isCanvasReadyForExport(): boolean {
  const element = getWorkflowCanvasElement();
  if (!element) return false;

  const viewport = element.querySelector('.react-flow__viewport');
  return !!viewport;
}
