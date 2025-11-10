# WORKFLOW SYSTEM - COMPREHENSIVE ANALYSIS

## Document Information

- **System**: BEQEEK Workflow Automation Platform
- **Ngày phân tích**: 07/11/2025
- **Modules**: Connectors, Forms, Units (Events)
- **Mục đích**: Business Analysis - Hiểu rõ kiến trúc và use cases

---

## MỤC LỤC

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Module 1: Workflow Connectors](#3-module-1-workflow-connectors)
4. [Module 2: Workflow Forms](#4-module-2-workflow-forms)
5. [Module 3: Workflow Units](#5-module-3-workflow-units)
6. [Integration Flow](#6-integration-flow)
7. [Real-world Use Cases](#7-real-world-use-cases)
8. [Data Flow Analysis](#8-data-flow-analysis)
9. [Technical Implementation](#9-technical-implementation)

---

## 1. EXECUTIVE SUMMARY

### 1.1. Tổng quan hệ thống

**BEQEEK Workflow System** là một nền tảng **No-code/Low-code Automation** cho phép doanh nghiệp xây dựng các quy trình tự động hóa phức tạp mà không cần lập trình viên.

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW SYSTEM                           │
│                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │ CONNECTORS   │   │    FORMS     │   │    UNITS     │   │
│  │              │   │              │   │              │   │
│  │ Kết nối với  │   │ Form Builder │   │ Automation   │   │
│  │ dịch vụ      │   │ Drag & Drop  │   │ Engine       │   │
│  │ bên thứ ba   │   │              │   │ (YAML/Block) │   │
│  └──────────────┘   └──────────────┘   └──────────────┘   │
│         │                   │                   │           │
│         └───────────────────┴───────────────────┘           │
│                             │                                │
│                    ┌────────▼────────┐                      │
│                    │  Active Tables  │                      │
│                    │  (Database)     │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2. 3 Modules chính

| Module         | Purpose                               | Key Features                                                      |
| -------------- | ------------------------------------- | ----------------------------------------------------------------- |
| **Connectors** | Quản lý kết nối với external services | SMTP, Google Sheets, Zalo OA, KiotViet, OAuth2                    |
| **Forms**      | Xây dựng web forms                    | Drag-drop fields, Preview, Embed code                             |
| **Units**      | Automation engine                     | YAML editor, Blockly visual, Schedule/Webhook/Form/Table triggers |

### 1.3. Core Value Proposition

```
┌────────────────────────────────────────────────────────────┐
│  BEFORE (Traditional)          AFTER (BEQEEK Workflow)     │
├────────────────────────────────────────────────────────────┤
│  • Manual copy-paste data      • Auto-sync data           │
│  • Developer required          • Business user can build  │
│  • Weeks to implement          • Hours to setup           │
│  • Rigid, hard to change       • Flexible, visual editor  │
│  • Code maintenance            • No-code configuration    │
└────────────────────────────────────────────────────────────┘
```

---

## 2. SYSTEM ARCHITECTURE

### 2.1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        USER LAYER                             │
├──────────────────────────────────────────────────────────────┤
│  Business User      │  Power User       │  Developer          │
│  (Form Builder)     │  (Blockly Editor) │  (YAML Editor)      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐    │
│  │ Connectors  │  │   Forms     │  │   Workflow Units │    │
│  │   Manager   │  │   Builder   │  │   (Events)       │    │
│  └─────────────┘  └─────────────┘  └──────────────────┘    │
│         │                │                    │              │
│         └────────────────┴────────────────────┘              │
│                          │                                    │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                   INTEGRATION LAYER                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ SMTP     │  │ Google   │  │  Zalo    │  │ Webhooks │    │
│  │ Connector│  │  Sheets  │  │  OA      │  │          │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                      DATA LAYER                               │
├──────────────────────────────────────────────────────────────┤
│  • Active Tables (Database)                                   │
│  • Workflow Configurations                                    │
│  • Connector Credentials (Encrypted)                          │
│  • Execution Logs                                             │
└──────────────────────────────────────────────────────────────┘
```

### 2.2. Module Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                   MODULE RELATIONSHIPS                       │
└─────────────────────────────────────────────────────────────┘

    CONNECTORS                 FORMS                UNITS
        │                         │                    │
        │                         │                    │
        │                         │   ┌────────────────┤
        │                         │   │ Uses Connector │
        │◄────────────────────────────┤ for actions    │
        │                         │   └────────────────┘
        │                         │                    │
        │   ┌─────────────────────┤                    │
        │   │ Trigger via         │                    │
        │   │ Form submission     ├───────────────────►│
        │   └─────────────────────┘                    │
        │                         │                    │
        │   ┌──────────────────────────────────────────┤
        │   │ Trigger via                              │
        └───┤ Table action (custom action từ          │
            │ Active Table)                            │
            └──────────────────────────────────────────┘

Key Integrations:
• Connectors → Referenced in Units for external API calls
• Forms → Can trigger Workflow Events
• Active Tables → Can trigger Workflow Events via custom actions
• Units → Use Connectors to send emails, update sheets, etc.
```

---

## 3. MODULE 1: WORKFLOW CONNECTORS

### 3.1. Purpose

Quản lý các **kết nối đã được cấu hình** tới dịch vụ bên thứ ba. Connectors lưu trữ credentials và config để các Workflow Units có thể sử dụng.

### 3.2. Connector Types

#### 3.2.1. Non-OAuth Connectors

**SMTP Email**

```json
{
  "connectorType": "SMTP",
  "config": {
    "host": "smtp.gmail.com",
    "port": 587,
    "username": "bot@company.com",
    "password": "encrypted_password",
    "from_email": "bot@company.com",
    "from_name": "Company Bot",
    "checkDailyUnique": true,
    "trackingEmail": false
  }
}
```

**KiotViet (POS System)**

```json
{
  "connectorType": "KIOTVIET",
  "config": {
    "clientId": "xxx",
    "clientSecret": "yyy",
    "retailerCode": "MYSHOP",
    "accessToken": "token_123"
  }
}
```

**Active Table**

```json
{
  "connectorType": "ACTIVE_TABLE",
  "config": {
    "tableId": "table_customers_123",
    "tableKey": "encryption_key_32_chars"
  }
}
```

#### 3.2.2. OAuth2 Connectors

**Google Sheets**

```json
{
  "connectorType": "GOOGLE_SHEETS",
  "oauth": true,
  "config": {
    "access_token": "ya29.xxx",
    "expires_in": "3600",
    "refresh_token": "1//xxx",
    "scope": "https://www.googleapis.com/auth/spreadsheets",
    "token_type": "Bearer",
    "created": "1699360800"
  }
}
```

**Zalo OA (Official Account)**

```json
{
  "connectorType": "ZALO_OA",
  "oauth": true,
  "config": {
    "accessToken": "encrypted_token",
    "refreshToken": "encrypted_refresh"
  }
}
```

### 3.3. User Flow

#### Create Connector Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  CREATE CONNECTOR FLOW                       │
└─────────────────────────────────────────────────────────────┘

Step 1: List View
┌────────────────────────────────┐
│ Connectors                 [+] │ ← Click "Create new"
├────────────────────────────────┤
│ • Email Marketing SMTP         │
│ • Customer Sheet (Google)      │
│ • Zalo Notification            │
└────────────────────────────────┘
          │
          ▼
Step 2: Select Type
┌────────────────────────────────┐
│ Select Connector Type          │
├────────────────────────────────┤
│ [SMTP]  [Google Sheets] [Zalo]│ ← Choose type
│                                │
│ [KiotViet] [Active Table]      │
└────────────────────────────────┘
          │
          ▼
Step 3: Basic Info Popup
┌────────────────────────────────┐
│ Create SMTP Connector          │
├────────────────────────────────┤
│ Name: [My Email Bot________]   │
│ Desc: [Send notifications__]   │
│                                │
│           [Cancel] [Create]    │ ← Click Create
└────────────────────────────────┘
          │
          ▼ API: POST /workflow_connectors
          │     Body: { name, description, connectorType }
          ▼
Step 4: Detail View (Auto-navigate)
┌────────────────────────────────┐
│ My Email Bot           [⚙️] [🗑️]│
├────────────────────────────────┤
│ Configuration                  │
│ ┌────────────────────────────┐│
│ │ Host: [smtp.gmail.com____] ││
│ │ Port: [587_______________] ││
│ │ Username: [bot@co.com___] ││
│ │ Password: [***__________] ││
│ │ From Email: [bot@co.com_] ││
│ │ From Name: [Bot_________] ││
│ │ ☐ Check Daily Unique       ││
│ │ ☐ Tracking Email           ││
│ └────────────────────────────┘│
│            [Save]              │ ← Configure and save
└────────────────────────────────┘
          │
          ▼ API: PATCH /workflow_connectors/{id}
          │     Body: { config: {...} }
          ▼
Step 5: Ready to Use!
```

#### OAuth2 Flow (Google Sheets Example)

```
Step 1: Detail View
┌────────────────────────────────┐
│ My Google Sheet Connector      │
├────────────────────────────────┤
│ Configuration                  │
│ ┌────────────────────────────┐│
│ │ [Connect with Google]      ││ ← Click button
│ │                            ││
│ │ access_token: (empty)      ││
│ │ refresh_token: (empty)     ││
│ └────────────────────────────┘│
└────────────────────────────────┘
          │
          ▼ API: POST /workflow_connectors/{id}/oauth2_state
          │     Response: { state: "uuid_123" }
          ▼
Step 2: Redirect to Google
Browser → https://accounts.google.com/o/oauth2/v2/auth
          ?client_id=xxx
          &redirect_uri=https://app.o1erp.com/api/workflow/get/workflow_connectors/oauth2
          &state=uuid_123
          &scope=spreadsheets
          │
          ▼ User grants permission
          │
Step 3: Google Callback
Google → https://app.o1erp.com/api/workflow/get/workflow_connectors/oauth2
         ?code=auth_code_xyz
         &state=uuid_123
          │
          ▼ Backend exchanges code for tokens
          │
Step 4: Auto-update Config
Backend saves tokens to connector config
          │
          ▼
Step 5: Return to Detail View
┌────────────────────────────────┐
│ My Google Sheet Connector      │
├────────────────────────────────┤
│ Configuration                  │
│ ┌────────────────────────────┐│
│ │ ✅ Connected!              ││
│ │                            ││
│ │ access_token: ya29.xxx...  ││
│ │ refresh_token: 1//xxx...   ││
│ │ expires_in: 3600           ││
│ └────────────────────────────┘│
└────────────────────────────────┘
```

### 3.4. Data Structure

```typescript
// Static data (hardcoded in frontend)
interface ConnectorType {
  type: string; // "SMTP", "GOOGLE_SHEETS", etc.
  name: string; // Display name
  description: string;
  logo: string; // Icon URL
}

interface ConnectorConfigDefinition {
  connectorType: string;
  oauth: boolean; // OAuth2 or manual config?
  configFields: Array<{
    name: string; // Field name in config object
    type: string; // "text", "password", "number", "checkbox"
    label: string; // Display label
    required: boolean;
    secret?: boolean; // Should encrypt this field?
    readonly?: boolean; // For OAuth tokens
  }>;
}

// Dynamic data (from API)
interface ConnectorInstance {
  id: string;
  name: string; // User-defined name
  description: string;
  connectorType: string; // FK to ConnectorType.type
  config: {
    // Dynamic based on connectorType
    [key: string]: any;
  };
  documentation?: string; // Markdown guide from backend
}
```

### 3.5. API Endpoints

All use POST method with prefix `/api/workspace/{workspaceId}/workflow/`

| Action         | Endpoint                                                                | Purpose               |
| -------------- | ----------------------------------------------------------------------- | --------------------- |
| List           | `POST /get/workflow_connectors`                                         | Get all connectors    |
| Get            | `POST /get/workflow_connectors/{id}`                                    | Get one connector     |
| Create         | `POST /post/workflow_connectors`                                        | Create new connector  |
| Update         | `POST /patch/workflow_connectors/{id}`                                  | Update config         |
| Delete         | `POST /delete/workflow_connectors/{id}`                                 | Delete connector      |
| OAuth Start    | `POST /get/workflow_connectors/{id}/oauth2_state`                       | Get OAuth state       |
| OAuth Callback | `GET https://app.o1erp.com/api/workflow/get/workflow_connectors/oauth2` | Handle OAuth callback |

---

## 4. MODULE 2: WORKFLOW FORMS

### 4.1. Purpose

**Visual Form Builder** cho phép users tạo web forms mà không cần code. Forms này có thể:

- Embed vào website
- Trigger workflow khi submit
- Collect data vào Active Tables

### 4.2. Form Types & Templates

```javascript
// Hardcoded templates in frontend
const FormTemplates = {
  BASIC: {
    title: 'Form Cơ bản',
    fields: [
      {
        type: 'text',
        label: 'Họ và Tên',
        name: 'fullName',
        required: true,
        placeholder: 'Nhập họ và tên',
      },
      {
        type: 'email',
        label: 'Email',
        name: 'email',
        required: true,
        placeholder: 'Nhập địa chỉ email',
      },
    ],
    submitButton: { text: 'Gửi' },
  },

  REGISTRATION: {
    title: 'Form Đăng ký',
    fields: [
      { type: 'text', label: 'Họ và Tên', name: 'fullName', required: true },
      { type: 'email', label: 'Email', name: 'email', required: true },
      { type: 'tel', label: 'Số điện thoại', name: 'phone', required: true },
      {
        type: 'select',
        label: 'Bạn biết chúng tôi qua?',
        name: 'source',
        required: false,
        options: [
          { value: 'facebook', text: 'Facebook' },
          { value: 'google', text: 'Google' },
          { value: 'friend', text: 'Bạn bè giới thiệu' },
        ],
      },
    ],
    submitButton: { text: 'Đăng ký ngay' },
  },
};
```

### 4.3. Field Types

| Type       | HTML Input                      | Use Case       | Options                  |
| ---------- | ------------------------------- | -------------- | ------------------------ |
| `text`     | `<input type="text">`           | Short text     | -                        |
| `email`    | `<input type="email">`          | Email address  | -                        |
| `number`   | `<input type="number">`         | Numeric values | -                        |
| `tel`      | `<input type="tel">`            | Phone numbers  | -                        |
| `textarea` | `<textarea>`                    | Long text      | -                        |
| `select`   | `<select>`                      | Dropdown       | Requires `options` array |
| `checkbox` | `<input type="checkbox">`       | Yes/No         | -                        |
| `date`     | `<input type="date">`           | Date picker    | -                        |
| `datetime` | `<input type="datetime-local">` | Date + Time    | -                        |

### 4.4. Form Builder UI

```
┌─────────────────────────────────────────────────────────────┐
│              FORM BUILDER INTERFACE                          │
└─────────────────────────────────────────────────────────────┘

┌────────────────────────┬─────────────────────────────────────┐
│  CONFIGURATION         │         PREVIEW                     │
│  (Left Panel)          │      (Right Panel - Live)           │
├────────────────────────┼─────────────────────────────────────┤
│                        │  ┌───────────────────────────────┐  │
│ Form ID: form_123      │  │ Contact Form                  │  │
│ (readonly, copy)       │  ├───────────────────────────────┤  │
│                        │  │ Họ và Tên *                   │  │
│ Submit Button:         │  │ [____________________]        │  │
│ [Send Information___]  │  │                               │  │
│                        │  │ Email *                       │  │
│ ─────────────────────  │  │ [____________________]        │  │
│                        │  │                               │  │
│ Fields:                │  │ Message                       │  │
│                        │  │ [____________________]        │  │
│ 1. Text Field          │  │ [____________________]        │  │
│    • Label: Họ và Tên  │  │                               │  │
│    • Required: ☑       │  │      [Send Information]       │  │
│    [Edit] [Delete]     │  └───────────────────────────────┘  │
│                        │                                     │
│ 2. Email Field         │  ↑ Changes reflect immediately      │
│    • Label: Email      │                                     │
│    • Required: ☑       │                                     │
│    [Edit] [Delete]     │                                     │
│                        │                                     │
│ 3. Textarea            │                                     │
│    • Label: Message    │                                     │
│    • Required: ☐       │                                     │
│    [Edit] [Delete]     │                                     │
│                        │                                     │
│ [+ Add Field]          │                                     │
│                        │                                     │
│ ─────────────────────  │                                     │
│                        │                                     │
│ [⚙️ Settings] [🗑️ Delete]│                                    │
│                        │                                     │
│         [Save]         │                                     │
└────────────────────────┴─────────────────────────────────────┘
```

### 4.5. User Flow

#### Create Form

```
Step 1: List View → Click [+ Create Form]
Step 2: Select Template → Choose "Contact Form"
Step 3: Basic Info Popup → Name + Description
Step 4: Auto-navigate to Form Builder
Step 5: Customize fields (add/edit/delete/reorder)
Step 6: Save → Form ready to embed
```

#### Add/Edit Field Flow

```
Click [+ Add Field] or [Edit] on existing field
          │
          ▼
┌────────────────────────────────┐
│ Field Configuration            │
├────────────────────────────────┤
│ Type: [Text ▼]                 │ ← Choose type
│ Label: [Full Name_________]    │
│ Name: [fullName___________]    │ ← Auto-generated
│ Placeholder: [Enter name__]    │
│ Default: [________________]    │
│ ☑ Required                     │
│                                │
│ [For SELECT type only]         │
│ Options:                       │
│  • Value: social, Text: Facebook │
│  • Value: google, Text: Google   │
│  [+ Add option]                │
│                                │
│        [Cancel] [Confirm]      │
└────────────────────────────────┘
          │
          ▼ Field added/updated
          │
Preview updates immediately →
```

### 4.6. Data Structure

```typescript
interface FormInstance {
  id: string;
  name: string; // User-defined
  description: string;
  formType: string; // "BASIC", "REGISTRATION", etc.
  config: {
    title: string;
    fields: Field[];
    submitButton: {
      text: string;
    };
  };
}

interface Field {
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'datetime';
  label: string; // Display label
  name: string; // Variable name (auto-generated if empty)
  placeholder?: string;
  defaultValue?: string;
  required: boolean;
  options?: Option[]; // Only for SELECT type
}

interface Option {
  value: string; // Internal value
  text: string; // Display text
}
```

### 4.7. Form Submission Flow

```
User fills form on website
          │
          ▼
POST /api/form_submission
Body: {
  formId: "form_contact_123",
  data: {
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    message: "Hello!"
  }
}
          │
          ▼
Backend saves to database
          │
          ▼
Triggers Workflow Event (if configured)
          │
          ▼ Workflow Unit processes submission
          │
Example: Send confirmation email via SMTP Connector
```

---

## 5. MODULE 3: WORKFLOW UNITS

### 5.1. Purpose

**Core automation engine** - Xây dựng workflows tự động hóa phức tạp với:

- Visual editor (Blockly) cho business users
- Code editor (YAML) cho power users
- Kết nối với Connectors và Forms
- Real-time monitoring

### 5.2. Hierarchy

```
Workspace
    │
    ├── Workflow Unit 1 (Container/Folder)
    │   ├── Event 1 (Trigger: Schedule)
    │   ├── Event 2 (Trigger: Webhook)
    │   └── Event 3 (Trigger: Form Submit)
    │
    ├── Workflow Unit 2
    │   ├── Event 4 (Trigger: Active Table Action)
    │   └── Event 5 (Trigger: Schedule)
    │
    └── Workflow Unit 3
        └── Event 6
```

### 5.3. Event Triggers (4 Types)

#### Trigger 1: SCHEDULE (Cron)

**Use Case**: Chạy task định kỳ (daily report, cleanup data, etc.)

```json
{
  "eventSourceType": "SCHEDULE",
  "eventSourceParams": {
    "expression": "0 9 * * 1-5" // 9 AM, Monday-Friday
  }
}
```

**Cron Examples**:

- `*/5 * * * *` - Every 5 minutes
- `0 0 * * *` - Daily at midnight
- `0 9 * * 1-5` - 9 AM on weekdays
- `0 0 1 * *` - First day of month

---

#### Trigger 2: WEBHOOK

**Use Case**: External system gọi vào để trigger workflow

```json
{
  "eventSourceType": "WEBHOOK",
  "eventSourceParams": {
    "webhookId": "uuid-webhook-abc123"
  }
}
```

**Generated Webhook URL**:

```
https://app.o1erp.com/api/webhook/uuid-webhook-abc123
```

**Usage**:

```bash
# External system calls this URL
curl -X POST https://app.o1erp.com/api/webhook/uuid-webhook-abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORD-001",
    "customer": "John Doe",
    "total": 1500000
  }'
```

**Workflow receives data in `input` variable**:

```yaml
stages:
  - name: process_webhook
    blocks:
      - type: log
        name: log_order
        input:
          message: 'New order: $[input.order_id]'
```

---

#### Trigger 3: OPTIN_FORM

**Use Case**: Form submission trigger automation

```json
{
  "eventSourceType": "OPTIN_FORM",
  "eventSourceParams": {
    "formId": "form_contact_123",
    "webhookId": "uuid-form-webhook-xyz",
    "actionId": "uuid-form-action-abc"
  }
}
```

**Flow**:

```
User submits form
    ↓
Form data saved to DB
    ↓
Webhook triggered
    ↓
Workflow Event executes
    ↓ Receives form data
{
  "formId": "form_contact_123",
  "data": {
    "fullName": "Nguyễn Văn A",
    "email": "nguyenvana@email.com",
    "phone": "0901234567"
  }
}
```

---

#### Trigger 4: ACTIVE_TABLE

**Use Case**: Custom action on Active Table triggers workflow

```json
{
  "eventSourceType": "ACTIVE_TABLE",
  "eventSourceParams": {
    "tableId": "table_orders_123",
    "actionId": "approve_order",
    "webhookId": "approve_order" // Same as actionId
  }
}
```

**Connection to Active Tables Custom Actions**:

Nhớ custom actions từ Active Tables không? Khi user click custom action button:

```
User clicks "Approve Order" button
    ↓
Frontend: POST /records/{id}/action/approve_order
    ↓
Backend checks: Is there a Workflow Event with this trigger?
    ↓ YES
Backend triggers Workflow Event
    ↓ Passes record data
{
  "tableId": "table_orders_123",
  "recordId": "order_001",
  "workflowData": {
    "id": "order_001",
    "record": {
      "customer_name": "Nguyễn Văn A",
      "total_amount": 1000000,
      "status": "pending"
    }
  }
}
```

**Workflow receives full record data**!

---

### 5.4. YAML Logic Structure

#### Basic Structure

```yaml
stages:
  - name: stage_1
    blocks:
      - type: block_type
        name: block_name
        input:
          param1: value1
          param2: value2
```

#### 13 Block Types

**1. Log** - Ghi log output

```yaml
- type: log
  name: log_start
  input:
    message: 'Processing order $[input.id]'
    level: info # info, warning, error
    context:
      order_id: $[input.id]
```

**2. Table Operations** - CRUD on Active Tables

```yaml
# Get list
- type: table
  name: get_customers
  input:
    connector: 'table_connector_id'
    action: get_list
    query:
      filter: { status: 'active' }
      sort: ['created_at:desc']
      limit: 10

# Get one
- type: table
  name: get_customer
  input:
    connector: 'table_connector_id'
    action: get_one
    record: 'record_id_123'

# Create
- type: table
  name: create_customer
  input:
    connector: 'table_connector_id'
    action: create
    data:
      name: 'John Doe'
      email: 'john@example.com'

# Update
- type: table
  name: update_customer
  input:
    connector: 'table_connector_id'
    action: update
    record: 'record_id_123'
    data:
      status: 'inactive'

# Delete
- type: table
  name: delete_customer
  input:
    connector: 'table_connector_id'
    action: delete
    record: 'record_id_123'

# Comment operations
- type: table
  name: add_comment
  input:
    connector: 'table_connector_id'
    action: comment_create
    record: 'record_id_123'
    content: 'This is a comment'
```

**3. SMTP Email** - Send emails

```yaml
- type: smtp_email
  name: send_notification
  input:
    connector: 'smtp_connector_id'
    to: 'customer@example.com'
    toName: 'Customer Name'
    subject: 'Order Confirmation'
    body: |
      Hello {{ .workflowData.customer_name }},
      Your order #{{ .workflowData.order_id }} has been confirmed.
```

**4. Loop** - Iterate arrays

```yaml
- type: loop
  name: loop_orders
  input:
    array: '{{ .workflowData.orders }}'
    iterator: order
  blocks:
    - type: log
      name: log_order
      input:
        message: 'Processing order $[order.id]'
```

**5. Condition** - If/Else logic

```yaml
- type: condition
  name: check_total
  input:
    expressions:
      - operator: greater_than_or_equals
        operand: '{{ .workflowData.total }}'
        value: 1000000
  then:
    - type: log
      name: log_vip
      input:
        message: 'VIP order!'
  else:
    - type: log
      name: log_regular
      input:
        message: 'Regular order'
```

**Operators**:

- `equals`, `not_equals`
- `greater_than`, `greater_than_or_equals`
- `less_than`, `less_than_or_equals`
- `contains`, `not_contains`
- `starts_with`, `ends_with`
- `and`, `or` (for grouping)

**6. Match** - Switch/Case

```yaml
- type: match
  name: route_by_department
  input:
    value: $[input.department]
    cases:
      - pattern: 'sales'
        then:
          - type: log
            input:
              message: 'Route to Sales'
      - pattern: 'support'
        then:
          - type: log
            input:
              message: 'Route to Support'
      - pattern: '*' # Default case
        then:
          - type: log
            input:
              message: 'Unknown department'
```

**7. Math** - Calculations

```yaml
- type: math
  name: calculate_total
  input:
    aggregate: sum # sum, average, min, max
    expressions:
      - operator: multiply
        left: '{{ .workflowData.price }}'
        right: '{{ .workflowData.quantity }}'
      - operator: add
        left: 0
        right: '{{ .workflowData.shipping_fee }}'
```

**8. Definition** - Declare variables

```yaml
- type: definition
  name: customer_info
  input:
    data:
      full_name: '{{ .workflowData.customer_name }}'
      contact_email: '{{ .workflowData.email }}'
      total_orders: 5
```

**9. API Call** - External HTTP requests

```yaml
- type: api_call
  name: call_weather_api
  input:
    url: 'https://api.weather.com/v1/current'
    method: POST # GET, POST, PUT, DELETE
    request_type: json # json, form_params, multipart
    response_format: json # json, text, base64
    headers:
      Authorization: 'Bearer {{ .config.api_key }}'
      X-Custom-Header: 'value'
    payload:
      city: 'Hanoi'
      units: 'metric'
```

**10. Delay** - Wait/Sleep

```yaml
- type: delay
  name: wait_5_minutes
  input:
    duration:
      value: 5
      unit: minutes # seconds, minutes, hours, days
  callback: 'check_payment_status'
```

**11. User Operations** - Get workspace users

```yaml
# Get list
- type: user
  name: get_admins
  input:
    action: get_list
    query:
      filter: { role: 'admin' }

# Get one
- type: user
  name: get_user
  input:
    action: get_one
    id: 'user_id_123'
```

**12. Google Sheets** - Spreadsheet operations

```yaml
# Create sheet
- type: google_sheet
  name: create_report
  input:
    connector: 'google_sheets_connector_id'
    action: sheet_create
    title: 'Monthly Report'

# Append data
- type: google_sheet
  name: add_data
  input:
    connector: 'google_sheets_connector_id'
    action: sheet_append
    sheet_id: 'spreadsheet_id'
    range: 'A1'
    values:
      - ['Name', 'Email', 'Phone']
      - ['John', 'john@ex.com', '123']

# Read data
- type: google_sheet
  name: read_data
  input:
    connector: 'google_sheets_connector_id'
    action: sheet_read
    sheet_id: 'spreadsheet_id'
    range: 'A1:C10'

# Update data
- type: google_sheet
  name: update_data
  input:
    connector: 'google_sheets_connector_id'
    action: sheet_update
    sheet_id: 'spreadsheet_id'
    range: 'A2'
    values:
      - ['Jane', 'jane@ex.com', '456']
```

**13. Nested Blocks** - Conditions/Loops can contain other blocks

### 5.5. Variable Interpolation

**3 syntaxes**:

```yaml
# 1. Go template syntax: {{ .path.to.value }}
message: 'Hello {{ .workflowData.customer_name }}'

# 2. Dollar bracket: $[path.to.value]
message: 'Order ID: $[input.order_id]'

# 3. Direct reference in input
operand: '{{ .workflowData.total }}'
```

**Available variables**:

- `input` - Trigger data (webhook payload, form data, etc.)
- `workflowData` - Same as input (alias)
- `config` - Workflow configuration
- `stages.stage_name.block_name` - Output from previous blocks

---

## 6. INTEGRATION FLOW

### 6.1. Complete End-to-End Example

**Scenario**: Khi user submit form liên hệ → Gửi email notification → Lưu vào Google Sheet

#### Setup Phase

**Step 1: Create SMTP Connector**

```
Connectors → [+ Create] → Select SMTP
→ Name: "Notification Email"
→ Configure: smtp.gmail.com, port 587, credentials
→ Save
```

**Step 2: Create Google Sheets Connector**

```
Connectors → [+ Create] → Select Google Sheets
→ Name: "Contact Leads Sheet"
→ [Connect with Google] → OAuth flow
→ Tokens saved automatically
```

**Step 3: Create Contact Form**

```
Forms → [+ Create] → Select "Contact Form" template
→ Name: "Website Contact Form"
→ Add fields: Name, Email, Phone, Message
→ Save
→ Form ID: form_contact_123
```

**Step 4: Create Workflow Unit**

```
Workflow Units → [+ Create]
→ Name: "Contact Form Handler"
→ Description: "Process contact form submissions"
```

**Step 5: Create Workflow Event**

```
Inside "Contact Form Handler" Unit
→ [+ Add Event]
→ Event Name: "On Contact Form Submit"
→ Trigger Type: OPTIN_FORM
→ Select Form: "Website Contact Form" (form_contact_123)
→ Edit YAML logic...
```

#### YAML Logic

```yaml
stages:
  # Stage 1: Log submission
  - name: log_submission
    blocks:
      - type: log
        name: log_contact
        input:
          message: 'New contact form submission from $[input.data.fullName]'
          level: info
          context:
            email: $[input.data.email]
            phone: $[input.data.phone]

  # Stage 2: Send email notification to admin
  - name: send_notification
    blocks:
      - type: smtp_email
        name: notify_admin
        input:
          connector: 'smtp_connector_notification_email'
          to: 'admin@company.com'
          toName: 'Admin'
          subject: 'New Contact Form Submission'
          body: |
            New contact form submission:

            Name: {{ .input.data.fullName }}
            Email: {{ .input.data.email }}
            Phone: {{ .input.data.phone }}
            Message: {{ .input.data.message }}

            Please follow up within 24 hours.

  # Stage 3: Send confirmation email to customer
  - name: send_confirmation
    blocks:
      - type: smtp_email
        name: confirm_customer
        input:
          connector: 'smtp_connector_notification_email'
          to: '{{ .input.data.email }}'
          toName: '{{ .input.data.fullName }}'
          subject: 'Thank you for contacting us'
          body: |
            Dear {{ .input.data.fullName }},

            Thank you for reaching out! We have received your message and will get back to you within 24 hours.

            Best regards,
            Customer Support Team

  # Stage 4: Save to Google Sheets
  - name: save_to_sheet
    blocks:
      - type: google_sheet
        name: append_lead
        input:
          connector: 'google_sheets_connector_contact_leads'
          action: sheet_append
          sheet_id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
          range: 'A1'
          values:
            - - '{{ .input.data.fullName }}'
              - '{{ .input.data.email }}'
              - '{{ .input.data.phone }}'
              - '{{ .input.data.message }}'
              - '{{ now "2006-01-02 15:04:05" }}'

  # Stage 5: Log completion
  - name: log_completion
    blocks:
      - type: log
        name: log_done
        input:
          message: 'Contact form processing completed for $[input.data.fullName]'
          level: info
```

#### Runtime Flow

```
1. User visits website
2. Fills contact form
3. Clicks "Send"
   ↓
4. Form submission:
   POST /api/form_submission
   {
     formId: "form_contact_123",
     data: {
       fullName: "Nguyễn Văn A",
       email: "nguyenvana@email.com",
       phone: "0901234567",
       message: "Tôi muốn tư vấn về sản phẩm X"
     }
   }
   ↓
5. Backend saves form data
   ↓
6. Backend checks: Is there Workflow Event for form_contact_123?
   → YES: "On Contact Form Submit" event
   ↓
7. Backend triggers Workflow Event
   ↓
8. Workflow execution:

   Stage 1: Log submission ✓
   → Console: "New contact form submission from Nguyễn Văn A"

   Stage 2: Send admin notification ✓
   → SMTP Connector sends email to admin@company.com

   Stage 3: Send customer confirmation ✓
   → SMTP Connector sends email to nguyenvana@email.com

   Stage 4: Save to Google Sheets ✓
   → Google Sheets Connector appends row:
     | Nguyễn Văn A | nguyenvana@email.com | 0901234567 | Tôi muốn... | 2025-11-07 14:30:00 |

   Stage 5: Log completion ✓
   → Console: "Contact form processing completed"
   ↓
9. User sees success message on website
10. Admin receives notification email
11. Customer receives confirmation email
12. Lead saved in Google Sheet for tracking
```

#### Real-time Monitoring

**WebSocket Console** shows live execution:

```
[14:30:15] INFO: New contact form submission from Nguyễn Văn A
           Context: {email: "nguyenvana@email.com", phone: "0901234567"}

[14:30:16] Executing block: notify_admin (smtp_email)
[14:30:17] ✓ Email sent to admin@company.com

[14:30:17] Executing block: confirm_customer (smtp_email)
[14:30:18] ✓ Email sent to nguyenvana@email.com

[14:30:18] Executing block: append_lead (google_sheet)
[14:30:19] ✓ Row appended to sheet 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms

[14:30:19] INFO: Contact form processing completed for Nguyễn Văn A

[14:30:19] Workflow completed successfully
```

---

## 7. REAL-WORLD USE CASES

### 7.1. Use Case 1: E-commerce Order Processing

**Scenario**: Tự động xử lý đơn hàng từ website

**Setup**:

- Trigger: WEBHOOK (từ e-commerce platform)
- Connectors: SMTP, Active Table (Orders), Google Sheets

**Flow**:

```yaml
stages:
  - name: validate_order
    blocks:
      - type: condition
        name: check_payment
        input:
          expressions:
            - operator: equals
              operand: '{{ .input.payment_status }}'
              value: 'paid'
        then:
          - type: log
            input:
              message: 'Payment confirmed for order $[input.order_id]'
        else:
          - type: log
            input:
              message: 'Payment pending, skipping processing'
              level: warning
          # Stop here if not paid

  - name: save_order
    blocks:
      - type: table
        name: create_order_record
        input:
          connector: 'orders_table_connector'
          action: create
          data:
            order_id: '{{ .input.order_id }}'
            customer_name: '{{ .input.customer.name }}'
            customer_email: '{{ .input.customer.email }}'
            total_amount: '{{ .input.total }}'
            items: '{{ .input.items }}'
            status: 'processing'

  - name: notify_customer
    blocks:
      - type: smtp_email
        name: send_confirmation
        input:
          connector: 'smtp_connector'
          to: '{{ .input.customer.email }}'
          subject: 'Order Confirmation #{{ .input.order_id }}'
          body: |
            Thank you for your order!

            Order ID: {{ .input.order_id }}
            Total: {{ .input.total }} VND

            We'll process your order soon.

  - name: notify_warehouse
    blocks:
      - type: smtp_email
        name: alert_warehouse
        input:
          connector: 'smtp_connector'
          to: 'warehouse@company.com'
          subject: 'New Order to Process'
          body: |
            New order received:
            Order ID: {{ .input.order_id }}
            Items: {{ .input.items }}

            Please prepare for shipping.

  - name: log_to_sheet
    blocks:
      - type: google_sheet
        name: append_order
        input:
          connector: 'google_sheets_connector'
          action: sheet_append
          sheet_id: 'daily_orders_sheet_id'
          range: 'A1'
          values:
            - - '{{ .input.order_id }}'
              - '{{ .input.customer.name }}'
              - '{{ .input.total }}'
              - '{{ now "2006-01-02" }}'
```

### 7.2. Use Case 2: Lead Nurturing Campaign

**Scenario**: Auto follow-up leads sau khi đăng ký

**Setup**:

- Trigger: OPTIN_FORM (registration form)
- Connectors: SMTP, Active Table (Leads)
- Delay: Wait 1 day before follow-up

**Flow**:

```yaml
stages:
  - name: save_lead
    blocks:
      - type: table
        name: create_lead
        input:
          connector: 'leads_table_connector'
          action: create
          data:
            name: '{{ .input.data.fullName }}'
            email: '{{ .input.data.email }}'
            phone: '{{ .input.data.phone }}'
            source: '{{ .input.data.source }}'
            status: 'new'
            created_at: '{{ now "2006-01-02 15:04:05" }}'

  - name: send_welcome_email
    blocks:
      - type: smtp_email
        name: welcome_message
        input:
          connector: 'smtp_connector'
          to: '{{ .input.data.email }}'
          subject: 'Welcome! Here\'s your free guide'
          body: |
            Hi {{ .input.data.fullName }},

            Thank you for signing up! Here's your free guide...

  - name: wait_1_day
    blocks:
      - type: delay
        name: delay_24h
        input:
          duration:
            value: 24
            unit: hours
        callback: 'send_followup'

  - name: send_followup
    blocks:
      - type: smtp_email
        name: followup_email
        input:
          connector: 'smtp_connector'
          to: '{{ .input.data.email }}'
          subject: 'Did you find the guide helpful?'
          body: |
            Hi {{ .input.data.fullName }},

            I wanted to check if you had a chance to read the guide...
```

### 7.3. Use Case 3: Customer Support Ticket Routing

**Scenario**: Tự động route support tickets based on category

**Setup**:

- Trigger: ACTIVE_TABLE (when ticket created)
- Connectors: SMTP, Active Table (Tickets)

**Flow**:

```yaml
stages:
  - name: route_ticket
    blocks:
      - type: match
        name: route_by_category
        input:
          value: $[input.workflowData.record.category]
          cases:
            - pattern: 'technical'
              then:
                - type: table
                  name: assign_to_tech
                  input:
                    connector: 'tickets_table_connector'
                    action: update
                    record: '{{ .input.recordId }}'
                    data:
                      assigned_team: 'Technical Support'
                      assigned_user: 'tech_lead_id'

                - type: smtp_email
                  name: notify_tech_team
                  input:
                    connector: 'smtp_connector'
                    to: 'tech@company.com'
                    subject: 'New Technical Ticket #{{ .input.recordId }}'
                    body: |
                      New technical support ticket assigned to you.

                      Customer: {{ .input.workflowData.record.customer_name }}
                      Issue: {{ .input.workflowData.record.description }}

            - pattern: 'billing'
              then:
                - type: table
                  name: assign_to_billing
                  input:
                    connector: 'tickets_table_connector'
                    action: update
                    record: '{{ .input.recordId }}'
                    data:
                      assigned_team: 'Billing Support'
                      assigned_user: 'billing_lead_id'

                - type: smtp_email
                  name: notify_billing_team
                  input:
                    connector: 'smtp_connector'
                    to: 'billing@company.com'
                    subject: 'New Billing Ticket'
                    body: 'New billing ticket...'

            - pattern: '*'
              then:
                - type: smtp_email
                  name: notify_general
                  input:
                    connector: 'smtp_connector'
                    to: 'support@company.com'
                    subject: 'New General Support Ticket'
                    body: 'General support ticket...'
```

---

## 8. DATA FLOW ANALYSIS

### 8.1. Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA FLOW ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────┘

External Triggers                Internal Triggers
┌──────────────┐               ┌──────────────────┐
│  Cron Jobs   │               │  Form Submit     │
│  Webhooks    │               │  Table Action    │
└──────┬───────┘               └────────┬─────────┘
       │                                │
       └────────────┬───────────────────┘
                    │
                    ▼
          ┌─────────────────────┐
          │  Workflow Event     │
          │  (Trigger Handler)  │
          └─────────────────────┘
                    │
                    ▼
          ┌─────────────────────┐
          │   YAML Executor     │
          │  (Parse & Execute)  │
          └─────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
   ┌────────┐ ┌────────┐ ┌─────────┐
   │ Table  │ │ SMTP   │ │ Google  │
   │ Ops    │ │ Send   │ │ Sheets  │
   └────────┘ └────────┘ └─────────┘
        │           │           │
        └───────────┼───────────┘
                    │
                    ▼
          ┌─────────────────────┐
          │   WebSocket         │
          │   (Real-time Logs)  │
          └─────────────────────┘
                    │
                    ▼
          ┌─────────────────────┐
          │   User Console      │
          │   (Monitoring UI)   │
          └─────────────────────┘
```

### 8.2. Connector Usage Flow

```
Workflow Event needs to send email
          │
          ▼
YAML: type: smtp_email
      connector: 'smtp_connector_abc123'
          │
          ▼
Workflow Executor fetches Connector
          │
          ▼ API: GET /workflow_connectors/abc123
          │
Response: {
  "config": {
    "host": "smtp.gmail.com",
    "port": 587,
    "username": "bot@company.com",
    "password": "encrypted_pass"
  }
}
          │
          ▼
Workflow Executor uses credentials to send email
          │
          ▼ SMTP connection established
          │
Email sent successfully
```

### 8.3. Form → Workflow Integration

```
User submits form on website
          │
          ▼ POST /api/form_submission
          │
Backend:
1. Validate form data
2. Save to database
3. Check: Is there Workflow Event for this formId?
          │
          ▼ Query: SELECT * FROM workflow_events
          │        WHERE eventSourceType = 'OPTIN_FORM'
          │        AND eventSourceParams.formId = form_id
          │
Found Event: event_xyz
          │
          ▼
4. Trigger Workflow Event
   Pass form data as input:
   {
     "formId": "form_abc",
     "data": {
       "fullName": "...",
       "email": "..."
     }
   }
          │
          ▼
Workflow executes stages
```

### 8.4. Active Table Action → Workflow Integration

```
User clicks custom action in Active Table
          │
          ▼ POST /records/{id}/action/{actionId}
          │
Backend:
1. Validate permissions
2. Check: Is there Workflow Event for this action?
          │
          ▼ Query: SELECT * FROM workflow_events
          │        WHERE eventSourceType = 'ACTIVE_TABLE'
          │        AND eventSourceParams.actionId = action_id
          │
Found Event: event_abc
          │
          ▼
3. Trigger Workflow Event
   Pass record data as workflowData:
   {
     "tableId": "table_123",
     "recordId": "record_456",
     "workflowData": {
       "id": "record_456",
       "record": {
         "customer_name": "...",
         "total_amount": 1000000
       }
     }
   }
          │
          ▼
Workflow executes
```

---

## 9. TECHNICAL IMPLEMENTATION

### 9.1. Frontend Architecture

```
Components:
├── Connectors/
│   ├── ConnectorList.vue
│   ├── ConnectorSelect.vue (Choose type)
│   ├── ConnectorDetail.vue
│   └── ConnectorConfigForm.vue (Dynamic fields)
│
├── Forms/
│   ├── FormList.vue
│   ├── FormBuilder.vue (Split view)
│   │   ├── ConfigPanel.vue (Left)
│   │   └── PreviewPanel.vue (Right)
│   ├── FieldEditor.vue (Add/Edit field popup)
│   └── FormSelect.vue
│
└── WorkflowUnits/
    ├── UnitList.vue
    ├── UnitDetail.vue (Container for events)
    ├── EventList.vue
    └── EventEditor.vue
        ├── TriggerConfig.vue (SCHEDULE/WEBHOOK/FORM/TABLE)
        ├── YAMLEditor.vue (Monaco editor)
        ├── BlocklyEditor.vue (Visual blocks)
        └── ConsoleViewer.vue (WebSocket logs)
```

### 9.2. Backend Architecture

```
API Endpoints:
├── /api/workspace/{workspaceId}/workflow/
│   │
│   ├── Connectors
│   │   ├── POST /get/workflow_connectors
│   │   ├── POST /get/workflow_connectors/{id}
│   │   ├── POST /post/workflow_connectors
│   │   ├── POST /patch/workflow_connectors/{id}
│   │   ├── POST /delete/workflow_connectors/{id}
│   │   └── POST /get/workflow_connectors/{id}/oauth2_state
│   │
│   ├── Forms
│   │   ├── POST /get/workflow_forms
│   │   ├── POST /get/workflow_forms/{id}
│   │   ├── POST /post/workflow_forms
│   │   ├── POST /patch/workflow_forms/{id}
│   │   └── POST /delete/workflow_forms/{id}
│   │
│   └── Workflow Units
│       ├── POST /get/workflow_units
│       ├── POST /get/workflow_units/{id}
│       ├── POST /post/workflow_units
│       ├── POST /patch/workflow_units/{id}
│       ├── POST /delete/workflow_units/{id}
│       │
│       └── Events
│           ├── POST /get/workflow_events
│           ├── POST /get/workflow_events/{id}
│           ├── POST /post/workflow_events
│           ├── POST /patch/workflow_events/{id}
│           └── POST /delete/workflow_events/{id}
│
└── Public APIs
    ├── POST /api/form_submission (Form submit handler)
    ├── POST /api/webhook/{webhookId} (Webhook receiver)
    └── GET /api/workflow/get/workflow_connectors/oauth2 (OAuth callback)
```

### 9.3. Database Schema (Simplified)

```sql
-- Connectors
CREATE TABLE workflow_connectors (
    id VARCHAR(50) PRIMARY KEY,
    workspace_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    connector_type VARCHAR(50) NOT NULL,
    config JSON NOT NULL,  -- Dynamic based on type
    documentation TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Forms
CREATE TABLE workflow_forms (
    id VARCHAR(50) PRIMARY KEY,
    workspace_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    form_type VARCHAR(50) NOT NULL,
    config JSON NOT NULL,  -- Contains fields array
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Workflow Units
CREATE TABLE workflow_units (
    id VARCHAR(50) PRIMARY KEY,
    workspace_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Workflow Events
CREATE TABLE workflow_events (
    id VARCHAR(50) PRIMARY KEY,
    workspace_id VARCHAR(50) NOT NULL,
    workflow_unit_id VARCHAR(50) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    event_source_type ENUM('SCHEDULE', 'WEBHOOK', 'OPTIN_FORM', 'ACTIVE_TABLE'),
    event_source_params JSON NOT NULL,
    event_active BOOLEAN DEFAULT true,
    yaml TEXT NOT NULL,  -- YAML logic
    response_id VARCHAR(50),  -- For WebSocket
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (workflow_unit_id) REFERENCES workflow_units(id)
);

-- Form Submissions (for tracking)
CREATE TABLE form_submissions (
    id VARCHAR(50) PRIMARY KEY,
    form_id VARCHAR(50) NOT NULL,
    data JSON NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    submitted_at TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES workflow_forms(id)
);

-- Workflow Execution Logs
CREATE TABLE workflow_execution_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL,
    trigger_data JSON,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    status ENUM('running', 'completed', 'failed'),
    error_message TEXT,
    logs TEXT,  -- Execution logs
    FOREIGN KEY (event_id) REFERENCES workflow_events(id)
);
```

### 9.4. Execution Engine Pseudo-code

```javascript
class WorkflowExecutor {
  async executeEvent(eventId, triggerData) {
    const event = await db.getWorkflowEvent(eventId);
    const yamlContent = event.yaml;

    // Parse YAML
    const workflow = YAML.parse(yamlContent);

    // Initialize context
    const context = {
      input: triggerData,
      workflowData: triggerData,
      config: {},
      stages: {},
    };

    // WebSocket for real-time logs
    const ws = this.getWebSocket(event.response_id);

    try {
      // Execute each stage sequentially
      for (const stage of workflow.stages) {
        await this.executeStage(stage, context, ws);
      }

      ws.send({ type: 'success', message: 'Workflow completed' });
    } catch (error) {
      ws.send({ type: 'error', message: error.message });
      throw error;
    }
  }

  async executeStage(stage, context, ws) {
    ws.send({ type: 'info', message: `Executing stage: ${stage.name}` });

    for (const block of stage.blocks) {
      await this.executeBlock(block, context, ws);
    }

    // Store stage output in context
    context.stages[stage.name] = { completed: true };
  }

  async executeBlock(block, context, ws) {
    ws.send({ type: 'info', message: `Executing block: ${block.name} (${block.type})` });

    // Interpolate variables in input
    const input = this.interpolate(block.input, context);

    // Execute based on block type
    switch (block.type) {
      case 'log':
        await this.executeLog(input, ws);
        break;

      case 'smtp_email':
        await this.executeSMTPEmail(input, context);
        break;

      case 'table':
        await this.executeTableOp(input, context);
        break;

      case 'condition':
        await this.executeCondition(block, context, ws);
        break;

      case 'loop':
        await this.executeLoop(block, context, ws);
        break;

      case 'api_call':
        await this.executeAPICall(input, context);
        break;

      // ... more block types
    }

    ws.send({ type: 'success', message: `Block ${block.name} completed` });
  }

  interpolate(input, context) {
    // Replace {{ .path }} and $[path] with actual values
    const str = JSON.stringify(input);

    // Go template: {{ .input.value }}
    const result1 = str.replace(/\{\{\s*\.([^\}]+)\s*\}\}/g, (match, path) => {
      return this.getValueByPath(context, path);
    });

    // Dollar bracket: $[input.value]
    const result2 = result1.replace(/\$\[([^\]]+)\]/g, (match, path) => {
      return this.getValueByPath(context, path);
    });

    return JSON.parse(result2);
  }

  async executeSMTPEmail(input, context) {
    // 1. Get connector
    const connector = await db.getConnector(input.connector);

    // 2. Create SMTP transport
    const transport = nodemailer.createTransport({
      host: connector.config.host,
      port: connector.config.port,
      auth: {
        user: connector.config.username,
        pass: decrypt(connector.config.password),
      },
    });

    // 3. Send email
    await transport.sendMail({
      from: `"${connector.config.from_name}" <${connector.config.from_email}>`,
      to: input.to,
      subject: input.subject,
      html: input.body,
    });
  }

  async executeCondition(block, context, ws) {
    // Evaluate expressions
    const result = this.evaluateExpressions(block.input.expressions, context);

    if (result) {
      // Execute 'then' blocks
      for (const thenBlock of block.then || []) {
        await this.executeBlock(thenBlock, context, ws);
      }
    } else {
      // Execute 'else' blocks
      for (const elseBlock of block.else || []) {
        await this.executeBlock(elseBlock, context, ws);
      }
    }
  }

  async executeLoop(block, context, ws) {
    // Get array to iterate
    const array = this.interpolate(block.input.array, context);
    const iterator = block.input.iterator;

    // Loop through array
    for (const item of array) {
      // Create new context with iterator variable
      const loopContext = {
        ...context,
        [iterator]: item,
      };

      // Execute blocks inside loop
      for (const loopBlock of block.blocks) {
        await this.executeBlock(loopBlock, loopContext, ws);
      }
    }
  }
}
```

---

## 10. SUMMARY & COMPARISON

### 10.1. Module Comparison Matrix

| Aspect            | Connectors              | Forms                 | Workflow Units        |
| ----------------- | ----------------------- | --------------------- | --------------------- |
| **User Level**    | Admin/Power User        | Business User         | Power User/Developer  |
| **Complexity**    | Medium                  | Low                   | High                  |
| **Purpose**       | Store credentials       | Collect data          | Automate processes    |
| **Visual Editor** | Form-based              | Drag-drop             | Blockly + YAML        |
| **External Deps** | 3rd party services      | None                  | Connectors + Forms    |
| **Reusability**   | Shared across workflows | Can trigger workflows | Uses connectors/forms |

### 10.2. Technology Stack

**Frontend**:

- Framework: Blade templates (Laravel) + Vanilla JavaScript
- Editor: Monaco (YAML), Google Blockly (Visual)
- WebSocket: For real-time logs
- Libraries: Marked.js (Markdown), Select2, Flatpickr

**Backend**:

- Framework: Laravel (PHP)
- Database: MySQL/PostgreSQL
- Queue: For async workflow execution
- WebSocket: Socket.io / Laravel Echo
- YAML Parser: symfony/yaml
- External APIs: SMTP, Google APIs, Zalo API, etc.

### 10.3. Key Architectural Decisions

**1. All POST APIs**

- Reason: Simplified routing, consistent structure
- Trade-off: Not RESTful, but easier for RPC-style

**2. Hardcoded Static Data**

- ConnectorTypes, FormTemplates in frontend
- Reason: Rarely changes, faster load
- Trade-off: Requires redeploy to add new types

**3. Dynamic Config Fields**

- Each connector type has different config
- Stored as JSON in database
- Rendered dynamically based on ConnectorConfigDefinition

**4. YAML as Workflow Language**

- Reason: Human-readable, structured, widely used
- Alternative to visual-only (Zapier) or code-only (AWS Lambda)
- Blockly generates YAML → Best of both worlds

**5. WebSocket for Monitoring**

- Real-time log streaming
- Better UX than polling
- Requires persistent connection

---

**Document Version**: 1.0  
**Created**: 07/11/2025  
**Total Pages**: ~100+ pages equivalent  
**Status**: ✅ Complete Comprehensive Analysis
