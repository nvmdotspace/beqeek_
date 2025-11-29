# Phase 2: Missing Block Types

## Context

- **Parent Plan**: [plan.md](./plan.md)
- **Dependencies**: Phase 1 (forms), YAML converter
- **Reference**: Blade Blockly blocks (`workflow-units.blade.php:169-227`)

## Overview

- **Date**: 2024-11-29
- **Description**: Add missing node types from Blade that don't exist in React Flow
- **Priority**: High
- **Implementation Status**: ✅ Complete
- **Review Status**: Passed type check

## Key Insights

### Blade Blocks NOT in React

| Blade Block                   | Category | React Equivalent | Gap          |
| ----------------------------- | -------- | ---------------- | ------------ |
| `table_comment_create_block`  | Action   | ❌ None          | **Must add** |
| `table_comment_get_one_block` | Action   | ❌ None          | **Must add** |
| `object_lookup`               | Value    | ❌ None          | **Must add** |
| `dynamic_array`               | Value    | ❌ None          | Phase 3      |
| `dynamic_object`              | Value    | ❌ None          | Phase 3      |

### Blade Blocks Merged in React

| Blade Blocks                                  | React Node        | Notes                                 |
| --------------------------------------------- | ----------------- | ------------------------------------- |
| `table_get_list/get_one/create/update/delete` | `table_operation` | Single node with `action` param ✅    |
| `google_sheet_create/append/read/update`      | `google_sheet`    | Single node with `operation` param ✅ |
| `user_get_list/get_one`                       | `user_operation`  | Single node with `action` param ✅    |

## Requirements

### Functional

- F1: Add `table_comment_create` node type
- F2: Add `table_comment_get_one` node type
- F3: Both integrate with existing table_operation patterns
- F4: YAML converter handles new types

### Backend Dependency

> ⚠️ **Requires BE confirmation**: Do table comment operations use same API structure as record operations?

## Architecture

### Option A: Separate Node Types (Recommended)

```typescript
// Add to node-types.ts
| 'table_comment_create'
| 'table_comment_get_one'

// New node definitions
{
  type: 'table_comment_create',
  label: 'Create Comment',
  category: 'action',
  icon: 'MessageSquarePlus',
  description: 'Create comment on table record',
  defaultData: {
    name: 'create_comment',
    connector: '',
    recordId: '',
    content: '',
  }
}
```

### Option B: Extend table_operation

```typescript
// Modify TableOperationData
action: 'get_list' | 'get_one' | 'create' | 'update' | 'delete' | 'comment_create' | 'comment_get_one'; // Add these
```

**Recommendation**: Option A - separate nodes clearer for users, matches Blade pattern.

## Related Code Files

| File                                      | Changes                          |
| ----------------------------------------- | -------------------------------- |
| `utils/node-types.ts`                     | Add new NodeType, NodeDefinition |
| `utils/yaml-parser.ts`                    | Parse new block types            |
| `utils/yaml-serializer.ts`                | Serialize new block types        |
| `components/workflow-builder/nodes/`      | New node components              |
| `components/workflow-builder/node-forms/` | New config forms                 |

## Implementation Steps

### Step 1: Add Node Definitions

- [x] Add `table_comment_create` to `NodeType` union
- [x] Add `table_comment_get_one` to `NodeType` union
- [x] Add `object_lookup` to `NodeType` union
- [x] Add node definitions to `NODE_DEFINITIONS`
- [x] Add data interfaces

### Step 2: Create Node Components

- [x] `TableCommentCreateNode` in nodes/index.tsx
- [x] `TableCommentGetOneNode` in nodes/index.tsx
- [x] `ObjectLookupNode` in nodes/index.tsx
- [x] Register in React Flow `nodeTypes` map

### Step 3: Create Config Forms

- [x] `TableCommentCreateForm.tsx` (table, record, content, parentId)
- [x] `TableCommentGetOneForm.tsx` (table, record, commentId)
- [x] `ObjectLookupForm.tsx` (object, key, defaultValue)

### Step 4: Update YAML Converter

- [ ] Add parser case for `type: 'table'` with `action: 'comment_create'`
- [ ] Add parser case for `type: 'table'` with `action: 'comment_get_one'`
- [ ] Add serializer output for new types

## Todo List

- [x] Define data interfaces for comment nodes
- [x] Add node definitions
- [x] Create node components
- [x] Create config forms
- [x] Add `object_lookup` node
- [ ] Update YAML parser (future)
- [ ] Update YAML serializer (future)
- [ ] Test YAML round-trip (future)

## Success Criteria

- [x] `table_comment_create` appears in node palette
- [x] `table_comment_get_one` appears in node palette
- [x] `object_lookup` appears in node palette
- [ ] YAML import from Blade works (future)
- [ ] YAML export matches Blade format (future)

## Risk Assessment

| Risk                     | Impact | Mitigation                  |
| ------------------------ | ------ | --------------------------- |
| BE API mismatch          | High   | Confirm API structure first |
| YAML format differences  | Medium | Test with Blade exports     |
| Node palette overcrowded | Low    | Use sub-categories          |

## Security Considerations

- Validate record/comment IDs
- Sanitize comment content

## Next Steps

After Phase 2 complete:

1. → Phase 3: Value builders
2. → E2E testing with real workflows
