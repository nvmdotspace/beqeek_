# Workflow Forms Implementation - Resolved Decisions

**Date**: 2025-11-14
**Analysis Source**: `docs/html-module/workflow-forms.blade.php` (1184 lines)

## Summary

All 5 unresolved questions have been answered by analyzing the legacy implementation.

---

## Decision Matrix

| #   | Question            | Decision                | Rationale                                                                                                                                                             | Phase Impact |
| --- | ------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| 1   | Form ID generation  | **Server-side**         | API returns ID in create response (`response.data.id`). Client has `generateUUIDv7()` utility but doesn't use for forms                                               | Phase 1      |
| 2   | E2EE encryption     | **Not required**        | No encryption logic found. Form configs are non-sensitive metadata (labels, types, placeholders, options)                                                             | Phase 1      |
| 3   | Form versioning     | **Phase 8+ (future)**   | Legacy uses simple CRUD with overwrite. `PATCH /workflow_forms/{id}` replaces entire config. No version/history tracking                                              | Future       |
| 4   | Public embedding    | **Phase 8+ (future)**   | No public URLs, iframe generation, or unauthenticated endpoints. All routes require `Authorization: Bearer ${token}`. "Embedding" means internal workflow integration | Future       |
| 5   | Validation approach | **Manual + TypeScript** | Legacy uses if-checks + regex (lines 795-826). Project has no Zod dependency. Use runtime validation with strict typing                                               | Phase 1, 6   |

---

## Detailed Findings

### 1. Form ID Generation: Server-Side ✅

**Evidence**:

```javascript
// Line 318-326: generateUUIDv7() exists but NOT used for form creation
static generateUUIDv7() { /* ... */ }

// Line 448: API returns server-generated ID
const response = await CommonUtils.apiCall(`${API_PREFIX}/post/workflow_forms`, data);
return { message: response.message, id: response.data.id };

// Line 912: Use server ID to navigate after creation
CommonUtils.navigateToDetail(response.id);
```

**Functional Spec Confirmation**:

```json
// Line 106: FormInstance structure
{
  "id": "snowflake-id-123",  // Server-generated
  "name": "Form liên hệ của tôi",
  ...
}
```

**Implementation**:

- ✅ API returns ID in create response
- ✅ Client never sends ID in create payload
- ✅ Use `@workspace/beqeek-shared/utils/uuid-generator.ts` if client-side UUIDs needed elsewhere

---

### 2. E2EE Encryption: Not Required ❌

**Evidence**:

```bash
grep -i "encryption\|e2ee\|encryptionKey" workflow-forms.blade.php
# => No matches found
```

**Comparison with Active Tables**:

```typescript
// Active Tables HAS E2EE (apps/web/src/features/active-tables/types.ts:94-95)
interface ActiveTableConfig {
  e2eeEncryption: boolean;
  hashedKeywordFields: string[];
  // ...
}

// Workflow Forms: No encryption fields
interface FormInstance {
  id: string;
  name: string;
  formType: string;
  config: FormConfig; // Plaintext
}
```

**Rationale**:

- Form **configs** are not sensitive (field labels, types, placeholders)
- Form **submissions** (user data) might need encryption later, but that's a separate concern
- Config data: "Họ và Tên", "Email", "text", "required: true" → non-sensitive metadata

**Implementation**:

- ❌ No `encryptionKey` field in FormInstance
- ❌ No `@workspace/encryption-core` import needed
- ✅ Keep plaintext for simplicity and maintainability

---

### 3. Form Versioning: Future Enhancement 🔮

**Evidence**:

```javascript
// Line 456: PATCH endpoint overwrites entire config
static async updateForm(formId, data) {
  const response = await CommonUtils.apiCall(
    `${API_PREFIX}/patch/workflow_forms/${formId}`,
    data
  );
  return { message: response.message };
}

// No version field, no history tracking, no /versions endpoint
```

**Legacy Behavior**:

- Update: Overwrite entire `FormInstance` object
- No audit trail
- No rollback capability
- No `version` or `updatedBy` fields

**Future Implementation (Phase 8+)**:

```typescript
// If needed later:
interface FormInstance {
  id: string;
  version: number; // Increment on update
  versionHistory?: {
    version: number;
    config: FormConfig;
    updatedAt: string;
    updatedBy: string;
  }[];
  // ...
}
```

**Implementation**:

- ✅ Phase 1-6: Simple CRUD (match legacy)
- 🔮 Phase 8+: Add versioning if audit requirements emerge

---

### 4. Public Embedding: Future Enhancement 🔮

**Evidence**:

```javascript
// Line 295-313: All API calls require authentication
headers: {
  'Authorization': `Bearer ${Auth.getAuthToken()}`
}

// Line 633-667: copyFormId() exists but no public URL generation
static copyFormId() {
  const id = formIdInput.value;
  navigator.clipboard.writeText(id); // Just copy ID, not a public URL
}
```

**No Public Features Found**:

- ❌ No `/public/forms/{id}` route
- ❌ No iframe embed code generation
- ❌ No public submission endpoint
- ❌ No share link functionality

**Functional Spec Clarification** (line 5):

> "Các biểu mẫu này sau đó có thể được nhúng và sử dụng trong các quy trình công việc"

**Interpretation**: "Embedding in workflows" = internal integration, NOT public iframe embedding.

**Future Implementation (Phase 8+)**:

```typescript
// If public forms needed:
interface FormInstance {
  isPublic: boolean;
  publicUrl?: string;
  embedCode?: string;
  submissionEndpoint?: string;
}
```

**Implementation**:

- ✅ Phase 1-6: Authenticated forms only
- 🔮 Phase 8+: Public forms if business needs arise

---

### 5. Validation Approach: Manual + TypeScript ✅

**Evidence**:

```javascript
// Line 795-798: Simple if-checks
if (!fieldLabel.value) {
  CommonUtils.showMessage('Tên trường không được để trống.', false);
  return;
}

// Line 814-817: Regex validation
if (options.length === 0) {
  CommonUtils.showMessage('Vui lòng thêm ít nhất một tùy chọn...', false);
  return;
}

// Line 823-826: Date format validation
if (!field.defaultValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
  CommonUtils.showMessage('Giá trị mặc định phải đúng định dạng YYYY-MM-DD', false);
  return;
}
```

**Project Status**:

```bash
grep -r "import.*zod" --include="*.ts"
# => No files found (Zod not used in project)
```

**Validation Strategy**:

**Option A: Manual Validation (✅ Chosen)**

- ✅ Matches legacy pattern
- ✅ No new dependencies
- ✅ Simple, predictable
- ✅ TypeScript strict typing provides compile-time safety
- ✅ Runtime checks in `utils/field-validation.ts`

**Option B: Zod (❌ Not chosen)**

- ❌ Adds dependency (not in project)
- ❌ Learning curve for team
- ❌ Overkill for simple validation rules
- ❌ Would need to add to all packages

**Implementation** (Phase 6):

```typescript
// utils/field-validation.ts
export function validateField(field: Partial<Field>): string | null {
  if (!field.label?.trim()) return 'Tên trường không được để trống';
  if (field.type === 'select' && !field.options?.length) {
    return 'Vui lòng thêm ít nhất một tùy chọn';
  }
  if (field.type === 'date' && field.defaultValue) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(field.defaultValue)) {
      return 'Giá trị mặc định phải đúng định dạng YYYY-MM-DD';
    }
  }
  return null;
}
```

---

## Implementation Impact

### Phase 1: Foundation

- ✅ No `encryptionKey` in types
- ✅ No `version` field in FormInstance
- ✅ Server-side ID in API response types
- ✅ Add validation utilities file structure

### Phase 6: Field Management

- ✅ Implement manual validation in `utils/field-validation.ts`
- ✅ Use `validateField()` in FieldConfigDialog
- ✅ Pattern: `const error = validateField(field); if (error) { alert(error); return; }`

### Phase 8+ (Future)

- 🔮 Form versioning (if audit requirements)
- 🔮 Public embedding (if business needs)

---

## References

**Legacy Code**:

- Form creation: `workflow-forms.blade.php:448` (server ID return)
- Validation: `workflow-forms.blade.php:795-826`
- ID generation: `workflow-forms.blade.php:318-326` (utility only)

**Functional Spec**:

- FormInstance structure: `workflow-forms-functional-spec.md:102-120`
- API endpoints: `workflow-forms-functional-spec.md:147-172`

**Current Project**:

- UUID generator: `packages/beqeek-shared/src/utils/uuid-generator.ts`
- Active Tables E2EE: `apps/web/src/features/active-tables/types.ts:94-95`
- No Zod usage: `grep -r "import.*zod"`

---

## Questions Answered ✅

All 5 questions resolved. No blockers for Phase 1-7 implementation.

**Ready to start Phase 1: Foundation** 🚀
