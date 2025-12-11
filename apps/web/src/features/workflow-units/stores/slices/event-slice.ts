/**
 * Event Slice - Manages workflow event loading and dirty state
 */
import type { StateCreator } from 'zustand';
import type { WorkflowEditorShape, EventSlice } from './types';
import type { WorkflowEvent } from '../../api/types';
import { yamlToReactFlow } from '../../utils/yaml-converter';

export const initialEventState = {
  currentEventId: null as string | null,
  currentEvent: null as WorkflowEvent | null,
  isLoading: false,
  parseError: null as string | null,
  isDirty: false,
};

export const createEventSlice: StateCreator<WorkflowEditorShape, [['zustand/devtools', never]], [], EventSlice> = (
  set,
) => ({
  ...initialEventState,

  setCurrentEventId: (currentEventId) => {
    set({ currentEventId }, undefined, 'event/setCurrentEventId');
  },

  loadEvent: (event: WorkflowEvent) => {
    try {
      set({ isLoading: true, parseError: null }, undefined, 'event/loadStart');

      // Set currentEvent FIRST so error alert can display
      set(
        {
          currentEvent: event,
          currentEventId: event.id,
        },
        undefined,
        'event/setCurrentEvent',
      );

      // Parse YAML and load into canvas
      if (event.yaml && event.yaml !== '{}') {
        const { nodes, edges, wasLegacy } = yamlToReactFlow(event.yaml, {
          eventSourceType: event.eventSourceType,
          eventSourceParams: event.eventSourceParams as unknown as Record<string, unknown>,
        });

        // Log if legacy format was detected
        if (wasLegacy) {
          console.info('[WorkflowEditor] Legacy YAML format detected, converted to new format');
        }

        set(
          {
            nodes,
            edges,
            yamlContent: event.yaml,
            isLoading: false,
            isDirty: wasLegacy, // Mark dirty if converted so user can save new format
            parseError: null,
          },
          undefined,
          'event/loadSuccess',
        );
      } else {
        // Empty event - no workflow steps yet
        set(
          {
            nodes: [],
            edges: [],
            yamlContent: '',
            isLoading: false,
            isDirty: false,
            parseError: null,
          },
          undefined,
          'event/loadEmpty',
        );
      }
    } catch (error) {
      // currentEvent already set, so error alert will display
      set(
        {
          nodes: [],
          edges: [],
          parseError: error instanceof Error ? error.message : 'Failed to parse workflow YAML',
          isLoading: false,
        },
        undefined,
        'event/loadError',
      );
    }
  },

  setIsDirty: (isDirty) => {
    set({ isDirty }, undefined, 'event/setIsDirty');
  },
});
