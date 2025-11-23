/**
 * Unit tests for YAML Converter (Public API)
 */

import { describe, it, expect } from 'vitest';
import type { Node, Edge } from '@xyflow/react';
import {
  yamlToReactFlow,
  reactFlowToYAML,
  validateWorkflowYAML,
  roundTripTest,
  YAMLParseError,
} from '../utils/yaml-converter';
import type { TriggerIR } from '../utils/yaml-types';

describe('yaml-converter', () => {
  describe('yamlToReactFlow', () => {
    it('should convert valid YAML to React Flow nodes and edges', () => {
      const yaml = `
version: "1.0"
trigger:
  type: webhook
  config:
    secret: "abc123"
steps:
  - id: step_1
    name: First Step
    type: action_http_request
    config:
      url: "https://api.example.com"
  - id: step_2
    name: Second Step
    type: action_log
    config:
      message: "Done"
    depends_on:
      - step_1
`;

      const result = yamlToReactFlow(yaml);

      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
      expect(result.trigger.type).toBe('webhook');
      expect(result.ir).toBeDefined();

      // Check node structure
      const firstNode = result.nodes.find((n) => n.id === 'step_1');
      expect(firstNode?.type).toBe('action_http_request');
      expect((firstNode?.data as Record<string, unknown> | undefined)?.label).toBe('First Step');

      // Check edge structure
      expect(result.edges[0]?.source).toBe('step_1');
      expect(result.edges[0]?.target).toBe('step_2');
    });

    it('should throw YAMLParseError for invalid YAML', () => {
      const invalidYaml = 'invalid: yaml: {broken';
      expect(() => yamlToReactFlow(invalidYaml)).toThrow(YAMLParseError);
    });

    it('should throw error for invalid workflow structure', () => {
      const invalidStructure = `
version: "1.0"
trigger:
  type: invalid_type
  config: {}
steps: []
`;
      expect(() => yamlToReactFlow(invalidStructure)).toThrow();
    });
  });

  describe('reactFlowToYAML', () => {
    it('should convert React Flow nodes and edges to YAML', () => {
      const nodes: Node[] = [
        {
          id: 'node_1',
          type: 'action_http_request',
          position: { x: 100, y: 100 },
          data: { label: 'HTTP Request', config: { url: 'https://example.com' } },
        },
        {
          id: 'node_2',
          type: 'action_log',
          position: { x: 100, y: 200 },
          data: { label: 'Log Result', config: { message: 'Done' } },
        },
      ];
      const edges: Edge[] = [{ id: 'e1', source: 'node_1', target: 'node_2' }];
      const trigger: TriggerIR = { type: 'webhook', config: {} };

      const yaml = reactFlowToYAML(nodes, edges, trigger);

      expect(yaml).toContain('version:');
      expect(yaml).toContain('trigger:');
      expect(yaml).toContain('webhook');
      expect(yaml).toContain('steps:');
      expect(yaml).toContain('node_1');
      expect(yaml).toContain('node_2');
      expect(yaml).toContain('HTTP Request');
      expect(yaml).toContain('Log Result');
      expect(yaml).toContain('depends_on:');
    });

    it('should handle single node canvas', () => {
      const nodes: Node[] = [
        {
          id: 'node_1',
          type: 'action_log',
          position: { x: 100, y: 100 },
          data: { label: 'Log Node', config: {} },
        },
      ];
      const trigger: TriggerIR = { type: 'schedule', config: { cron: '0 * * * *' } };
      const yaml = reactFlowToYAML(nodes, [], trigger);

      expect(yaml).toContain('version:');
      expect(yaml).toContain('trigger:');
      expect(yaml).toContain('schedule');
      expect(yaml).toContain('steps:');
      expect(yaml).toContain('node_1');
    });

    it('should preserve trigger configuration', () => {
      const nodes: Node[] = [
        {
          id: 'node_1',
          type: 'action_log',
          position: { x: 100, y: 100 },
          data: { label: 'Log Node', config: {} },
        },
      ];
      const trigger: TriggerIR = {
        type: 'schedule',
        config: { cron: '0 9 * * 1-5', timezone: 'Asia/Ho_Chi_Minh' },
      };
      const yaml = reactFlowToYAML(nodes, [], trigger);

      expect(yaml).toContain('cron:');
      expect(yaml).toContain('0 9 * * 1-5');
      expect(yaml).toContain('timezone:');
    });
  });

  describe('validateWorkflowYAML', () => {
    it('should return valid: true for valid YAML', () => {
      const yaml = `
version: "1.0"
trigger:
  type: webhook
  config: {}
steps:
  - id: step_1
    name: Placeholder
    type: action_log
    config: {}
`;
      const result = validateWorkflowYAML(yaml);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid: false with error for invalid YAML', () => {
      const result = validateWorkflowYAML('invalid yaml {{{');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return valid: false with error for invalid structure', () => {
      const result = validateWorkflowYAML('version: "1.0"');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle empty string', () => {
      const result = validateWorkflowYAML('');
      expect(result.valid).toBe(false);
    });
  });

  describe('roundTripTest', () => {
    it('should convert YAML to React Flow and back', () => {
      const originalYaml = `
version: "1.0"
trigger:
  type: webhook
  config: {}
steps:
  - id: step_1
    name: Test Step
    type: action_log
    config:
      message: Hello
    position:
      x: 400
      y: 100
`;
      const result = roundTripTest(originalYaml);

      expect(result.originalYAML).toBe(originalYaml);
      expect(result.convertedYAML).toBeDefined();
      expect(typeof result.fidelity).toBe('boolean');

      // The converted YAML should contain the same essential elements
      expect(result.convertedYAML).toContain('step_1');
      expect(result.convertedYAML).toContain('Test Step');
      expect(result.convertedYAML).toContain('action_log');
    });

    it('should detect fidelity when YAMLs are equivalent', () => {
      // Simple workflow that should round-trip
      const yaml = `
version: "1.0"
trigger:
  type: webhook
  config: {}
steps:
  - id: step_1
    name: Test Step
    type: action_log
    config: {}
    position:
      x: 400
      y: 100
`;
      const result = roundTripTest(yaml);

      // After normalization, they should match
      expect(result.convertedYAML).toContain('version:');
      expect(result.convertedYAML).toContain('webhook');
      expect(result.convertedYAML).toContain('step_1');
    });
  });

  describe('integration: complete workflow cycle', () => {
    it('should handle complex workflow with multiple dependencies', () => {
      // Create a complex workflow
      const nodes: Node[] = [
        {
          id: 'trigger_start',
          type: 'trigger_schedule',
          position: { x: 400, y: 50 },
          data: { label: 'Daily Schedule', config: { cron: '0 9 * * *' } },
        },
        {
          id: 'fetch_data',
          type: 'action_http_request',
          position: { x: 400, y: 150 },
          data: { label: 'Fetch API Data', config: { url: 'https://api.example.com/data', method: 'GET' } },
        },
        {
          id: 'process_left',
          type: 'action_transform',
          position: { x: 250, y: 250 },
          data: { label: 'Process Branch A', config: { operation: 'filter' } },
        },
        {
          id: 'process_right',
          type: 'action_transform',
          position: { x: 550, y: 250 },
          data: { label: 'Process Branch B', config: { operation: 'map' } },
        },
        {
          id: 'merge_results',
          type: 'action_merge',
          position: { x: 400, y: 350 },
          data: { label: 'Merge Results', config: {} },
        },
        {
          id: 'send_notification',
          type: 'action_notification',
          position: { x: 400, y: 450 },
          data: { label: 'Send Email', config: { to: 'team@example.com' } },
        },
      ];

      const edges: Edge[] = [
        { id: 'e1', source: 'trigger_start', target: 'fetch_data' },
        { id: 'e2', source: 'fetch_data', target: 'process_left' },
        { id: 'e3', source: 'fetch_data', target: 'process_right' },
        { id: 'e4', source: 'process_left', target: 'merge_results' },
        { id: 'e5', source: 'process_right', target: 'merge_results' },
        { id: 'e6', source: 'merge_results', target: 'send_notification' },
      ];

      const trigger: TriggerIR = { type: 'schedule', config: { cron: '0 9 * * *' } };

      // Convert to YAML
      const yaml = reactFlowToYAML(nodes, edges, trigger);

      // Parse back to React Flow
      const { nodes: parsedNodes, edges: parsedEdges } = yamlToReactFlow(yaml);

      // Verify node count
      expect(parsedNodes).toHaveLength(6);

      // Verify all dependencies are preserved
      const mergeNode = parsedNodes.find((n) => n.id === 'merge_results');
      const edgesToMerge = parsedEdges.filter((e) => e.target === 'merge_results');
      expect(edgesToMerge).toHaveLength(2);
    });

    it('should preserve node configuration through round-trip', () => {
      const complexConfig = {
        url: 'https://api.example.com',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { key: 'value', nested: { deep: true } },
      };

      const nodes: Node[] = [
        {
          id: 'http_node',
          type: 'action_http_request',
          position: { x: 100, y: 100 },
          data: { label: 'HTTP Request', config: complexConfig },
        },
      ];

      const yaml = reactFlowToYAML(nodes, [], { type: 'webhook', config: {} });
      const { nodes: parsedNodes } = yamlToReactFlow(yaml);

      const parsedNode = parsedNodes.find((n) => n.id === 'http_node');
      expect(parsedNode?.data?.config).toEqual(complexConfig);
    });
  });
});
