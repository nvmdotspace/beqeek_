# BEQEEK Active Tables - Quick Visual Summary

---

## 🎯 CORE CONCEPT

```
┌─────────────────────────────────────────────────────────────┐
│  BEQEEK = Workspace + Modules (formerly "Active Tables")   │
│                                                              │
│  Module = Container for related business processes         │
│  Examples: HRM Suite, CRM Suite, Finance Suite             │
│                                                              │
│  Table = Configuration of fields, views, and rules          │
│  Examples: Employee Profile, Career Management             │
│                                                              │
│  Record = Single data entry matching table schema           │
│  Examples: "John Doe" employee record                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ HIERARCHY

```
BEQEEK Workspace
│
└─── Modules (New Name ✓)
     │
     ├─── HRM Suite (workGroup)
     │    ├─ Employee Profile (ActiveTable)
     │    │  ├─ Records (ActiveTableRecord[])
     │    │  │  ├─ Employee 1
     │    │  │  ├─ Employee 2
     │    │  │  └─ Employee 3
     │    │  ├─ Comments (on each record)
     │    │  └─ Views: Table, Kanban, Gantt, Analytics
     │    │
     │    ├─ Career Management (ActiveTable)
     │    └─ Department (ActiveTable)
     │
     ├─── CRM Suite (Future)
     ├─── Finance Suite (Future)
     └─── Sales Suite (Future)
```

---

## 🎬 WORKFLOW: Creating a Record

```
1. User clicks: [+ Add New Record]
   ↓
2. System shows form with configured fields
   • Name (SHORT_TEXT, required)
   • Email (EMAIL, encrypted)
   • Salary (CURRENCY, OPE encrypted)
   • Status (SELECT_ONE from options)
   ↓
3. User fills form & clicks [Save]
   ↓
4. Client-side encryption:
   • Encrypt sensitive fields (email, salary)
   • Hash keywords for search
   • Create integrity hashes
   ↓
5. Send to API: POST /records
   {
     "record": { "name", "email_encrypted", "salary_ope" },
     "hashed_keywords": [...],
     "record_hashes": [...]
   }
   ↓
6. Server stores encrypted record
   ✓ No decryption possible on server
   ✓ Hashed keywords indexed for search
   ↓
7. Trigger automations if configured
   • Send welcome email
   • Notify team
   • Create tasks
   ↓
8. Update all views:
   • Add to table
   • Add card to Kanban
   • Add bar to Gantt
   ↓
9. Show success notification
```

---

## 👁️ VIEW TYPES

```
┌─ TABLE VIEW (Spreadsheet) ─────┐
│ ☐ | Name   | Email | Status |  │  ← Traditional grid
│ ☐ | John   | j@... | Active │  │  ← Sort, filter, group
│ ☐ | Jane   | j@... | Active │  │  ← Cursor-based pagination
└─────────────────────────────────┘

┌─ KANBAN VIEW (Status Board) ────┐
│ Hired  │ Onboarding │ Active │   │
├────────┼────────────┼────────┤   │
│ ┌───┐  │  ┌───┐     │ ┌───┐  │   │
│ │Bob│  │  │Al │     │ │John│  │   │ ← Group by statusField
│ │IT │  │  │M. │     │ │HR │   │   │ ← Drag & drop
│ └───┘  │  └───┘     │ └───┘  │   │
│        │   ┌───┐    │         │   │
│        │   │Eva│    │         │   │
│        │   │M. │    │         │   │
│        │   └───┘    │         │   │
└────────┴────────────┴─────────┘   │

┌─ GANTT VIEW (Timeline) ────────┐
│ 2022 ── 2023 ── 2024 ── 2025  │
├────────────────────────────────┤
│ John  ████░░░░░░░░░░░░░░░░░░  │ ← startDate to endDate
│ Jane  ░░░░████░░░░░░░░░░░░░░  │
│ Bob   ░░████░░░░░░░░░░░░░░░░░  │
│ Alice ░░░░░░░░░░░░░░░░░░░░░░░░ │
└────────────────────────────────┘

┌─ ANALYTICS VIEW (Dashboard) ────┐
│ Status Distribution             │
│ ┌──────┐    Active    5 (45%)   │
│ │      │    Hired     3 (27%)   │
│ │●●●●●◐│    Leave     2 (18%)   │
│ │    ◑│                         │
│ └──────┘    Avg Salary: $3,200  │
└────────────────────────────────┘
```

---

## 🔐 ENCRYPTION SYSTEM (E2EE)

```
Field Types & Encryption:

SHORT_TEXT, EMAIL, PHONE
    ↓
    AES-256-CBC Encryption
    ↓
    Stored as: enc_[IV + ciphertext]

INTEGER, DECIMAL, DATE, CURRENCY
    ↓
    OPE (Order-Preserving Encryption)
    ↓
    Allows range queries: salary > 3000

SELECT_ONE, CHECKBOX
    ↓
    HMAC-SHA256 Hashing
    ↓
    Allows equality: status = "ACTIVE"

Search Mechanism:
    "John Doe" searched
    ↓
    Tokenize: ["John", "Doe"]
    ↓
    Hash each: ["hash_john", "hash_doe"]
    ↓
    Server matches hashed_keywords
    ✓ Search on encrypted data without decryption

Security:
✓ encryptionKey (32 chars) stored client-side only
✓ encryptionAuthKey (SHA256 hash) on server for verification
✓ Server cannot decrypt data
✓ Loss of key = permanent loss of access
```

---

## 💬 COMMENTS & COLLABORATION

```
Each Record can have Comments:

John Doe (Employee Record)
  │
  ├─ 💬 Jane Smith (2024-10-15 10:32 AM)
  │  "Top performer in Q3 review"
  │  📎 Performance_Review_2024.pdf
  │  [👍 2] [💬 Reply]
  │  │
  │  └─ 💬 John Doe (Reply at 11:05 AM)
  │     "Thank you for the feedback!"
  │     [👍 0] [💬 Reply]
  │
  ├─ 💬 HR Admin (2024-10-10 09:15 AM)
  │  "New hire training completed"
  │  [👍 1] [💬 Reply]
  │
  └─ 💬 Manager (2024-10-05 14:45 PM)
     "@Jane Smith assigned follow-up"
     [👍 0] [💬 Reply]

Features:
✓ Threaded replies
✓ @mentions → notifications
✓ File attachments
✓ Emoji reactions
✓ Edit/delete own comments
✓ Full history with timestamps
```

---

## ⚙️ AUTOMATIONS (8+ per table)

```
Automation Triggers:

┌─ EVENT-BASED ─────────────────┐
│ When: Record status → "APPROVED" │
│ Then:                            │
│  • Send email to approver       │
│  • Create task in another table │
│  • Update related records       │
│  • Send Slack notification      │
└────────────────────────────────┘

┌─ SCHEDULED ──────────────────────┐
│ When: Every day at 9:00 AM       │
│ Then:                             │
│  • Sync with external HR system  │
│  • Generate daily report         │
│  • Check for overdue items       │
│  • Send reminders                │
└────────────────────────────────┘

┌─ WEBHOOK ────────────────────────┐
│ When: External system POSTs      │
│ Then:                             │
│  • Create record from payload    │
│  • Update matching records       │
│  • Trigger dependent automations │
└────────────────────────────────┘

All automations are:
✓ Idempotent (safe to retry)
✓ Logged (full audit trail)
✓ Monitored (error handling & alerts)
```

---

## 🎮 PERMISSIONS SYSTEM

```
Hierarchical Permissions:

Workspace Level
  ↓
Team → Role → Permissions on Actions
  ├─ view_records: ✓ allowed
  ├─ create_records: ✓ allowed
  ├─ update_records: ✓ allowed
  ├─ delete_records: ✗ denied
  └─ export_records: ✓ allowed

Record Level (more restrictive)
  ├─ view: true
  ├─ update: true
  ├─ delete: false
  ├─ admin: false
  └─ export: true

Final Permission = Most Restrictive Rule
If role allows but record denies → DENIED
```

---

## 📊 FIELD TYPES (30+ Supported)

```
Categorized by Type:

TEXT:
  SHORT_TEXT ────→ "John Doe"
  LONG_TEXT ────→ "Multi-line description..."
  RICH_TEXT ────→ "Formatted <b>text</b>"
  EMAIL ────────→ "john@company.com" [Encrypted]
  PHONE ────────→ "+1 555-1234" [Encrypted]
  URL ──────────→ "https://example.com"

NUMERIC:
  INTEGER ──────→ 100
  DECIMAL ──────→ 99.99 [OPE Encrypted]
  CURRENCY ─────→ $3,000 [OPE Encrypted]
  PERCENTAGE ───→ 50% [OPE Encrypted]
  RATING ───────→ ⭐⭐⭐⭐ (1-5) [Hashed]

DATE/TIME:
  DATE ─────────→ 2024-10-28 [OPE Encrypted]
  DATETIME ─────→ 2024-10-28 10:30 AM [OPE]
  TIME ─────────→ 10:30 AM
  DURATION ─────→ 2 hours 30 mins

SELECTION:
  SELECT_ONE ───→ Choose 1 from list [Hashed]
  SELECT_LIST ──→ Choose multiple [Hashed]
  CHECKBOX ─────→ Yes/No [Hashed]
  RADIO ────────→ Radio buttons
  TAG ──────────→ Multiple tags

REFERENCE:
  REFERENCE ────→ Link to other table record
  USER ─────────→ Link to workspace user
  FILE ─────────→ Upload attachment
  IMAGE ────────→ Upload image

COMPUTED:
  FORMULA ──────→ =salary * 12 (computed)
  ROLLUP ───────→ SUM of related records
  COUNT ────────→ Count of relations
  LOOKUP ───────→ Value from related record
```

---

## 📱 RESPONSIVE LAYOUT

```
Desktop (> 1024px):
┌─────────────────────────────────────────────┐
│ Sidebar (200px) │ Main Content (70%) │ Details (30%) │
│ • Modules       │ • Table/View      │ • Record      │
│ • HRM Suite     │ • Filters         │ • Comments    │
│ • CRM Suite     │ • Records         │ • Attachments │
└─────────────────────────────────────────────┘

Tablet (768-1024px):
┌────────────────────────────────────┐
│ Header (Sidebar in hamburger)      │
├────────────────────────────────────┤
│ Main Content          │ Details    │
│ (2-column layout)     │ (Sidebar)  │
└────────────────────────────────────┘

Mobile (< 768px):
┌─────────────────────┐
│ Header + Menu       │
├─────────────────────┤
│ Main Content        │
│ (Full width)        │
├─────────────────────┤
│ Details (Modal)     │
└─────────────────────┘
```

---

## 🚀 MIGRATION PATH

```
BEFORE (Confusing):
  BEQEEK → Active Tables → HRM → Employee Profile
                    ↑
                    ? What is this?

AFTER (Clear):
  BEQEEK → Modules → HRM Suite → Employee Profile
                ↑
                Clear business containers

Timeline:
  Week 1-2: Rename in UI + docs
  Week 2-3: Deploy & test
  Week 3+:  Monitor adoption
           Plan CRM, Finance suites
           Optimize based on feedback
```

---

## ✅ KEY FEATURES AT A GLANCE

| Feature         | Status | Details                          |
| --------------- | ------ | -------------------------------- |
| **Multi-View**  | ✓      | Table, Kanban, Gantt, Analytics  |
| **E2EE**        | ✓      | AES-256-CBC + OPE + HMAC         |
| **Comments**    | ✓      | Threaded, @mentions, attachments |
| **Automations** | ✓      | Event, scheduled, webhook-based  |
| **Permissions** | ✓      | Team/Role/Record-level access    |
| **Search**      | ✓      | Works on encrypted data          |
| **Pagination**  | ✓      | Cursor-based, efficient          |
| **Mobile**      | ✓      | Responsive design                |
| **Export**      | ✓      | PDF, CSV, Excel                  |
| **API**         | ✓      | RESTful, POST-based RPC          |

---

## 📞 QUICK REFERENCE

```
API Base:
  https://app.o1erp.com/api

Auth:
  POST /auth/post/authenticate → get token

Tables:
  GET  /workspace/{ws}/workflow/get/active_tables
  POST /workspace/{ws}/workflow/post/active_tables
  POST /workspace/{ws}/workflow/patch/active_tables/{tbl}
  POST /workspace/{ws}/workflow/delete/active_tables/{tbl}

Records:
  POST /workspace/{ws}/workflow/get/active_tables/{tbl}/records
  POST /workspace/{ws}/workflow/post/active_tables/{tbl}/records
  POST /workspace/{ws}/workflow/patch/active_tables/{tbl}/records/{rec}
  POST /workspace/{ws}/workflow/delete/active_tables/{tbl}/records/{rec}

Comments:
  GET  /workspace/{ws}/workflow/active_tables/{tbl}/records/{rec}/get/comments
  POST /workspace/{ws}/workflow/active_tables/{tbl}/records/{rec}/post/comments

Auth Header:
  Authorization: Bearer {access_token}
```

---

**END OF QUICK SUMMARY**

This one-page reference covers:
✓ System architecture and naming
✓ Data flow and workflows
✓ All view types visually
✓ Encryption mechanism
✓ Comments and collaboration
✓ Automations
✓ Permissions
✓ Field types
✓ Responsive design
✓ API endpoints
