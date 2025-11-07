# Test Plan: FIRST_REFERENCE_RECORD Feature

**Feature:** Tạo trường FIRST_REFERENCE_RECORD trong Active Table Settings
**Trạng thái:** Ready for Testing
**Ngày:** 2025-01-07

## Test Environment Setup

### Prerequisites

1. Workspace đã có ít nhất 2 tables
2. Table A (current table) - sẽ thêm FIRST_REFERENCE_RECORD field
3. Table B (reference table) - phải có field kiểu SELECT_ONE_RECORD hoặc SELECT_LIST_RECORD tham chiếu về Table A

### Test Data Preparation

**Table A: "Đơn hàng" (Orders)**

- ID: `table_orders_001`
- Fields:
  - `order_number` (SHORT_TEXT)
  - `customer_name` (SHORT_TEXT)
  - `total_amount` (NUMERIC)

**Table B: "Thanh toán" (Payments)**

- ID: `table_payments_001`
- Fields:
  - `payment_id` (SHORT_TEXT)
  - `payment_date` (DATE)
  - `amount` (NUMERIC)
  - `order_id` (SELECT_ONE_RECORD) → references Table A

## Test Cases

### TC-001: Verify Available Tables Dropdown

**Objective:** Xác nhận dropdown "Reference Table" hiển thị đúng danh sách bảng

**Steps:**

1. Navigate to Table A Settings
2. Click tab "Fields"
3. Click "Add Field"
4. Select field type "First Reference Record"
5. Observe "Reference Table" dropdown

**Expected Results:**

- ✅ Dropdown hiển thị danh sách tất cả tables trong workspace
- ✅ Table A (current table) KHÔNG có trong danh sách
- ✅ Table B và các tables khác có trong danh sách
- ✅ Mỗi table hiển thị tên rõ ràng

**Performance Check:**

- ⏱️ Dropdown load < 500ms
- 🔄 Không có duplicate network requests

---

### TC-002: Verify Reference Field Dropdown Loading

**Objective:** Xác nhận dropdown "Reference Field" load đúng fields từ reference table

**Steps:**

1. Continue from TC-001
2. Select "Thanh toán" from "Reference Table" dropdown
3. Observe "Reference Field" dropdown

**Expected Results:**

- ✅ Dropdown hiển thị loading state
- ✅ Sau khi load, chỉ hiển thị fields có type SELECT_ONE_RECORD hoặc SELECT_LIST_RECORD
- ✅ Field `order_id` xuất hiện trong danh sách
- ✅ Field `payment_date` KHÔNG xuất hiện (vì không phải SELECT_ONE_RECORD type)
- ✅ Field `amount` KHÔNG xuất hiện (vì không phải SELECT_ONE_RECORD type)

**Performance Check:**

- ⏱️ Load fields < 1s
- 🔄 Chỉ có 1 API request

---

### TC-003: Verify Display Field Dropdown

**Objective:** Xác nhận dropdown "Display Field" hiển thị tất cả fields

**Steps:**

1. Continue from TC-002
2. Observe "Display Field" dropdown

**Expected Results:**

- ✅ Dropdown hiển thị TẤT CẢ fields từ Table B
- ✅ Bao gồm: payment_id, payment_date, amount, order_id
- ✅ Mỗi field hiển thị với label và type badge

---

### TC-004: Verify Info Panel Display

**Objective:** Xác nhận info panel giải thích reverse lookup

**Steps:**

1. Continue from TC-001
2. Observe info panel

**Expected Results:**

- ✅ Hiển thị badge "Reverse Lookup"
- ✅ Có info panel màu xanh với icon AlertCircle
- ✅ Text giải thích: "This read-only field displays data from the first record..."
- ✅ Text rõ ràng, dễ hiểu

---

### TC-005: Verify Validation - Missing Reference Table

**Objective:** Xác nhận validation khi thiếu Reference Table

**Steps:**

1. Open Add Field modal
2. Select type "First Reference Record"
3. Fill "Field Label": "First Payment"
4. Leave "Reference Table" empty
5. Click "Add Field"

**Expected Results:**

- ❌ Form không submit
- ✅ Error message hiển thị: "Reference table is required"
- ✅ "Reference Table" dropdown có border đỏ

---

### TC-006: Verify Validation - Missing Reference Field

**Objective:** Xác nhận validation khi thiếu Reference Field

**Steps:**

1. Open Add Field modal
2. Select type "First Reference Record"
3. Fill "Field Label": "First Payment"
4. Select "Reference Table": "Thanh toán"
5. Select "Display Field": "payment_date"
6. Leave "Reference Field" empty
7. Click "Add Field"

**Expected Results:**

- ❌ Form không submit
- ✅ Error message hiển thị: "Reference field is required"
- ✅ "Reference Field" dropdown có border đỏ

---

### TC-007: Verify Validation - Missing Display Field

**Objective:** Xác nhận validation khi thiếu Display Field

**Steps:**

1. Open Add Field modal
2. Select type "First Reference Record"
3. Fill "Field Label": "First Payment"
4. Select "Reference Table": "Thanh toán"
5. Select "Reference Field": "order_id"
6. Leave "Display Field" empty
7. Click "Add Field"

**Expected Results:**

- ❌ Form không submit
- ✅ Error message hiển thị: "Display field is required"
- ✅ "Display Field" dropdown có border đỏ

---

### TC-008: Successful Field Creation

**Objective:** Xác nhận có thể tạo field thành công

**Steps:**

1. Open Add Field modal
2. Select type "First Reference Record"
3. Fill:
   - Field Label: "First Payment Date"
   - Reference Table: "Thanh toán"
   - Reference Field: "order_id"
   - Display Field: "payment_date"
4. Click "Add Field"

**Expected Results:**

- ✅ Modal đóng
- ✅ Toast notification: "Field added"
- ✅ Field "First Payment Date" xuất hiện trong Fields list
- ✅ Field có badge "FIRST_REFERENCE_RECORD"
- ✅ Field có icon read-only hoặc indicator

---

### TC-009: Edit Existing FIRST_REFERENCE_RECORD Field

**Objective:** Xác nhận có thể edit field đã tạo

**Steps:**

1. Continue from TC-008
2. Click "Edit" button on "First Payment Date" field
3. Observe modal

**Expected Results:**

- ✅ Modal mở với pre-filled values
- ✅ Field Type disabled (cannot change)
- ✅ Reference Table pre-selected: "Thanh toán"
- ✅ Reference Field pre-selected: "order_id"
- ✅ Display Field pre-selected: "payment_date"
- ✅ Can change Display Field to other fields
- ✅ Can change Reference Field to other SELECT_ONE_RECORD fields

**Steps to modify:** 4. Change "Display Field" to "amount" 5. Click "Update Field"

**Expected Results:**

- ✅ Modal đóng
- ✅ Toast notification: "Field updated"
- ✅ Field configuration updated

---

### TC-010: No Eligible Reference Fields Scenario

**Objective:** Xác nhận UI khi reference table không có eligible fields

**Setup:**

- Table C không có field nào kiểu SELECT_ONE_RECORD hoặc SELECT_LIST_RECORD

**Steps:**

1. Open Add Field modal
2. Select type "First Reference Record"
3. Select "Reference Table": Table C
4. Observe "Reference Field" dropdown

**Expected Results:**

- ✅ Dropdown disabled hoặc empty
- ✅ Hiển thị message: "No eligible reference fields found"
- ✅ Help text giải thích: "The selected table must have a field of type SELECT_ONE_RECORD or SELECT_LIST_RECORD..."

---

### TC-011: Configuration Summary Display

**Objective:** Xác nhận configuration summary hiển thị đúng

**Steps:**

1. Open Add Field modal
2. Select type "First Reference Record"
3. Fill complete form:
   - Reference Table: "Thanh toán"
   - Reference Field: "order_id"
   - Display Field: "payment_date"

**Expected Results:**

- ✅ Hiển thị green success panel
- ✅ Text: "Configuration Complete"
- ✅ Summary text rõ ràng: "Will display the payment_date field from the first record in Thanh toán where order_id references this record."

---

### TC-012: Performance - Multiple Tables

**Objective:** Xác nhận performance với nhiều tables

**Setup:**

- Workspace có 50+ tables

**Steps:**

1. Open Add Field modal
2. Select type "First Reference Record"
3. Open "Reference Table" dropdown

**Expected Results:**

- ⏱️ Dropdown render < 1s
- ✅ Smooth scrolling
- 🔍 Search/filter working (nếu có)

---

### TC-013: Network Efficiency

**Objective:** Xác nhận không có duplicate API calls

**Tools:** Browser DevTools Network tab

**Steps:**

1. Clear network log
2. Open Add Field modal
3. Select type "First Reference Record"
4. Select "Reference Table": "Thanh toán"
5. Observe network requests

**Expected Results:**

- ✅ 1 request để load tables list (có thể cache)
- ✅ 1 request để load table config khi chọn reference table
- ❌ KHÔNG có duplicate requests
- ✅ Requests use React Query cache

---

### TC-014: React Query Cache

**Objective:** Xác nhận React Query cache hoạt động

**Steps:**

1. Open Add Field modal
2. Select "Reference Table": "Thanh toán"
3. Wait for fields to load
4. Close modal
5. Open modal again
6. Select "Reference Table": "Thanh toán" again

**Expected Results:**

- ✅ Lần 2 load nhanh hơn (< 100ms)
- ✅ Không có network request mới (sử dụng cache)
- ⏱️ Cache valid trong 2 phút

---

### TC-015: Error Handling - Network Failure

**Objective:** Xác nhận error handling khi network fail

**Setup:** Simulate network failure hoặc 500 error

**Steps:**

1. Open Add Field modal
2. Select type "First Reference Record"
3. Select "Reference Table" (với network failure)

**Expected Results:**

- ✅ Toast error notification
- ✅ Error message: "Failed to load fields"
- ✅ Dropdown trở về empty state
- ✅ User có thể retry

---

## Performance Benchmarks

| Metric                      | Target  | Acceptance Criteria |
| --------------------------- | ------- | ------------------- |
| Tables dropdown load        | < 500ms | < 1s                |
| Fields load on table select | < 1s    | < 2s                |
| Modal open time             | < 200ms | < 500ms             |
| Form submission             | < 500ms | < 1s                |
| Cache hit response          | < 100ms | < 200ms             |

## Browser Compatibility

Test on:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Mobile Responsiveness

Test on:

- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] Tablet (iPad)

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader announces all labels
- [ ] Focus indicators visible
- [ ] Error messages associated with fields

## Regression Testing

Verify không ảnh hưởng đến:

- [ ] Other field types creation (SHORT_TEXT, SELECT_ONE, etc.)
- [ ] Existing fields editing
- [ ] Fields reordering
- [ ] Table settings save/cancel

## Test Report Template

```markdown
## Test Execution Report

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Dev/Staging/Prod]

### Test Results Summary

- Total Test Cases: 15
- Passed: [X]
- Failed: [X]
- Blocked: [X]

### Failed Test Cases

[List any failed tests with details]

### Performance Metrics

[Actual measurements vs targets]

### Issues Found

[List bugs/issues with severity]

### Recommendations

[Suggestions for improvement]
```

## Success Criteria

Để feature được accept:

- ✅ All critical test cases (TC-001 to TC-009) pass
- ✅ No critical bugs
- ✅ Performance within targets
- ✅ Works on all major browsers
- ⚠️ Minor bugs acceptable with known workarounds
