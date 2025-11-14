/**
 * Form Builder Store
 *
 * Zustand store for managing form builder state.
 * Handles fields array, editing state, and field operations.
 */

import { create } from 'zustand';

import type { Field, FormConfig } from '../types';

interface FormBuilderState {
  // Form configuration
  title: string;
  submitButtonText: string;
  fields: Field[];

  // UI state
  editingFieldIndex: number | null;

  // Actions
  setTitle: (title: string) => void;
  setSubmitButtonText: (text: string) => void;
  setFields: (fields: Field[]) => void;
  setConfig: (config: FormConfig) => void;
  addField: (field: Field) => void;
  updateField: (index: number, field: Field) => void;
  removeField: (index: number) => void;
  reorderFields: (startIndex: number, endIndex: number) => void;
  setEditingFieldIndex: (index: number | null) => void;
  reset: () => void;
}

export const useFormBuilderStore = create<FormBuilderState>((set) => ({
  // Initial state
  title: '',
  submitButtonText: 'Gửi',
  fields: [],
  editingFieldIndex: null,

  // Actions
  setTitle: (title) => set({ title }),
  setSubmitButtonText: (text) => set({ submitButtonText: text }),
  setFields: (fields) => set({ fields }),
  setConfig: (config) =>
    set({
      title: config.title || '',
      submitButtonText: config.submitButton?.text || 'Gửi',
      fields: config.fields || [],
    }),
  addField: (field) =>
    set((state) => ({
      fields: [...state.fields, field],
    })),
  updateField: (index, field) =>
    set((state) => ({
      fields: state.fields.map((f, i) => (i === index ? field : f)),
    })),
  removeField: (index) =>
    set((state) => ({
      fields: state.fields.filter((_, i) => i !== index),
      editingFieldIndex: state.editingFieldIndex === index ? null : state.editingFieldIndex,
    })),
  reorderFields: (startIndex, endIndex) =>
    set((state) => {
      const result = Array.from(state.fields);
      const [removed] = result.splice(startIndex, 1);
      if (removed) {
        result.splice(endIndex, 0, removed);
      }
      return { fields: result };
    }),
  setEditingFieldIndex: (index) => set({ editingFieldIndex: index }),
  reset: () =>
    set({
      title: '',
      submitButtonText: 'Gửi',
      fields: [],
      editingFieldIndex: null,
    }),
}));
