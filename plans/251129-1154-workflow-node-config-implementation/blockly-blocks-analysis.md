# Blockly Blocks Analysis

## Source: `docs/html-module/workflow-units.blade.php` (line 512-1254)

---

## 1. Block Categories Overview

| Category             | Blocks                                     | Lines              | Color       |
| -------------------- | ------------------------------------------ | ------------------ | ----------- |
| **[A] Bắt đầu**      | stages, stage, callbacks                   | 513-547            | 230/200     |
| **[B] Bảng**         | 7 blocks (CRUD + comments)                 | 577-731            | 200         |
| **[U] Người dùng**   | 2 blocks                                   | 1118-1152          | 200         |
| **[B] Email**        | smtp_email_block                           | 733-761            | 260         |
| **[B] Google Sheet** | 4 blocks (CRUD)                            | 1154-1252          | 100         |
| **[B] Webhook**      | api_call                                   | 935-979            | 100         |
| **[B] Delay**        | delay                                      | 1087-1116          | 50          |
| **[W] Điều kiện**    | condition, expression, expression_group    | 784-847            | 210/200/160 |
| **[W] Tính toán**    | math, math_expression, math_group          | 849-918            | 230/180/150 |
| **[W] Match**        | match, case                                | 981-1012           | 170/190     |
| **[L] Vòng lặp**     | loop                                       | 763-782            | 180         |
| **Khai báo**         | definition                                 | 920-933            | 140         |
| **[V] Giá trị**      | text, math_number, logic_boolean           | (Blockly built-in) | -           |
| **[V-R] Mảng**       | dynamic_array, array_item                  | 1014-1038          | 65/100      |
| **[V-O] Đối tượng**  | object_lookup, dynamic_object, object_pair | 1040-1085          | 260/20/45   |
| **[B] Gỡ lỗi**       | log                                        | 549-575            | 160         |

---

## 2. Block Definitions Detail

### 2.1 Structure Blocks (Stages)

#### `stages` (line 513-522)

```
┌─────────────────────────────────────────┐
│ Stages                                  │
│ ┌─────────────────────────────────────┐ │
│ │ STAGES (StatementInput: Stage)      │ │ ← Chứa các stage blocks
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
         ↓ nextStatement: Callbacks
```

**Fields**: None
**Inputs**: `STAGES` (StatementInput, check: Stage)
**Connections**: nextStatement → Callbacks

#### `callbacks` (line 523-532)

```
┌─────────────────────────────────────────┐
│ Callbacks                               │
│ ┌─────────────────────────────────────┐ │
│ │ CALLBACKS (StatementInput: Block)   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
         ↑ previousStatement: Stages
```

**Fields**: None
**Inputs**: `CALLBACKS` (StatementInput, check: Block)
**Connections**: previousStatement ← Stages

#### `stage` (line 534-547)

```
┌─────────────────────────────────────────┐
│ Stage [name________]                    │ ← FieldTextInput
│ Blocks ┌───────────────────────────────┐│
│        │ (StatementInput: Block)       ││
│        └───────────────────────────────┘│
└─────────────────────────────────────────┘
```

**Fields**: `NAME` (FieldTextInput, default: "name")
**Inputs**: `BLOCKS` (StatementInput, check: Block)
**Connections**: previousStatement ← Stage

---

### 2.2 Table Blocks (7 blocks)

#### `table_get_list_block` (line 577-596)

```
┌─────────────────────────────────────────┐
│ Table Get List [users______]            │
│ Connector ID [123123123123123123]       │
│ Query ○─────────────────────────────────│ ← ValueInput
│ Blocks ┌───────────────────────────────┐│
│        │ (StatementInput)              ││
│        └───────────────────────────────┘│
└─────────────────────────────────────────┘
```

| Field     | Type           | Default              |
| --------- | -------------- | -------------------- |
| NAME      | FieldTextInput | "users"              |
| CONNECTOR | FieldTextInput | "123123123123123123" |
| QUERY     | ValueInput     | null                 |
| BLOCKS    | StatementInput | -                    |

#### `table_get_one_block` (line 598-617)

```
┌─────────────────────────────────────────┐
│ Table Get One [users______]             │
│ Connector ID [123123123123123123]       │
│ Record ID [$[config.table_id]]          │
│ Blocks ┌───────────────────────────────┐│
│        │ (StatementInput)              ││
│        └───────────────────────────────┘│
└─────────────────────────────────────────┘
```

| Field     | Type           | Default              |
| --------- | -------------- | -------------------- |
| NAME      | FieldTextInput | "users"              |
| CONNECTOR | FieldTextInput | "123123123123123123" |
| RECORD    | FieldTextInput | "$[config.table_id]" |
| BLOCKS    | StatementInput | -                    |

#### `table_create_block` (line 619-638)

| Field     | Type           | Default              |
| --------- | -------------- | -------------------- |
| NAME      | FieldTextInput | "user_create"        |
| CONNECTOR | FieldTextInput | "123123123123123123" |
| DATA      | **ValueInput** | null                 |
| BLOCKS    | StatementInput | -                    |

#### `table_update_block` (line 640-662)

| Field     | Type           | Default               |
| --------- | -------------- | --------------------- |
| NAME      | FieldTextInput | "user_update"         |
| CONNECTOR | FieldTextInput | "123123123123123123"  |
| RECORD    | FieldTextInput | "$[config.record_id]" |
| DATA      | **ValueInput** | null                  |
| BLOCKS    | StatementInput | -                     |

#### `table_delete_block` (line 664-683)

| Field     | Type           | Default               |
| --------- | -------------- | --------------------- |
| NAME      | FieldTextInput | "user_delete"         |
| CONNECTOR | FieldTextInput | "123123123123123123"  |
| RECORD    | FieldTextInput | "$[config.record_id]" |
| BLOCKS    | StatementInput | -                     |

#### `table_comment_create_block` (line 685-707) ⚠️ **MISSING IN REACT**

```
┌─────────────────────────────────────────┐
│ Table Comment Create [comment]          │
│ Connector ID [123123123123123123]       │
│ Record ID [$[config.record_id]]         │
│ Content [$[config.record_id]]           │ ← FieldTextInput
│ Blocks ┌───────────────────────────────┐│
│        │ (StatementInput)              ││
│        └───────────────────────────────┘│
└─────────────────────────────────────────┘
```

| Field       | Type           | Default               |
| ----------- | -------------- | --------------------- |
| NAME        | FieldTextInput | "comment"             |
| CONNECTOR   | FieldTextInput | "123123123123123123"  |
| RECORD      | FieldTextInput | "$[config.record_id]" |
| **CONTENT** | FieldTextInput | "$[config.record_id]" |
| BLOCKS      | StatementInput | -                     |

#### `table_comment_get_one_block` (line 709-731) ⚠️ **MISSING IN REACT**

```
┌─────────────────────────────────────────┐
│ Table Comment Get One [comment_one]     │
│ Connector ID [123123123123123123]       │
│ Record ID [$[config.record_id]]         │
│ Comment Id [$[config.record_id]]        │ ← FieldTextInput
│ Blocks ┌───────────────────────────────┐│
│        │ (StatementInput)              ││
│        └───────────────────────────────┘│
└─────────────────────────────────────────┘
```

| Field       | Type           | Default               |
| ----------- | -------------- | --------------------- |
| NAME        | FieldTextInput | "comment_one"         |
| CONNECTOR   | FieldTextInput | "123123123123123123"  |
| RECORD      | FieldTextInput | "$[config.record_id]" |
| **COMMENT** | FieldTextInput | "$[config.record_id]" |
| BLOCKS      | StatementInput | -                     |

---

### 2.3 Email Block

#### `smtp_email_block` (line 733-761)

```
┌─────────────────────────────────────────┐
│ SMTP Email [name________]               │
│ Connector ID [connector_id]             │
│ To [to__________________]               │
│ To Name [name___________]               │
│ Subject [subject________]               │
│ Body [body______________]               │
│ Blocks ┌───────────────────────────────┐│
│        │ (StatementInput)              ││
│        └───────────────────────────────┘│
└─────────────────────────────────────────┘
```

| Field     | Type           | Default        |
| --------- | -------------- | -------------- |
| NAME      | FieldTextInput | "name"         |
| CONNECTOR | FieldTextInput | "connector_id" |
| TO        | FieldTextInput | "to"           |
| TONAME    | FieldTextInput | "name"         |
| SUBJECT   | FieldTextInput | "subject"      |
| BODY      | FieldTextInput | "body"         |
| BLOCKS    | StatementInput | -              |

---

### 2.4 Logic Blocks

#### `loop` (line 763-782)

```
┌─────────────────────────────────────────┐
│ Loop [name________]                     │
│ Array ○─────────────────────────────────│ ← ValueInput
│ Iterator [item______]                   │
│ Blocks ┌───────────────────────────────┐│
│        │ (StatementInput)              ││
│        └───────────────────────────────┘│
└─────────────────────────────────────────┘
```

| Field    | Type           | Default |
| -------- | -------------- | ------- |
| NAME     | FieldTextInput | "name"  |
| ARRAY    | **ValueInput** | null    |
| ITERATOR | FieldTextInput | "item"  |
| BLOCKS   | StatementInput | -       |

#### `condition` (line 784-803)

```
┌─────────────────────────────────────────┐
│ Condition [name________]                │
│ Expressions ┌──────────────────────────┐│
│             │ (Expression/Group)       ││ ← Nested expressions
│             └──────────────────────────┘│
│ Then ┌─────────────────────────────────┐│
│      │ (Block)                         ││
│      └─────────────────────────────────┘│
│ Else ┌─────────────────────────────────┐│
│      │ (Block)                         ││
│      └─────────────────────────────────┘│
└─────────────────────────────────────────┘
```

| Field       | Type           | Check                   |
| ----------- | -------------- | ----------------------- |
| NAME        | FieldTextInput | -                       |
| EXPRESSIONS | StatementInput | ['Expression', 'Group'] |
| THEN        | StatementInput | 'Block'                 |
| ELSE        | StatementInput | 'Block'                 |

#### `expression` (line 805-828)

```
┌─────────────────────────────────────────┐
│ Expression  Operator [▼ equals]         │
│ Operand ○───────────────────────────────│ ← ValueInput
│ Value ○─────────────────────────────────│ ← ValueInput
└─────────────────────────────────────────┘
```

| Field    | Type           | Options                                                                   |
| -------- | -------------- | ------------------------------------------------------------------------- |
| OPERATOR | FieldDropdown  | equals, not_equals, contains, greater_than_or_equals, less_than_or_equals |
| OPERAND  | **ValueInput** | any                                                                       |
| VALUE    | **ValueInput** | any                                                                       |

#### `expression_group` (line 830-847)

```
┌─────────────────────────────────────────┐
│ Expression Group  Operator [▼ and]      │
│ Conditions ┌───────────────────────────┐│
│            │ (Expression/Group)        ││ ← Recursive nesting
│            └───────────────────────────┘│
└─────────────────────────────────────────┘
```

| Field      | Type           | Options                            |
| ---------- | -------------- | ---------------------------------- |
| OPERATOR   | FieldDropdown  | and, or                            |
| CONDITIONS | StatementInput | ['Expression', 'Expression_Group'] |

---

### 2.5 Math Blocks

#### `math` (line 849-871)

```
┌─────────────────────────────────────────┐
│ Math [name________]                     │
│ Aggregate [▼ none]                      │ ← SUM, AVG, MIN, MAX
│ Expressions ┌──────────────────────────┐│
│             │ (Math_Expression/Group)  ││
│             └──────────────────────────┘│
└─────────────────────────────────────────┘
```

| Field       | Type           | Options                           |
| ----------- | -------------- | --------------------------------- |
| NAME        | FieldTextInput | -                                 |
| AGGREGATE   | FieldDropdown  | NONE, SUM, AVG, MIN, MAX          |
| EXPRESSIONS | StatementInput | ['Math_Expression', 'Math_Group'] |

#### `math_expression` (line 873-897)

```
┌─────────────────────────────────────────┐
│ Math Expression  Operator [▼ +]         │
│ Left Operand ○──────────────────────────│
│ Right Operand ○─────────────────────────│
└─────────────────────────────────────────┘
```

| Field    | Type           | Options                                                                 |
| -------- | -------------- | ----------------------------------------------------------------------- |
| OPERATOR | FieldDropdown  | + (add), - (subtract), × (multiply), ÷ (divide), % (modulus), ^ (power) |
| LEFT     | **ValueInput** | any                                                                     |
| RIGHT    | **ValueInput** | any                                                                     |

#### `math_group` (line 899-918)

| Field    | Type           | Options                           |
| -------- | -------------- | --------------------------------- |
| OPERATOR | FieldDropdown  | +, -, ×, ÷                        |
| GROUP    | StatementInput | ['Math_Expression', 'Math_Group'] |

---

### 2.6 Match Blocks

#### `match` (line 981-997)

```
┌─────────────────────────────────────────┐
│ Match [name________]                    │
│ Value ○─────────────────────────────────│
│ Cases ┌────────────────────────────────┐│
│       │ (Case blocks)                  ││
│       └────────────────────────────────┘│
└─────────────────────────────────────────┘
```

| Field | Type                         |
| ----- | ---------------------------- |
| NAME  | FieldTextInput               |
| VALUE | **ValueInput**               |
| CASES | StatementInput (check: Case) |

#### `case` (line 999-1012)

```
┌─────────────────────────────────────────┐
│ Case [*pattern]                         │
│ Then ┌─────────────────────────────────┐│
│      │ (Block)                         ││
│      └─────────────────────────────────┘│
└─────────────────────────────────────────┘
```

| Field   | Type                                  |
| ------- | ------------------------------------- |
| PATTERN | FieldTextInput (default: "\*pattern") |
| THEN    | StatementInput                        |

---

### 2.7 Value Builder Blocks ⚠️ **ALL MISSING IN REACT**

#### `dynamic_array` (line 1014-1025)

```
┌─────────────────────────────────────────┐
│ Array                                   │
│ Items ┌────────────────────────────────┐│
│       │ (Array_Item)                   ││
│       └────────────────────────────────┘│
└────────────────○────────────────────────┘
                 ↑ Output (can connect to ValueInput)
```

**Special**: Has `setOutput(true)` - can be used as value

#### `array_item` (line 1028-1038)

```
┌─────────────────────────────────────────┐
│ Item ○──────────────────────────────────│ ← ValueInput
└─────────────────────────────────────────┘
```

#### `dynamic_object` (line 1058-1069)

```
┌─────────────────────────────────────────┐
│ Object                                  │
│ Pairs ┌────────────────────────────────┐│
│       │ (Object_Pair)                  ││
│       └────────────────────────────────┘│
└────────────────○────────────────────────┘
                 ↑ Output (can connect to ValueInput)
```

#### `object_pair` (line 1072-1085)

```
┌─────────────────────────────────────────┐
│ Key [key________]                       │
│ Value ○─────────────────────────────────│ ← ValueInput
└─────────────────────────────────────────┘
```

#### `object_lookup` (line 1040-1056) ⚠️ **MISSING IN REACT**

```
┌─────────────────────────────────────────┐
│ Object Lookup [name________]            │
│ Object ○────────────────────────────────│ ← ValueInput
│ Key ○───────────────────────────────────│ ← ValueInput (String)
└─────────────────────────────────────────┘
```

---

### 2.8 API/Webhook Block

#### `api_call` (line 935-979)

```
┌─────────────────────────────────────────┐
│ API Call [name________]                 │
│ Url [https://___________]               │
│ Method [▼ GET]                          │ ← GET, POST, PUT, DELETE
│ Request Type [▼ json]                   │ ← json, form_params, multipart
│ Response Format [▼ json]                │ ← json, text, base64
│ Headers (optional) ○────────────────────│
│ Payload (optional) ○────────────────────│
│ Blocks ┌───────────────────────────────┐│
│        │ (StatementInput)              ││
│        └───────────────────────────────┘│
└─────────────────────────────────────────┘
```

| Field           | Type           | Options                      |
| --------------- | -------------- | ---------------------------- |
| NAME            | FieldTextInput | -                            |
| URL             | FieldTextInput | "https://"                   |
| METHOD          | FieldDropdown  | GET, POST, PUT, DELETE       |
| REQUEST_TYPE    | FieldDropdown  | json, form_params, multipart |
| RESPONSE_FORMAT | FieldDropdown  | json, text, base64           |
| HEADERS         | ValueInput     | optional                     |
| PAYLOAD         | ValueInput     | optional                     |
| BLOCKS          | StatementInput | -                            |

---

### 2.9 Delay Block

#### `delay` (line 1087-1116)

```
┌─────────────────────────────────────────┐
│ Delay [delay_name]                      │
│ Duration Value [1________] (number)     │
│ Duration Unit [▼ seconds]               │ ← seconds, minutes, hours, days, weeks, months
│ Target Time (optional) [____________]   │
│ Callback [callback_____]                │
└─────────────────────────────────────────┘
```

| Field          | Type            | Options/Default                              |
| -------------- | --------------- | -------------------------------------------- |
| NAME           | FieldTextInput  | "delay_name"                                 |
| DURATION_VALUE | **FieldNumber** | 1 (min: 0)                                   |
| DURATION_UNIT  | FieldDropdown   | seconds, minutes, hours, days, weeks, months |
| TARGET_TIME    | FieldTextInput  | "" (optional)                                |
| CALLBACK       | FieldTextInput  | "callback"                                   |

---

### 2.10 User Blocks

#### `user_get_list_block` (line 1118-1134)

| Field  | Type                     |
| ------ | ------------------------ |
| NAME   | FieldTextInput ("users") |
| QUERY  | ValueInput               |
| BLOCKS | StatementInput           |

#### `user_get_one_block` (line 1136-1152)

| Field  | Type                    |
| ------ | ----------------------- |
| NAME   | FieldTextInput ("user") |
| ID     | FieldTextInput ("1")    |
| BLOCKS | StatementInput          |

---

### 2.11 Google Sheet Blocks

#### `google_sheet_create_block` (line 1154-1173)

| Field     | Type                |
| --------- | ------------------- |
| NAME      | FieldTextInput      |
| CONNECTOR | FieldTextInput      |
| TITLE     | ValueInput (String) |
| BLOCKS    | StatementInput      |

#### `google_sheet_append_block` (line 1175-1200)

| Field     | Type                    | Note       |
| --------- | ----------------------- | ---------- |
| NAME      | FieldTextInput          |            |
| CONNECTOR | FieldTextInput          |            |
| SHEET_ID  | ValueInput              |            |
| RANGE     | ValueInput              |            |
| VALUES    | **FieldMultilineInput** | CSV format |
| BLOCKS    | StatementInput          |            |

#### `google_sheet_read_block` (line 1202-1225)

| Field     | Type           |
| --------- | -------------- |
| NAME      | FieldTextInput |
| CONNECTOR | FieldTextInput |
| SHEET_ID  | ValueInput     |
| RANGE     | ValueInput     |
| BLOCKS    | StatementInput |

#### `google_sheet_update_block` (line 1227-1252)

| Field     | Type                    | Note       |
| --------- | ----------------------- | ---------- |
| NAME      | FieldTextInput          |            |
| CONNECTOR | FieldTextInput          |            |
| SHEET_ID  | ValueInput              |            |
| RANGE     | ValueInput              |            |
| VALUES    | **FieldMultilineInput** | CSV format |
| BLOCKS    | StatementInput          |            |

---

### 2.12 Log Block

#### `log` (line 549-575)

```
┌─────────────────────────────────────────┐
│ Log [name________]                      │
│ Message [message________]               │
│ Level [▼ info]                          │ ← info, error, warning
│ Context ○───────────────────────────────│ ← ValueInput
│ Blocks ┌───────────────────────────────┐│
│        │ (StatementInput)              ││
│        └───────────────────────────────┘│
└─────────────────────────────────────────┘
```

| Field   | Type           | Options              |
| ------- | -------------- | -------------------- |
| NAME    | FieldTextInput | "name"               |
| MESSAGE | FieldTextInput | "message"            |
| LEVEL   | FieldDropdown  | info, error, warning |
| CONTEXT | ValueInput     | any                  |
| BLOCKS  | StatementInput | -                    |

---

### 2.13 Definition Block

#### `definition` (line 920-933)

```
┌─────────────────────────────────────────┐
│ Definition [name________]               │
│ Data ○──────────────────────────────────│ ← ValueInput
└─────────────────────────────────────────┘
```

| Field | Type           |
| ----- | -------------- |
| NAME  | FieldTextInput |
| DATA  | ValueInput     |

---

## 3. Summary: What React Flow Needs

### 3.1 Missing Blocks (Must Add)

| Block                   | Priority | Reason                   |
| ----------------------- | -------- | ------------------------ |
| `table_comment_create`  | **High** | Active in Blade toolbox  |
| `table_comment_get_one` | **High** | Active in Blade toolbox  |
| `object_lookup`         | **High** | Used for data extraction |
| `dynamic_array`         | Medium   | Value builder            |
| `array_item`            | Medium   | Value builder            |
| `dynamic_object`        | Medium   | Value builder            |
| `object_pair`           | Medium   | Value builder            |

### 3.2 Field Types to Implement

| Blockly Field       | React Equivalent             |
| ------------------- | ---------------------------- |
| FieldTextInput      | `<Input />`                  |
| FieldNumber         | `<Input type="number" />`    |
| FieldDropdown       | `<Select />`                 |
| FieldMultilineInput | `<Textarea />`               |
| ValueInput          | JSON Editor or nested picker |
| StatementInput      | N/A (React Flow uses edges)  |

### 3.3 Nested Blocks Pattern

Blockly uses nested `StatementInput` for:

- `condition.EXPRESSIONS` → expression/expression_group
- `condition.THEN/ELSE` → any Block
- `math.EXPRESSIONS` → math_expression/math_group
- `match.CASES` → case
- `loop.BLOCKS` → any Block

**React Flow approach**: Flatten into forms with nested JSON editors or sub-forms.
