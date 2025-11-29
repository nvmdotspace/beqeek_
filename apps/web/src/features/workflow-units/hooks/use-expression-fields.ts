/**
 * Hook for generating context-aware field suggestions
 *
 * Dynamically generates field options based on:
 * - Trigger type and its data schema
 * - Previous step outputs in the workflow
 * - Context variables defined in the workflow
 */
import { useMemo } from 'react';
import type { Field } from 'react-querybuilder';
import { useWorkflowEditorStore } from '../stores/workflow-editor-store';

/**
 * Generate expression fields based on workflow context
 *
 * @param currentNodeId - The ID of the node being configured
 * @returns Array of Field objects for the query builder
 *
 * @example
 * ```tsx
 * const fields = useExpressionFields(selectedNode.id);
 *
 * <QueryBuilder fields={fields} ... />
 * ```
 */
export function useExpressionFields(currentNodeId?: string): Field[] {
  const { nodes } = useWorkflowEditorStore();

  return useMemo(() => {
    const fields: Field[] = [];

    // === Trigger Fields ===
    fields.push(
      { name: 'trigger.type', label: 'Trigger Type' },
      { name: 'trigger.data', label: 'Trigger Data' },
      { name: 'trigger.timestamp', label: 'Trigger Time' },
    );

    // Add trigger-specific fields
    const triggerNode = nodes.find((n) => n.type?.startsWith('trigger_'));
    if (triggerNode) {
      switch (triggerNode.type) {
        case 'trigger_webhook':
          fields.push(
            { name: 'trigger.data.method', label: 'HTTP Method' },
            { name: 'trigger.data.headers', label: 'Request Headers' },
            { name: 'trigger.data.body', label: 'Request Body' },
            { name: 'trigger.data.query', label: 'Query Params' },
          );
          break;
        case 'trigger_form':
          fields.push(
            { name: 'trigger.data.formId', label: 'Form ID' },
            { name: 'trigger.data.submitter', label: 'Submitter' },
            { name: 'trigger.data.fields', label: 'Form Fields' },
          );
          break;
        case 'trigger_table':
          fields.push(
            { name: 'trigger.data.tableId', label: 'Table ID' },
            { name: 'trigger.data.recordId', label: 'Record ID' },
            { name: 'trigger.data.action', label: 'Action Type' },
            { name: 'trigger.data.record', label: 'Record Data' },
          );
          break;
        case 'trigger_schedule':
          fields.push(
            { name: 'trigger.data.scheduledTime', label: 'Scheduled Time' },
            { name: 'trigger.data.executionId', label: 'Execution ID' },
          );
          break;
      }
    }

    // === User Fields ===
    fields.push(
      { name: 'trigger.user.id', label: 'User ID' },
      { name: 'trigger.user.email', label: 'User Email' },
      { name: 'trigger.user.name', label: 'User Name' },
      { name: 'trigger.user.role', label: 'User Role' },
    );

    // === Previous Step Outputs ===
    if (currentNodeId) {
      const currentIndex = nodes.findIndex((n) => n.id === currentNodeId);

      // Only include nodes that come before the current one
      const previousNodes = nodes.slice(0, currentIndex).filter(
        (node) =>
          // Exclude trigger nodes (already covered above)
          !node.type?.startsWith('trigger_') &&
          // Exclude compound nodes (they don't produce direct output)
          node.type !== 'compound_condition' &&
          node.type !== 'compound_loop',
      );

      previousNodes.forEach((node) => {
        const label = (node.data as { label?: string })?.label || node.id;
        const nodeType = node.type || 'unknown';

        // Generic output field
        fields.push({
          name: `steps.${node.id}.output`,
          label: `${label} Output`,
        });

        // Type-specific output fields
        switch (nodeType) {
          case 'table_operation':
            fields.push(
              { name: `steps.${node.id}.output.records`, label: `${label} Records` },
              { name: `steps.${node.id}.output.count`, label: `${label} Count` },
            );
            break;
          case 'api_call':
            fields.push(
              { name: `steps.${node.id}.output.status`, label: `${label} Status` },
              { name: `steps.${node.id}.output.data`, label: `${label} Response` },
              { name: `steps.${node.id}.output.headers`, label: `${label} Headers` },
            );
            break;
          case 'smtp_email':
            fields.push(
              { name: `steps.${node.id}.output.messageId`, label: `${label} Message ID` },
              { name: `steps.${node.id}.output.success`, label: `${label} Success` },
            );
            break;
          case 'math':
            fields.push({
              name: `steps.${node.id}.output.result`,
              label: `${label} Result`,
            });
            break;
          case 'definition':
            fields.push({
              name: `steps.${node.id}.output.variables`,
              label: `${label} Variables`,
            });
            break;
        }
      });
    }

    // === Context Variables ===
    fields.push(
      { name: 'context.workflowId', label: 'Workflow ID' },
      { name: 'context.executionId', label: 'Execution ID' },
      { name: 'context.timestamp', label: 'Current Timestamp' },
      { name: 'context.environment', label: 'Environment' },
    );

    // === Loop Context (if inside a loop) ===
    const currentNode = nodes.find((n) => n.id === currentNodeId);
    if (currentNode?.parentId) {
      const parentNode = nodes.find((n) => n.id === currentNode.parentId);
      if (parentNode?.type === 'compound_loop') {
        const itemVar = (parentNode.data as { itemVar?: string })?.itemVar || 'item';
        fields.push(
          { name: `loop.${itemVar}`, label: `Loop Item (${itemVar})` },
          { name: 'loop.index', label: 'Loop Index' },
          { name: 'loop.isFirst', label: 'Is First Iteration' },
          { name: 'loop.isLast', label: 'Is Last Iteration' },
        );
      }
    }

    return fields;
  }, [nodes, currentNodeId]);
}

/**
 * Get field type for a field name
 * Used for operator filtering
 */
export function getFieldType(fieldName: string): 'text' | 'number' | 'boolean' | 'date' {
  const lowerName = fieldName.toLowerCase();

  if (
    lowerName.includes('count') ||
    lowerName.includes('index') ||
    lowerName.includes('result') ||
    lowerName.includes('status')
  ) {
    return 'number';
  }

  if (lowerName.includes('isfirst') || lowerName.includes('islast') || lowerName.includes('success')) {
    return 'boolean';
  }

  if (lowerName.includes('time') || lowerName.includes('date') || lowerName.includes('timestamp')) {
    return 'date';
  }

  return 'text';
}
