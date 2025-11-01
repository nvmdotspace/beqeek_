/**
 * useGanttZoom Hook
 *
 * Manages zoom level state for Gantt chart
 */

import { useState, useCallback } from 'react';
import type { ZoomLevel } from './gantt-props.js';
import { getNextZoomLevel, getPreviousZoomLevel } from './gantt-utils.js';

/**
 * Hook for managing Gantt chart zoom level
 */
export function useGanttZoom(initialZoom: ZoomLevel = 'week') {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(initialZoom);

  const zoomIn = useCallback(() => {
    setZoomLevel((current) => getPreviousZoomLevel(current));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((current) => getNextZoomLevel(current));
  }, []);

  const canZoomIn = zoomLevel !== 'day';
  const canZoomOut = zoomLevel !== 'year';

  return {
    zoomLevel,
    setZoomLevel,
    zoomIn,
    zoomOut,
    canZoomIn,
    canZoomOut,
  };
}
