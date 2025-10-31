# BEQEEK API Data Structure Reference

**Source:** swagger.yaml specification  
**Purpose:** Quick reference for UI/UX designers implementing Active Tables features

---

## 📊 ACTIVE TABLE SCHEMA

```yaml
ActiveTable:
  type: object
  id: string                          # Unique table ID
  name: string                        # Table name
  workGroupId: string                 # Grouping container
  tableType: string                   # e.g., "employee", "customer"
  description: string (nullable)      # Table description

  config:
    title: string

    # Field Configuration
    fields:                           # Array of column definitions
      - type: string                  # Field type (see below)
        label: string                 # Display name
        name: string                  # Database name
        placeholder: string
        defaultValue: string
        required: boolean
        options: []                   # For SELECT fields
        referenceLabelField: string   # For REFERENCE fields

    # Views Configuration
    kanbanConfigs:
      - kanbanScreenId: string
        screenName: string
        screenDescription: string
        statusField: string           # Group by field
        kanbanHeadlineField: string   # Card title field
        displayFields: [string]       # Fields to show on card

    ganttCharts:
      - ganttScreenId: string
        screenName: string
        taskNameField: string         # Task name
        startDateField: string        # Start date field
        endDateField: string          # End date field
        progressField: string (nullable)
        dependencyField: string (nullable)

    recordListConfig:
      layout: string
      titleField: string
      subLineFields: [string]
      tailFields: [string]

    recordDetailConfig:
      layout: string
      commentsPosition: string        # "side" or "bottom"
      headTitleField: string
      headSubLineFields: [string]
      rowTailFields: [string]

    # Actions
    actions:
      - name: string
        type: string
        icon: string (nullable)
        actionId: string

    # Quick Filters
    quickFilters:
      - fieldName: string

    # Pagination
    tableLimit: integer               # Records per page

    # Encryption
    e2eeEncryption: boolean           # Enable end-to-end encryption
    hashedKeywordFields: [string]     # Fields for searchable content

    # Defaults
    defaultSort: string               # e.g., "createdAt:desc"

    # Permissions
    permissionsConfig:
      - teamId: string
        roleId: string
        actions:
          - actionId: string
            permission: string        # "view", "create", "update", "delete", "admin"

    # Encryption Keys
    encryptionKey: string             # 32-char key (client-side only)
    encryptionAuthKey: string         # SHA256 hash (server verification)

  createdAt: datetime
  updatedAt: datetime
  additionalProperties: true

---

## 📝 RECORD SCHEMA

ActiveTableRecord:
  type: object

  id: string                          # Record ID

  record: object                      # Dynamic data object
    # Contains field values matching ActiveTableField names
    # E.g., { "name": "John", "email": "john@...", "status": "ACTIVE" }

  # Metadata
  createdBy: string                   # User ID who created
  updatedBy: string                   # User ID who last updated
  createdAt: datetime
  updatedAt: datetime

  # Field-level update tracking
  valueUpdatedAt: object              # Map<fieldName, datetime>
    # E.g., { "status": "2024-10-20T14:32:00Z", "salary": "2024-09-15T09:00:00Z" }

  # Relations
  relatedUserIds: [string]            # Users mentioned or related
  assignedUserIds: [string]           # Assigned to users

  # Encryption & Integrity
  record_hashes: [string]             # For integrity verification
  hashed_keywords: [string]           # For searching encrypted fields ⭐

  # Access Control
  permissions: object                 # Map<action, boolean>
    view: boolean
    create: boolean
    update: boolean
    delete: boolean
    admin: boolean

  additionalProperties: true

---

## 💬 COMMENT SCHEMA

Comment:
  type: object

  id: string                          # Comment ID
  recordId: string                    # Parent record

  content: string                     # Comment text

  # Author Info
  createdBy: object
    id: string                        # User ID
    name: string                      # Display name
    avatar: string                    # Avatar URL

  # Timestamps
  createdAt: datetime
  updatedAt: datetime (nullable)      # Null if never edited

  # Interactions
  mentions: [string]                  # @mentioned user IDs
  attachments: [object]               # Files attached
    - id: string
      name: string
      url: string
      fileSize: integer
      mimeType: string

  # Nested Replies
  replies: [Comment]                  # Recursive structure for threaded comments
    # Same structure as parent comment

  # Reactions
  reactions: object (optional)        # Map<emoji, [userIds]>
    "👍": ["usr_001", "usr_002"]
    "❤️": ["usr_003"]

---

## 🔐 FIELD TYPES (30+ Supported)

```

TEXT FIELDS:
SHORT_TEXT → String up to 255 chars
LONG_TEXT → String up to 65,535 chars
RICH_TEXT → HTML/Markdown content
EMAIL → Email format validation
PHONE → Phone number format
URL → URL format validation

NUMERIC FIELDS:
INTEGER → Whole numbers
DECIMAL → Decimal numbers
CURRENCY → Money with formatting
PERCENTAGE → Percentage values
RATING → Star rating (1-5)

DATE/TIME FIELDS:
DATE → Date only
DATETIME → Date and time
TIME → Time only
DURATION → Time duration

SELECTION FIELDS:
SELECT_ONE → Single option from list
SELECT_LIST → Multiple options from list
CHECKBOX → True/False
RADIO → Radio button group
TAG → Tag selection

REFERENCE FIELDS:
REFERENCE → Link to record in another table
USER → Link to workspace user
FILE → File upload/attachment
IMAGE → Image upload

COMPUTED FIELDS:
FORMULA → Computed from other fields
ROLLUP → Aggregation from related records
COUNT → Count of related records
LOOKUP → Value from related record

SPECIAL:
BARCODE → Barcode input
QR_CODE → QR code input
JSON → Raw JSON data
ARRAY → Array of values

```

---

## 🔒 ENCRYPTION TYPES BY FIELD

```

Encryption Strategy by Field Type:

1. AES-256-CBC (Full Encryption):
   - SHORT_TEXT, LONG_TEXT, RICH_TEXT
   - EMAIL, PHONE, URL
   - User-sensitive data
   - Encryption: AES-256-CBC with random IV
   - IV is prepended to ciphertext
   - Server cannot search encrypted values
2. OPE (Order-Preserving Encryption):
   - INTEGER, DECIMAL, CURRENCY
   - PERCENTAGE, RATING
   - DATE, DATETIME, DURATION
   - Allows range queries: salary > 3000
   - Maintains sort order on encrypted data
   - Server cannot see actual value
3. HMAC-SHA256 (Hash-Based):
   - SELECT_ONE, SELECT_LIST
   - CHECKBOX, RADIO, TAG
   - Allows equality checks: status = "ACTIVE"
   - Server cannot reverse hash
   - Single way: value → hash
4. Hashed Keywords (For Search):
   - Tokenize field value: "John Doe" → ["John", "Doe"]
   - HMAC each token: ["hash_John", "hash_Doe"]
   - Store in hashed_keywords array
   - Enables server-side search on encrypted content
   - Fields to index specified in hashedKeywordFields[]

Security Guarantee:
✓ Server stores NO plaintext of encrypted fields
✓ encryptionKey (32 chars) NEVER sent to server
✓ encryptionAuthKey (SHA256 hash) used for verification only
✓ Loss of encryptionKey = permanent loss of access

```

---

## 📋 KANBAN CONFIGURATION DETAILS

```

KanbanConfig Structure:

kanbanScreenId: string
→ Unique ID for this kanban view
→ Allows multiple kanban views per table

screenName: string
→ Display name: "Employee Status Board"

screenDescription: string
→ Helpful description for users

statusField: string ⭐ CRITICAL
→ Field name to group by
→ Must be SELECT or reference field
→ E.g., "status" with values: ["Hired", "Onboarding", "Active", "On Leave"]

kanbanHeadlineField: string ⭐ CRITICAL
→ Field to show as card title
→ E.g., "name" for employee name on each card
→ Usually primary identifier

displayFields: [string] ⭐ CRITICAL
→ Fields to display on each card
→ E.g., ["email", "department", "startDate"]
→ Limited to 3-4 fields for readability

Implementation Logic:

1. Query all records for this table
2. Get unique values of statusField:
   ["Hired", "Onboarding", "Active", "On Leave"]
3. For each unique value:
   - Create a column header
   - Count records with this value
   - Create cards for each record
4. On each card:
   - Title = record[kanbanHeadlineField]
   - Display = record[displayField] for each field in displayFields
5. Enable drag & drop:
   - Drag card between columns
   - Update statusField value
   - Trigger automations if configured

Example UI Output:

"Active" Column:
┌─────────────────┐
│ John Doe │
│ john@comp.com │
│ HR Dept │
│ 2023-01-15 │
│ [Details] [⋮] │
└─────────────────┘

```

---

## 📅 GANTT CONFIGURATION DETAILS

```

GanttChart Structure:

ganttScreenId: string
→ Unique ID for this gantt view

screenName: string
→ Display name: "Employment Timeline"

screenDescription: string
→ Helper text

taskNameField: string ⭐ CRITICAL
→ What to show as task name
→ E.g., "name" for employee names
→ Displayed on left side of chart

startDateField: string ⭐ CRITICAL
→ Date field marking start
→ E.g., "startDate" for employment start
→ Must be DATE or DATETIME field

endDateField: string ⭐ CRITICAL
→ Date field marking end
→ E.g., "endDate" or "retirementDate"
→ Can be null/empty = ongoing
→ If null: bar extends indefinitely

progressField: string (nullable)
→ Optional progress indicator
→ E.g., "completionPercent" (0-100)
→ If provided: shows progress bar on timeline
→ If null: shows solid bar

dependencyField: string (nullable)
→ Optional dependency tracking
→ E.g., "dependsOn" references another record
→ If provided: draw arrows between bars
→ If null: no dependency visualization

Implementation Logic:

1. Determine time range from all records:
   - minDate = earliest startDateField value
   - maxDate = latest endDateField value (or today)
   - Add padding to show context

2. Create timeline scale:
   - Axis could be: Day / Week / Month / Year
   - User can zoom and pan

3. For each record:
   - Draw bar from startDateField to endDateField
   - Position vertically
   - Group by first letter or team if needed
   - Show taskNameField as label

4. Optional: Add progress
   - If progressField specified and populated
   - Show progress within bar: [=====──────] 50%

5. Optional: Draw dependencies
   - If dependencyField specified
   - Draw arrows from dependency to dependent

Example Output:

Timeline: 2022 ──────── 2023 ──────── 2024

John Doe ████████░░░░░░░░░░░░░░░░░░
(2023-01-15 → ongoing)

Jane Smith ░░░░████░░░░░░░░░░░░░░░░░░░
(2023-06-01 → ongoing)

Bob Johnson ████░░░░░░░░░░░░░░░░░░░░░░░░
(2022-03-20 → ongoing)

```

---

## 📍 RECORD DETAIL CONFIG

```

RecordDetailConfig Structure:

layout: string
→ "vertical" | "horizontal" | "card"
→ Determines how fields are laid out

commentsPosition: string ⭐ CRITICAL
→ "side" | "bottom" | "tab"
→ "side": Comments panel on right (30% width)
→ "bottom": Comments below details
→ "tab": Comments in separate tab

headTitleField: string ⭐ CRITICAL
→ Main title at top of detail view
→ E.g., "name" for "John Doe"

headSubLineFields: [string]
→ Additional info below title
→ E.g., ["email", "department"]
→ Shows as: john@company.com | HR Dept

rowTailFields: [string]
→ Fields to show at end of each row
→ E.g., ["status", "lastUpdated"]
→ Helpful for quick status check

Example Layout:

┌────────────────────────────┬──────────────────┐
│ John Doe │ Comments (side) │
│ john@company.com | HR Dept │ │
├────────────────────────────┤ 💬 Comments (3) │
│ │ ══════════════ │
│ Fields: │ │
│ ┌──────────────────────┐ │ 👤 Jane Smith │
│ │ Name: John Doe ✓ │ │ "Top performer" │
│ │ Email: john@... ↗ │ │ [👍 2] [💬] │
│ │ Status: Active ✓ │ │ │
│ │ Salary: $3000 ↗ │ │ 👤 HR Admin │
│ │ StartDate: ... ✓ │ │ "Training done" │
│ └──────────────────────┘ │ [👍 1] [💬] │
│ │ │
│ Last Updated: 28 Oct 2024 │ ──────────────── │
│ │ [+ Add comment] │
└────────────────────────────┴──────────────────┘

```

---

## 🎮 PERMISSIONS CONFIGURATION

```

PermissionsConfig Structure:

Array of permission sets per team/role:
[
{
teamId: "team_hr",
roleId: "role_manager",
actions: [
{ actionId: "view_records", permission: "allowed" },
{ actionId: "create_records", permission: "allowed" },
{ actionId: "update_records", permission: "allowed" },
{ actionId: "delete_records", permission: "denied" },
{ actionId: "export_records", permission: "allowed" },
{ actionId: "share_records", permission: "allowed" }
]
},
{
teamId: "team_hr",
roleId: "role_staff",
actions: [
{ actionId: "view_records", permission: "allowed" },
{ actionId: "create_records", permission: "allowed" },
{ actionId: "update_records", permission: "own_records_only" },
{ actionId: "delete_records", permission: "denied" },
{ actionId: "export_records", permission: "denied" },
{ actionId: "share_records", permission: "denied" }
]
}
]

Record-Level Permissions:

Each record also has:
{
"permissions": {
"view": true, # Can view this specific record
"update": true, # Can modify fields
"delete": false, # Cannot delete
"admin": false, # Cannot manage record permissions
"export": true # Can export this record
}
}

Evaluated as:

1. Check table-level permissions (from config.permissionsConfig)
2. Check record-level permissions (from record.permissions)
3. Apply most restrictive rule (deny wins)

````

---

## 📡 API REQUEST/RESPONSE EXAMPLES

### List Records with Filtering

```javascript
// Request
POST /api/workspace/ws_001/workflow/get/active_tables/emp_001/records
Authorization: Bearer {token}

{
  "paging": "cursor",
  "filtering": {
    "record.status": { "eq": "ACTIVE" },
    "record.department": { "in": ["HR", "IT"] },
    "record.salary": { "gt": 3000 }
  },
  "direction": "asc",
  "limit": 50
}

// Response (ActiveTableRecordListResponse)
{
  "meta": {
    "total": 12,
    "page": 1,
    "cursor": "c_next_123",
    "previous_cursor": null
  },
  "data": [
    {
      "id": "rec_001",
      "record": {
        "name": "John Doe",
        "email": "john@company.com",
        "department": "HR",
        "status": "ACTIVE",
        "salary": "3000"
      },
      "createdBy": "usr_123",
      "updatedBy": "usr_123",
      "createdAt": "2024-01-15T08:00:00Z",
      "updatedAt": "2024-10-28T10:00:00Z",
      "valueUpdatedAt": {
        "status": "2024-10-20T14:32:00Z",
        "salary": "2024-09-15T09:00:00Z"
      },
      "relatedUserIds": ["usr_456"],
      "assignedUserIds": ["usr_456"],
      "record_hashes": ["hash_001"],
      "hashed_keywords": ["hash_john", "hash_doe"],
      "permissions": {
        "view": true,
        "update": true,
        "delete": false,
        "admin": false
      }
    }
    // ... more records
  ]
}
````

### Create Record with E2EE

```javascript
// Request with Encryption
POST /api/workspace/ws_001/workflow/post/active_tables/emp_001/records
Authorization: Bearer {token}

{
  "record": {
    "name": "Alice Johnson",
    "email": "enc_...base64...",        // AES-256-CBC encrypted
    "salary": "ope_...base64...",       // OPE encrypted
    "department": "HR",
    "status": "ONBOARDING"
  },
  "hashed_keywords": [
    "hash_alice",
    "hash_johnson",
    "hash_alice@company"
  ],
  "record_hashes": {
    "name": "sha256_hash_alice_johnson",
    "email": "sha256_hash_email"
  }
}

// Response
{
  "status": "success",
  "message": "Record created",
  "data": {
    "id": "rec_new_001"
  }
}
```

### Comment Payload

```javascript
// POST /api/workspace/{ws}/workflow/active_tables/{tbl}/records/{rec}/post/comments

{
  "content": "Great work on the Q3 review! @John Doe",
  "mentions": ["usr_123"],
  "attachments": ["file_001", "file_002"]
}

// Response
{
  "status": "success",
  "data": {
    "id": "cmt_001"
  }
}
```

---

## 🔄 WORKFLOW AUTOMATION STRUCTURES

### Workflow Unit

```yaml
WorkflowUnit:
  id: string
  name: string # e.g., "Send Notification"
  description: string (nullable)
  status: string # "active", "draft", "paused"
  createdAt: datetime
  updatedAt: datetime
  additionalProperties: true
```

### Workflow Event

```yaml
WorkflowEvent:
  id: string
  workflowUnit: string (nullable) # Reference to unit
  eventName: string # e.g., "record_created"
  eventSourceType: string # "record", "schedule", "webhook"

  eventSourceParams:
    object # Event-specific config
    # For record events:
    #   table_id, trigger_on: "create|update|delete"
    # For scheduled:
    #   cron_expression: "0 9 * * *"
    # For webhook:
    #   webhook_path, http_method

  workflowDefinition:
    object (nullable) # Logic of automation
    # E.g., conditionals, actions to execute

  handlerConfig:
    object (nullable) # Handler configuration
    # How to handle the event

  status: string # "active", "inactive", "error"
  createdAt: datetime
  updatedAt: datetime
```

---

## 📊 SUMMARY TABLE

| Concept        | Schema                       | Location                                                    | Use Case                          |
| -------------- | ---------------------------- | ----------------------------------------------------------- | --------------------------------- |
| **Table**      | ActiveTable                  | `/workflow/active_tables/{id}`                              | Define columns, views, encryption |
| **Record**     | ActiveTableRecord            | `/workflow/active_tables/{tbl}/records/{id}`                | Store actual data                 |
| **Comment**    | Comment                      | `/workflow/active_tables/{tbl}/records/{rec}/comments/{id}` | Collaboration                     |
| **View**       | KanbanConfig / GanttChart    | `config.kanbanConfigs[]` / `config.ganttCharts[]`           | Multi-view support                |
| **Permission** | PermissionsConfig            | `config.permissionsConfig[]`                                | Access control                    |
| **Automation** | WorkflowUnit / WorkflowEvent | `/workflow/units/` / `/workflow/events/`                    | Business logic                    |

---

**END OF API REFERENCE**

Use this document as a reference when:

- Building table configuration forms
- Designing record detail views
- Implementing encryption/decryption
- Setting up permissions UI
- Creating Kanban/Gantt visualizations
- Integrating comments system
