# Active Tables - Create Record Enhancement Roadmap

**Current Status**: MVP Complete ✅
**Version**: 1.0.0
**Last Updated**: 2025-11-10

---

## Overview

The create record feature is production-ready with support for 25+ field types and full E2EE encryption. This roadmap outlines enhancements to improve user experience, add missing features, and enable advanced workflows.

---

## Phase 1: Polish & Testing (Week 1)

**Goal**: Ensure production quality and stability

### 1.1 Manual Testing Checklist

#### Plaintext Tables

- [ ] Create record with all field types
- [ ] Verify data appears correctly in record list
- [ ] Verify navigation to detail page works
- [ ] Test validation for required fields
- [ ] Test validation for email/URL formats
- [ ] Test numeric input boundaries
- [ ] Test date/time input formats

#### E2EE Tables

- [ ] Enter encryption key
- [ ] Create encrypted record
- [ ] Verify encryption indicator shows
- [ ] Verify decryption works in list view
- [ ] Test with invalid encryption key
- [ ] Test with missing encryption key

#### Edge Cases

- [ ] Empty form submission
- [ ] Very long text inputs (>10,000 chars)
- [ ] Special characters in text fields
- [ ] Negative numbers
- [ ] Very large numbers (>1 billion)
- [ ] Past/future dates
- [ ] Select fields with many options (>100)
- [ ] Network errors during submission
- [ ] Concurrent record creation

### 1.2 Automated Testing

**Test Files to Create**:

- `use-create-record.test.ts` - Hook unit tests
- `create-record-dialog.test.tsx` - Component integration tests
- `field-input.test.tsx` - Field rendering tests
- `field-encryption.test.ts` - Encryption unit tests

**Code Location**: `/dummy-code/phase1/tests/`

### 1.3 Performance Optimization

- [ ] Measure form render time (target: <100ms)
- [ ] Measure encryption time (target: <50ms per field)
- [ ] Measure API response time
- [ ] Add loading indicators for slow operations
- [ ] Implement debounced validation

### 1.4 Accessibility Improvements

- [ ] Keyboard navigation (Tab, Enter, Esc)
- [ ] Screen reader labels (ARIA)
- [ ] Focus management in dialog
- [ ] Error announcement
- [ ] High contrast mode support

**Estimated Time**: 3-5 days
**Priority**: High
**Difficulty**: Medium

---

## Phase 2: Reference Fields (Week 2)

**Goal**: Complete implementation of SELECT_ONE_RECORD, SELECT_LIST_RECORD, and user reference fields

### 2.1 Async Select Component

Create a reusable async select component for loading records/users from API.

**Features**:

- Search/filter by keywords
- Pagination (infinite scroll or load more)
- Debounced search (300ms)
- Loading states
- Empty states
- Error handling
- Multi-select support

**Dependencies**:

- Consider: `@tanstack/react-virtual` for virtualization
- Consider: Custom implementation vs. library

### 2.2 Record Reference Fields

**Field Types**: `SELECT_ONE_RECORD`, `SELECT_LIST_RECORD`

**API Integration**:

```typescript
GET /api/workspace/{workspaceId}/workflow/get/active_tables/{tableId}/records
POST (with search filters)
```

**Features**:

- Load records from referenced table
- Display label field (configurable)
- Search by label field
- Show record preview on hover
- Navigate to referenced record (Cmd+Click)

### 2.3 User Reference Fields

**Field Types**: `SELECT_ONE_WORKSPACE_USER`, `SELECT_LIST_WORKSPACE_USER`

**API Integration**:

```typescript
GET /api/workspace/{workspaceId}/workspace/get/users
POST (with search filters)
```

**Features**:

- Load workspace users
- Display name and avatar
- Search by name or email
- Filter by role (optional)
- Show user status (active/inactive)

### 2.4 FIRST_REFERENCE_RECORD

**Field Type**: `FIRST_REFERENCE_RECORD` (auto-calculated)

**Behavior**:

- Read-only in create form
- Auto-populated on server-side
- Show informational text: "This field will be automatically set"

**Estimated Time**: 4-6 days
**Priority**: High
**Difficulty**: Medium-High

**Code Location**: `/dummy-code/phase2/`

---

## Phase 3: Rich Text Editor (Week 3)

**Goal**: Replace textarea with full-featured markdown editor

### 3.1 SimpleMDE Integration

**Library**: `react-simplemde-editor` or `@uiw/react-md-editor`

**Features**:

- Markdown syntax highlighting
- Live preview (side-by-side or toggle)
- Toolbar with common formatting
- Keyboard shortcuts (Cmd+B for bold, etc.)
- Image upload support
- Link insertion
- Code blocks with syntax highlighting
- Tables
- Task lists

### 3.2 Toolbar Customization

**Buttons**:

- Bold, Italic, Strikethrough
- Headings (H1-H6)
- Lists (ordered, unordered)
- Links, Images
- Code, Code Block
- Quote
- Horizontal Rule
- Preview Toggle
- Fullscreen Mode

### 3.3 Image Handling

**Options**:

1. **Base64 Embedding**: Encode images as data URLs (simple, increases record size)
2. **Upload to Storage**: Upload to S3/CDN, insert URL (recommended)
3. **Attachment Field**: Create separate attachment system

**Recommended**: Option 2 with presigned URLs

### 3.4 Security Considerations

- Sanitize markdown output (prevent XSS)
- Limit image sizes (max 5MB)
- Validate image types (PNG, JPG, GIF only)
- Rate limit image uploads

**Estimated Time**: 3-4 days
**Priority**: Medium
**Difficulty**: Medium

**Code Location**: `/dummy-code/phase3/`

---

## Phase 4: Advanced Features (Week 4-5)

**Goal**: Enhanced UX and validation capabilities

### 4.1 Custom Date/Time Picker

Replace native HTML5 inputs with shadcn Calendar component.

**Features**:

- Calendar dropdown
- Month/year navigation
- Quick select (Today, Tomorrow, Next Week)
- Time picker with AM/PM
- Date range selection (for DATETIME)
- Timezone support
- Localized formats

**Component**: `shadcn/ui Calendar + Popover`

### 4.2 Numeric Input Formatting

**Features**:

- Thousand separators (1,000)
- Currency formatting ($1,234.56)
- Percentage formatting (12.34%)
- Decimal precision control
- Negative number handling
- Scientific notation (optional)

**Library**: Consider `react-number-format` or custom

### 4.3 Field Validation Rules

**Configurable per field**:

- Min/Max values (numbers)
- Min/Max length (text)
- Regex patterns
- Custom validation functions
- Unique value validation
- Cross-field validation (field A requires field B)

**Implementation**:

```typescript
interface FieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  unique?: boolean;
  required?: boolean;
  custom?: (value: any, record: Record) => string | null;
}
```

### 4.4 Conditional Field Visibility

**Features**:

- Show/hide fields based on other field values
- Dynamic required validation
- Cascading dropdowns

**Example**:

```typescript
interface ConditionalLogic {
  field: string;
  conditions: Array<{
    when: string; // Field name
    is: any; // Value
    then: 'show' | 'hide' | 'require';
  }>;
}
```

### 4.5 Auto-save Drafts

**Features**:

- Save form state to localStorage every 30s
- Restore draft on dialog open
- Show "Draft saved" indicator
- Clear draft on successful submission
- Multiple drafts per table

**Storage Key**: `draft_table_{tableId}_{timestamp}`

**Estimated Time**: 8-10 days
**Priority**: Medium
**Difficulty**: High

**Code Location**: `/dummy-code/phase4/`

---

## Phase 5: Bulk Operations (Week 6-7)

**Goal**: Enable efficient creation of multiple records

### 5.1 Batch Create Mode

**UI**: Switch between "Single" and "Batch" mode

**Features**:

- Create multiple records in one session
- Duplicate form for each record
- Quick copy from previous record
- Validate all before submit
- Progress indicator
- Partial success handling (some records created, some failed)

### 5.2 CSV Import

**Flow**:

1. Upload CSV file
2. Map CSV columns to table fields
3. Preview records (first 10 rows)
4. Validate all rows
5. Show errors (row-by-row)
6. Confirm and import
7. Show success/failure report

**Features**:

- Auto-detect field mapping
- Handle missing values (use defaults)
- Encrypt during import
- Background processing for large files (>1000 rows)
- Download error report (CSV)

### 5.3 Record Templates

**Features**:

- Save current form as template
- Load template to pre-fill form
- Template library (personal + shared)
- Template categories
- Default template per table

**Storage**: Database or localStorage

### 5.4 Duplicate Record

**Entry Point**: Record detail page "Duplicate" button

**Features**:

- Copy all field values
- Open create dialog pre-filled
- Exclude auto-calculated fields
- Exclude unique fields (optional)
- Increment name (e.g., "Task 1" → "Task 1 Copy")

**Estimated Time**: 10-12 days
**Priority**: Low-Medium
**Difficulty**: High

**Code Location**: `/dummy-code/phase5/`

---

## Implementation Priority Matrix

| Phase | Feature            | Priority  | Difficulty | Impact | Time |
| ----- | ------------------ | --------- | ---------- | ------ | ---- |
| 1     | Testing & Polish   | 🔴 High   | Medium     | High   | 3-5d |
| 2     | Reference Fields   | 🔴 High   | Med-High   | High   | 4-6d |
| 3     | Rich Text Editor   | 🟡 Medium | Medium     | Medium | 3-4d |
| 4.1   | Date Picker        | 🟡 Medium | Medium     | Medium | 2-3d |
| 4.2   | Numeric Formatting | 🟡 Medium | Low-Med    | Low    | 2d   |
| 4.3   | Validation Rules   | 🟡 Medium | High       | High   | 3-4d |
| 4.4   | Conditional Logic  | 🟢 Low    | High       | Medium | 3-4d |
| 4.5   | Auto-save Drafts   | 🟢 Low    | Medium     | Low    | 2-3d |
| 5.1   | Batch Create       | 🟢 Low    | High       | Medium | 4-5d |
| 5.2   | CSV Import         | 🟢 Low    | High       | High   | 5-6d |
| 5.3   | Templates          | 🟢 Low    | Medium     | Low    | 2-3d |
| 5.4   | Duplicate Record   | 🟢 Low    | Low        | Low    | 1-2d |

---

## Dependencies & Prerequisites

### Phase 1

- None (can start immediately)

### Phase 2

- None (independent of Phase 1)
- May need API endpoint updates for better search performance

### Phase 3

- Choose markdown library
- Decide on image upload strategy
- May need S3/CDN setup for image hosting

### Phase 4

- Phase 1 complete (need stable base)
- Field validation may require table config schema updates

### Phase 5

- Phase 2 complete (for reference field handling in CSV)
- CSV parser library selection
- Background job system for large imports (optional)

---

## Technical Debt & Considerations

### Security

- [ ] Input sanitization for all field types
- [ ] Rate limiting for record creation
- [ ] File upload validation and scanning
- [ ] XSS prevention in markdown rendering
- [ ] SQL injection prevention (server-side)

### Performance

- [ ] Virtual scrolling for large selects (>1000 options)
- [ ] Debounced API calls for async selects
- [ ] Optimistic UI updates
- [ ] Lazy loading for form fields (if >50 fields)
- [ ] Worker threads for encryption (if needed)

### UX

- [ ] Keyboard shortcuts documentation
- [ ] Tooltips for complex fields
- [ ] Inline help text
- [ ] Form progress indicator (if many fields)
- [ ] Undo/redo support

### Accessibility

- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader testing
- [ ] Keyboard-only navigation
- [ ] Focus indicators
- [ ] Color contrast

---

## Success Metrics

### Phase 1

- [ ] Zero critical bugs
- [ ] Test coverage >80%
- [ ] All field types working correctly
- [ ] Form submission <500ms (average)

### Phase 2

- [ ] Reference fields load in <1s
- [ ] Search results appear in <300ms
- [ ] User can create record with references

### Phase 3

- [ ] Users adopt markdown for >50% of rich text fields
- [ ] Image uploads work reliably
- [ ] No markdown rendering issues

### Phase 4

- [ ] Field validation prevents >90% of invalid submissions
- [ ] Date picker reduces input errors by >50%
- [ ] Auto-save prevents data loss

### Phase 5

- [ ] Batch create reduces time by >70% vs. individual creation
- [ ] CSV import success rate >95%
- [ ] Template usage >30% of record creations

---

## Migration & Rollout Strategy

### Phase 1

- **Deployment**: Silent update (bug fixes and tests)
- **Rollback**: Easy (no schema changes)

### Phase 2

- **Deployment**: Feature flag enabled
- **Rollback**: Feature flag disabled
- **Risk**: Low (isolated to new fields)

### Phase 3-5

- **Deployment**: Gradual rollout (10% → 50% → 100%)
- **Rollback**: Feature flags per phase
- **Risk**: Medium (new UI components)

---

## Future Considerations

### Beyond Phase 5

- **AI-assisted field filling**: Suggest values based on existing records
- **Voice input**: For text fields
- **Barcode/QR scanner**: For special field types
- **Offline mode**: Create records without internet, sync later
- **Mobile app**: Native iOS/Android apps
- **API for third-party integrations**: Zapier, Make, etc.

---

## Questions & Decisions Needed

### Phase 2

- [ ] Which async select library? (Custom vs. existing)
- [ ] Max records to load in reference field? (100? 1000?)
- [ ] Pagination strategy? (Infinite scroll vs. load more button)

### Phase 3

- [ ] Which markdown editor? (SimpleMDE vs. others)
- [ ] Image storage solution? (S3? CDN? Base64?)
- [ ] Max markdown size? (100KB? 1MB?)

### Phase 4

- [ ] Store validation rules in DB or config file?
- [ ] Allow user-defined validation functions?
- [ ] Conditional logic complexity limit?

### Phase 5

- [ ] Max CSV size? (10MB? 50MB?)
- [ ] Import in background or real-time?
- [ ] Template sharing permissions?

---

## Resources & Documentation

### API Documentation

- `/docs/swagger.yaml` - Complete API reference
- `/docs/specs/active-tables/create record/CREATE_RECORD_API_REFERENCE.md`

### Implementation Guides

- `/docs/specs/active-tables/create record/DEVELOPER_GUIDE.md`
- `/docs/specs/active-tables/create record/IMPLEMENTATION_SUMMARY.md`

### Design System

- `/docs/design-system.md`
- `packages/ui/README.md`

### Architecture

- `/CLAUDE.md` - Project coding standards
- `/packages/encryption-core/README.md`
- `/packages/beqeek-shared/README.md`

---

## Contact & Feedback

For questions or suggestions about this roadmap:

- Open an issue in the repo
- Tag @team/active-tables
- Contact: [team email]

**Last Review**: 2025-11-10
**Next Review**: 2025-11-24 (2 weeks)
