# Workflow Node Config Implementation Plan

## Overview

- **Date**: 2024-11-29
- **Status**: ✅ Complete (All Phases)
- **Priority**: High
- **Goal**: Implement node configuration forms and missing block types for React Flow workflow builder

## Current State

React Flow nodes are **display-only** - users cannot edit node properties. The `NodeConfigDrawer` shows JSON but lacks input forms. Missing block types from Blade/Blockly: table comments, value builders.

## Phases

| Phase | Name                     | Status      | Progress | Document                                                             |
| ----- | ------------------------ | ----------- | -------- | -------------------------------------------------------------------- |
| 1     | Node Configuration Forms | ✅ Complete | 100%     | [phase-01-node-config-forms.md](./phase-01-node-config-forms.md)     |
| 2     | Missing Block Types      | ✅ Complete | 100%     | [phase-02-missing-block-types.md](./phase-02-missing-block-types.md) |
| 3     | Value Builders           | ✅ Complete | 100%     | [phase-03-value-builders.md](./phase-03-value-builders.md)           |

## Related Documents

- [BE Communication Guide](./be-communication.md) - API changes needed
- [Blockly Blocks Analysis](./blockly-blocks-analysis.md) - **Detailed analysis of all 25+ Blockly blocks**
- [Blade Source](../../docs/html-module/workflow-units.blade.php) - Reference implementation

## Key Metrics

- **25+ Blockly blocks** in Blade (analyzed)
- **17 node types** exist in React (need config forms)
- **7 missing block types** (table*comment*\*, object_lookup, dynamic_array/object, array_item, object_pair)
- **6 field types** to map (FieldTextInput, FieldNumber, FieldDropdown, FieldMultilineInput, ValueInput, StatementInput)

## Dependencies

- `@workspace/ui` - Form components (Input, Select, Textarea)
- `zustand` - State updates via `useWorkflowEditorStore`
- React Flow - Node data structure

## Unresolved Questions

1. Should table comments be separate node types or actions within `table_operation`?
2. Do value builders need visual block representation or JSON editor suffices?
3. Does BE need YAML schema changes for new block types?
