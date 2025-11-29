/**
 * Unit tests for YAML Parser
 */

import { describe, it, expect } from 'vitest';
import { parseWorkflowYAML, isValidWorkflowYAML, YAMLParseError } from '../utils/yaml-parser';

describe('yaml-parser', () => {
  describe('parseWorkflowYAML', () => {
    it('should parse valid minimal workflow YAML', () => {
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
      const result = parseWorkflowYAML(yaml);
      expect(result.version).toBe('1.0');
      expect(result.trigger.type).toBe('webhook');
      expect(result.steps).toHaveLength(1);
    });

    it('should parse workflow with steps', () => {
      const yaml = `
version: "1.0"
trigger:
  type: schedule
  config:
    cron: "0 9 * * 1-5"
steps:
  - id: step_1
    name: First Step
    type: action_http_request
    config:
      url: "https://api.example.com"
      method: GET
  - id: step_2
    name: Second Step
    type: action_delay
    config:
      duration: 5000
    depends_on:
      - step_1
`;
      const result = parseWorkflowYAML(yaml);
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0]?.id).toBe('step_1');
      expect(result.steps[0]?.name).toBe('First Step');
      expect(result.steps[1]?.depends_on).toEqual(['step_1']);
    });

    it('should parse workflow with positions', () => {
      const yaml = `
version: "1.0"
trigger:
  type: form
  config: {}
steps:
  - id: step_1
    name: Positioned Step
    type: action_log
    config: {}
    position:
      x: 100
      y: 200
`;
      const result = parseWorkflowYAML(yaml);
      expect(result.steps[0]?.position).toEqual({ x: 100, y: 200 });
    });

    it('should parse workflow with metadata', () => {
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
metadata:
  description: "Test workflow"
  tags:
    - production
    - critical
`;
      const result = parseWorkflowYAML(yaml);
      expect(result.metadata?.description).toBe('Test workflow');
      expect(result.metadata?.tags).toEqual(['production', 'critical']);
    });

    it('should throw YAMLParseError for malformed YAML', () => {
      const invalidYaml = `
version: "1.0"
trigger:
  type: webhook
  config: {
    broken: syntax
`;
      expect(() => parseWorkflowYAML(invalidYaml)).toThrow(YAMLParseError);
    });

    it('should throw Error for missing required fields', () => {
      const missingTrigger = `
version: "1.0"
steps: []
`;
      // Missing trigger is detected as unknown format
      expect(() => parseWorkflowYAML(missingTrigger)).toThrow('Unknown YAML format');
    });

    it('should throw YAMLParseError for invalid trigger type', () => {
      const invalidTrigger = `
version: "1.0"
trigger:
  type: invalid_trigger
  config: {}
steps: []
`;
      expect(() => parseWorkflowYAML(invalidTrigger)).toThrow(YAMLParseError);
    });

    it('should throw YAMLParseError for step missing id', () => {
      const missingStepId = `
version: "1.0"
trigger:
  type: webhook
  config: {}
steps:
  - name: Step Without ID
    type: action_log
    config: {}
`;
      expect(() => parseWorkflowYAML(missingStepId)).toThrow(YAMLParseError);
    });

    it('should throw YAMLParseError for step missing type', () => {
      const missingStepType = `
version: "1.0"
trigger:
  type: webhook
  config: {}
steps:
  - id: step_1
    name: Step Without Type
    config: {}
`;
      expect(() => parseWorkflowYAML(missingStepType)).toThrow(YAMLParseError);
    });
  });

  describe('isValidWorkflowYAML', () => {
    it('should return true for valid YAML', () => {
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
      expect(isValidWorkflowYAML(yaml)).toBe(true);
    });

    it('should return false for invalid YAML', () => {
      expect(isValidWorkflowYAML('invalid: yaml: syntax: {')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidWorkflowYAML('')).toBe(false);
    });

    it('should return false for missing required fields', () => {
      expect(isValidWorkflowYAML('version: "1.0"')).toBe(false);
    });
  });

  describe('YAMLParseError', () => {
    it('should have correct name property', () => {
      const error = new YAMLParseError('Test error');
      expect(error.name).toBe('YAMLParseError');
    });

    it('should preserve cause', () => {
      const originalError = new Error('Original');
      const error = new YAMLParseError('Wrapped error', originalError);
      expect(error.cause).toBe(originalError);
    });
  });
});
