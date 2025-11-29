# Backend Communication Guide

## Purpose

Document for FE-BE alignment on workflow YAML structure and API requirements.

---

## 1. Current YAML Structure (Blade)

### 1.1 Table Operations

```yaml
# Blade generates this for table blocks
- type: table
  name: get_users
  input:
    action: get_list # get_list | get_one | create | update | delete
    connector: '123456' # Table ID
    query: # For get_list
      filtering: { ... }
      sorting: { ... }
    record: '$[config.id]' # For get_one
    data: { ... } # For create/update
```

### 1.2 Table Comment Operations

```yaml
# ⚠️ NOT YET IN REACT - Need BE confirmation

# Comment Create
- type: table
  name: create_comment
  input:
    action: comment_create
    connector: '123456'
    record: '$[record.id]'
    content: 'Comment text'
    parent_id: null # For replies

# Comment Get One
- type: table
  name: get_comment
  input:
    action: comment_get_one
    connector: '123456'
    comment_id: '$[config.comment_id]'
```

**Questions for BE:**

1. Is `action: comment_create` the correct format?
2. What fields does `comment_create` require? (`record`, `content`, `parent_id`?)
3. What does `comment_get_one` return?

---

## 2. Proposed New Block Types

### 2.1 table_comment_create

**React Node Type**: `table_comment_create`

**Proposed YAML Output**:

```yaml
- type: table
  name: add_comment
  input:
    action: comment_create
    connector: 'table_id_here'
    record: '$[trigger.record_id]'
    content: '$[form.message]'
    # Optional:
    parent_id: null
    mentions: []
```

**BE API Required**:

- Endpoint: `POST /workflow/{verb}/active_tables`
- Payload should support `action: comment_create`

### 2.2 table_comment_get_one

**React Node Type**: `table_comment_get_one`

**Proposed YAML Output**:

```yaml
- type: table
  name: fetch_comment
  input:
    action: comment_get_one
    connector: 'table_id_here'
    comment_id: '$[config.comment_id]'
```

**Expected Response Shape**:

```json
{
  "id": "comment_snowflake_id",
  "content": "Comment text",
  "author": { "id": "user_id", "name": "Name" },
  "createdAt": "2024-01-01T00:00:00Z",
  "parentId": null,
  "replies": []
}
```

---

## 3. Value Reference Syntax

Current syntax used in Blade:

| Syntax               | Meaning              | Example                   |
| -------------------- | -------------------- | ------------------------- |
| `$[config.field]`    | Workflow config      | `$[config.table_id]`      |
| `$[trigger.field]`   | Trigger payload      | `$[trigger.record_id]`    |
| `$[step_name.field]` | Previous step output | `$[get_users.data]`       |
| `$[context.field]`   | Execution context    | `$[context.workspace_id]` |

**Question for BE**: Is this syntax still valid? Any new patterns?

---

## 4. API Endpoints Review

### Existing Endpoints (Confirmed Working)

| Endpoint                                | Method | Purpose          |
| --------------------------------------- | ------ | ---------------- |
| `/workflow/get/workflow_units`          | POST   | List all units   |
| `/workflow/get/workflow_units/{id}`     | POST   | Get unit detail  |
| `/workflow/post/workflow_units`         | POST   | Create unit      |
| `/workflow/patch/workflow_units/{id}`   | POST   | Update unit      |
| `/workflow/delete/workflow_units/{id}`  | POST   | Delete unit      |
| `/workflow/get/workflow_events`         | POST   | List events      |
| `/workflow/get/workflow_events/{id}`    | POST   | Get event detail |
| `/workflow/post/workflow_events`        | POST   | Create event     |
| `/workflow/patch/workflow_events/{id}`  | POST   | Update event     |
| `/workflow/delete/workflow_events/{id}` | POST   | Delete event     |

### Endpoints Needing Confirmation

| Endpoint                  | Question                                      |
| ------------------------- | --------------------------------------------- |
| Table comment in workflow | Does `action: comment_create` work?           |
| Context variables API     | Endpoint to get available `$[...]` variables? |
| YAML validation           | Any server-side YAML validation?              |

---

## 5. YAML Execution Context

### 5.1 Available Context Variables

```yaml
# What's available in $[...] at runtime?
$[config.*]     # Workflow event config
$[trigger.*]    # Trigger payload (webhook body, form data, etc.)
$[context.*]    # Workspace ID, user ID, etc.
$[step_name.*]  # Output from previous steps
```

**Question for BE**: Can you provide a complete list of available contexts?

### 5.2 Trigger Payloads by Type

| Trigger Type | Payload Shape                            |
| ------------ | ---------------------------------------- |
| SCHEDULE     | `{ executionTime, iteration }`           |
| WEBHOOK      | `{ body, headers, query }`               |
| OPTIN_FORM   | `{ formData, submittedAt }`              |
| ACTIVE_TABLE | `{ action, recordId, oldData, newData }` |

**Question for BE**: Are these payload shapes accurate?

---

## 6. Action Items

### For Backend Team

1. **Confirm table comment action format**
   - Does `action: comment_create` work?
   - Required fields for comments?

2. **Document available context variables**
   - What's in `$[config.*]`?
   - What's in `$[trigger.*]` for each trigger type?

3. **YAML validation**
   - Is there server-side validation?
   - What errors can the frontend expect?

### For Frontend Team

1. Wait for BE confirmation before implementing Phase 2
2. Use existing patterns for Phase 1 (node config forms)
3. Test YAML round-trip with real Blade exports

---

## 7. Timeline

| Date     | Milestone                    |
| -------- | ---------------------------- |
| Week 1   | Phase 1: Node config forms   |
| Week 2   | BE confirmation on comments  |
| Week 2-3 | Phase 2: Missing block types |
| Week 3-4 | Phase 3: Value builders      |

---

## Contact

- **FE Lead**: [Your name]
- **BE Lead**: [BE contact]
- **Slack Channel**: #workflow-builder
