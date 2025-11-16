# Hướng Dẫn Test Workflow Connectors Phase 3

## Tổng Quan

Phase 3 đã hoàn thành đầy đủ tính năng CRUD (Create, Read, Update, Delete) cho Workflow Connectors với hỗ trợ OAuth2 và dynamic form generation.

---

## 🚀 Khởi Động

### 1. Start Development Server

```bash
pnpm dev
```

Server sẽ chạy tại: `http://localhost:4173/`

### 2. Truy Cập Ứng Dụng

1. Mở trình duyệt: `http://localhost:4173/`
2. Đăng nhập (nếu cần)
3. Chọn workspace

---

## 📋 Test Case 1: Xem Danh Sách Connectors (List View)

### URL

```
http://localhost:4173/{locale}/workspaces/{workspaceId}/workflow-connectors
```

### Test Steps

1. Navigate to Workflow Connectors từ sidebar/menu
2. Verify hiển thị danh sách connectors (nếu có)
3. Test category tabs filtering:
   - Click "Tất cả" → Shows all connectors
   - Click "SMTP" → Shows only SMTP connectors
   - Click "Google Sheets" → Shows only Google Sheets connectors
4. Test empty state nếu chưa có connector

### Expected Results

✅ Danh sách hiển thị với logo, tên, description
✅ Category tabs có số lượng chính xác
✅ Clicking vào connector → Navigate to detail page
✅ Button "Tạo Connector" visible ở header

---

## 📋 Test Case 2: Tạo Connector Mới (Create Flow)

### Test Steps

#### Step 1: Navigate to Select View

1. Click "Tạo Connector" từ list page
2. Verify redirect to select view
3. Verify grid hiển thị 5 loại connector:
   - SMTP
   - Google Sheets
   - Zalo OA
   - Kiotviet
   - Bảng (Active Table)

#### Step 2: Test Search

1. Type "smtp" vào search box
2. Verify chỉ hiển thị SMTP card
3. Clear search → Verify tất cả cards hiển thị lại

#### Step 3: Create SMTP Connector

1. Click vào "SMTP" card
2. Verify dialog mở với form:
   - Field "Tên định danh" (required)
   - Field "Mô tả" (optional)
3. Test validation:
   - Click "Tạo Connector" với empty name → Shows error
   - Enter name < 100 chars → Valid
   - Enter name > 100 chars → Shows error
4. Fill form:
   ```
   Tên: Email Marketing Server
   Mô tả: SMTP server cho chiến dịch email marketing
   ```
5. Click "Tạo Connector"
6. Verify:
   - Loading state appears
   - Dialog closes
   - Navigate to detail page

### Expected Results

✅ Dialog validation works correctly
✅ API call creates connector
✅ Auto-navigate to detail page với connector vừa tạo
✅ Connector appears in list khi quay lại

---

## 📋 Test Case 3: Cấu Hình Connector (Detail View - Config Form)

### URL

```
http://localhost:4173/{locale}/workspaces/{workspaceId}/workflow-connectors/{connectorId}
```

### Test Steps

#### Part A: SMTP Connector Config

1. Navigate to SMTP connector detail
2. Verify form hiển thị 8 fields:
   - SMTP Host (text, required)
   - SMTP Port (number, required)
   - Username (text, required)
   - Password (password, required)
   - From Email (text, required)
   - From Name (text, optional)
   - Check Daily Unique (checkbox, optional)
   - Tracking Email (checkbox, optional)

3. Test validation:
   - Leave required fields empty → Click "Lưu cấu hình" → Shows errors
   - Enter invalid port (text instead of number) → Shows error
   - Fill all required fields → Validation passes

4. Fill config:

   ```
   Host: smtp.gmail.com
   Port: 587
   Username: test@gmail.com
   Password: ••••••••
   From Email: noreply@example.com
   From Name: Example Team
   Check Daily Unique: ✓
   Tracking Email: ✓
   ```

5. Click "Lưu cấu hình"
6. Verify success (config saved)

#### Part B: OAuth Connector (Google Sheets)

1. Create Google Sheets connector
2. Verify "Kết nối OAuth" button appears
3. Verify readonly OAuth token fields:
   - access_token (masked: ••••••••••••)
   - refresh_token (masked: ••••••••••••)
   - expires_in
   - scope
   - token_type
   - created

4. Click "Kết nối OAuth"
5. Verify redirect to OAuth URL:
   ```
   https://app.o1erp.com/api/workflow/get/workflow_connectors/oauth2?state={state}
   ```

### Expected Results

✅ Form fields render correctly based on connector type
✅ Validation works for all field types
✅ Required fields enforced
✅ Password fields are masked
✅ OAuth readonly fields show masked values
✅ Save updates config successfully

---

## 📋 Test Case 4: Chỉnh Sửa Thông Tin Cơ Bản (Edit Basic Info)

### Test Steps

1. From detail page, click Settings icon (⚙️)
2. Verify "Chỉnh sửa thông tin Connector" dialog opens
3. Verify form pre-filled với current values
4. Test validation:
   - Clear name → Shows "Tên connector là bắt buộc"
   - Enter name > 100 chars → Shows error
   - Enter description > 500 chars → Shows error
5. Update values:
   ```
   Tên: Updated Email Server
   Mô tả: Updated description for testing
   ```
6. Click "Lưu thay đổi"
7. Verify:
   - Dialog closes
   - Page title updates to new name
   - Changes reflected immediately

### Expected Results

✅ Dialog opens with current values
✅ Validation works correctly
✅ Save updates name and description
✅ UI updates immediately after save

---

## 📋 Test Case 5: Xóa Connector (Delete)

### Test Steps

1. From detail page, click "Xóa" button
2. Verify AlertDialog appears:
   - Title: "Xác nhận xóa connector"
   - Description: "Bạn có chắc chắn muốn xóa connector "{name}"? Hành động này không thể hoàn tác."
   - Buttons: "Hủy", "Xóa"
3. Click "Hủy" → Dialog closes, nothing happens
4. Click "Xóa" again
5. Click "Xóa" button in dialog
6. Verify:
   - Loading state on button
   - Dialog closes
   - Navigate back to list page
   - Connector removed from list

### Expected Results

✅ Confirmation dialog appears
✅ Can cancel deletion
✅ Deletion removes connector
✅ Auto-navigate to list after delete
✅ Connector no longer appears in list

---

## 📋 Test Case 6: OAuth Callback Flow

### Test Steps

#### Successful OAuth Flow

1. Start OAuth from detail page
2. After redirect, return with URL:
   ```
   http://localhost:4173/{locale}/workspaces/{workspaceId}/workflow-connectors/oauth-callback?connector_id=xxx&status=success
   ```
3. Verify:
   - Loading spinner appears
   - Message: "Đang hoàn tất kết nối OAuth..."
   - Auto-redirect to connector detail
   - OAuth tokens populated in readonly fields

#### Error OAuth Flow

1. Return with error URL:
   ```
   http://localhost:4173/{locale}/workspaces/{workspaceId}/workflow-connectors/oauth-callback?connector_id=xxx&status=error&error=access_denied
   ```
2. Verify:
   - Error alert appears
   - Error message displayed
   - "Quay lại danh sách Connectors" button works

### Expected Results

✅ Success flow auto-completes and shows tokens
✅ Error flow shows user-friendly error message
✅ Can retry/navigate back from error state

---

## 📋 Test Case 7: Responsive Design

### Test Steps

1. Open connector list/select/detail pages
2. Test on different screen sizes:
   - Mobile (375px): 1 column grid
   - Tablet (768px): 2 column grid
   - Desktop (1024px+): 3 column grid

3. Test keyboard navigation:
   - Tab through connector cards
   - Enter key to select
   - Tab through form fields
   - Submit forms with Enter

4. Test accessibility:
   - Use screen reader
   - Check ARIA labels
   - Verify focus indicators

### Expected Results

✅ Grid adapts to screen size
✅ All interactive elements keyboard accessible
✅ Focus indicators visible
✅ ARIA labels present

---

## 🐛 Known Issues / Limitations

### Current Limitations

1. **No Toast Notifications**: Currently using `console.error()` instead of visual toasts
2. **Basic Markdown**: Documentation shows as plain text in `<pre>` tag
3. **Hardcoded OAuth URL**: Should be env variable
4. **No OAuth State Validation**: CSRF protection needs implementation

### Workarounds

1. Check browser console for success/error messages
2. Markdown will be added in future phase
3. OAuth URL works but needs config
4. OAuth state should be validated server-side

---

## 📊 Performance Benchmarks

### Bundle Sizes

- connector-list-page: 4.01 kB (gzipped: 1.75 kB)
- connector-select-page: 6.26 kB (gzipped: 2.66 kB)
- connector-detail-page: 10.95 kB (gzipped: 3.65 kB)
- oauth-callback: 1.23 kB (gzipped: 0.73 kB)

**Total**: ~23 kB gzipped for all Phase 3 code

### Load Times (Expected)

- Initial page load: < 1s
- Navigation between pages: < 200ms (cached)
- Form submission: < 500ms (API dependent)

---

## 🔍 Debugging Tips

### Check API Calls

Open DevTools → Network tab → Filter: `workflow_connectors`

Expected endpoints:

- `GET /api/workspace/{id}/workflow/get/workflow_connectors` - List
- `GET /api/workspace/{id}/workflow/get/workflow_connectors/{connectorId}` - Detail
- `POST /api/workspace/{id}/workflow/post/workflow_connectors` - Create
- `POST /api/workspace/{id}/workflow/patch/workflow_connectors/{connectorId}` - Update
- `POST /api/workspace/{id}/workflow/delete/workflow_connectors/{connectorId}` - Delete
- `POST /api/workspace/{id}/workflow/get/workflow_connectors/{connectorId}/oauth2_state` - OAuth

### Check React Query DevTools

1. Open browser console
2. Look for React Query DevTools
3. Check query states: loading, success, error
4. Verify cache invalidation after mutations

### Check Console Logs

Currently errors/success messages logged to console:

- "Failed to create connector"
- "Failed to save config"
- "Failed to update connector"
- "Failed to delete connector"
- "OAuth callback error"

---

## ✅ Test Checklist

### Functionality

- [ ] List view displays connectors
- [ ] Category filtering works
- [ ] Create dialog validates input
- [ ] Connector created successfully
- [ ] Detail page shows config form
- [ ] Config form validates correctly
- [ ] Save config works
- [ ] Edit basic info works
- [ ] Delete confirmation works
- [ ] OAuth flow redirects correctly
- [ ] OAuth callback handles success
- [ ] OAuth callback handles errors

### UI/UX

- [ ] Loading states appear
- [ ] Error messages clear
- [ ] Responsive on mobile/tablet/desktop
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Empty states helpful

### Security

- [ ] Password fields masked
- [ ] Secret OAuth tokens masked
- [ ] Input validation prevents XSS
- [ ] Form validation works

### Performance

- [ ] Pages load quickly
- [ ] No unnecessary re-renders
- [ ] React Query caching works
- [ ] Bundle sizes acceptable

---

## 📞 Support

Nếu gặp vấn đề:

1. Check console for errors
2. Check Network tab for failed API calls
3. Verify backend API is running
4. Check React Query cache state
5. Clear browser cache and reload

---

**Build Status**: ✅ Passing (15.13s)
**TypeScript**: ✅ No errors
**Dev Server**: ✅ Running at http://localhost:4173/
