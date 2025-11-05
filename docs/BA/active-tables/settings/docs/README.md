# Tài liệu Active Tables V2 - React 19 Implementation

## Tổng quan

Bộ tài liệu này mô tả chi tiết cách tái tạo toàn bộ chức năng của hệ thống Active Tables V2 (từ Blade template) sang React 19 với TypeScript.

## ⚠️ QUAN TRỌNG: Đọc về API Integration trước

**Hệ thống sử dụng một endpoint PATCH duy nhất** để lưu tất cả cấu hình (fields, actions, permissions, layouts, ...). Không có các endpoint riêng lẻ cho từng module.

👉 **Đọc [API Endpoints Analysis](./API-ENDPOINTS-ANALYSIS.md) TRƯỚC KHI implement bất kỳ module nào.**

## Cấu trúc tài liệu

### 1. [Cấu hình chung](./01-general-config.md)

Quản lý thông tin cơ bản của bảng:

- Table ID, name, description
- Encryption settings (E2EE)
- Table limit và default sort
- Hashed keyword fields

### 2. [Danh sách trường](./02-fields-config.md)

Quản lý các trường dữ liệu với 26+ loại field types:

- Text fields (SHORT_TEXT, TEXT, RICH_TEXT)
- Numeric fields (INTEGER, NUMERIC, CURRENCY)
- Date/Time fields (DATE, DATETIME)
- Selection fields (SELECT_ONE, SELECT_LIST)
- Reference fields (SELECT_ONE_RECORD, SELECT_LIST_RECORD)
- Special fields (CHECKBOX, EMAIL, PHONE, URL, FILE, SIGNATURE, LOCATION)
- User fields (SELECT_ONE_WORKSPACE_USER, SELECT_LIST_WORKSPACE_USER)

### 3. [Danh sách hành động](./03-actions-config.md)

Quản lý các hành động trên bảng:

- Default actions (create, access, update, delete)
- Comment actions (comment_create, comment_access, comment_update, comment_delete)
- Custom actions

### 4. [Cấu hình màn danh sách](./04-listview-config.md)

Cấu hình hiển thị danh sách bản ghi:

- **Generic Table**: Hiển thị dạng bảng với các cột tùy chọn
- **Head Column**: Hiển thị dạng card với title, sub-line, và tail fields

### 5. [Cấu hình bộ lọc nhanh](./05-quick-filters.md)

Tạo các bộ lọc nhanh cho bảng:

- Hỗ trợ các field types: CHECKBOX, SELECT, REFERENCE
- Cho phép tạo nhiều quick filters

### 6. [Cấu hình chi tiết](./06-detail-config.md)

Cấu hình hiển thị chi tiết bản ghi:

- **Head Detail**: Layout hiển thị theo hàng ngang
- **Two Column Detail**: Layout hiển thị 2 cột
- Cấu hình vị trí comments (right panel, bottom, hidden)

### 7. [Thiết lập Kanban](./07-kanban-config.md)

Tạo màn hình Kanban board:

- Chọn status field (SELECT_ONE, SELECT_ONE_WORKSPACE_USER)
- Cấu hình headline và display fields
- Hỗ trợ nhiều Kanban screens cho một bảng

### 8. [Thiết lập Gantt Chart](./08-gantt-config.md)

Tạo màn hình Gantt chart:

- Task name field (TEXT)
- Start/End date fields (DATE, DATETIME)
- Progress field (NUMERIC) - optional
- Dependency field (REFERENCE) - optional

### 9. [Phân quyền](./09-permissions-config.md)

Cấu hình phân quyền chi tiết:

- Phân quyền theo team và role
- Nhiều loại permission: all, self_created, assigned, team-based
- Hỗ trợ time-based permissions (2h, 12h, 24h, 48h, 72h)

### 10. [Hành động cẩn trọng](./10-danger-zone.md)

Các hành động nguy hiểm:

- Xóa bảng và toàn bộ dữ liệu
- Confirmation dialog với input verification

---

## Tech Stack

### Frontend

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Redux Toolkit**: State management
- **React Router**: Routing
- **react-select**: Multi-select components
- **Material Icons**: Icon system

### Styling

- **CSS Modules** hoặc **Styled Components**
- Responsive design
- Dark mode support (optional)

### API Integration

- **Axios** hoặc **Fetch API**
- RESTful API
- JWT Authentication
- Error handling và retry logic

---

## Cấu trúc thư mục đề xuất

```
src/
├── components/
│   ├── GeneralConfig/
│   │   ├── GeneralConfig.tsx
│   │   ├── GeneralConfig.module.css
│   │   └── index.ts
│   ├── FieldsConfig/
│   │   ├── FieldList.tsx
│   │   ├── FieldForm.tsx
│   │   ├── FieldTypeSelector.tsx
│   │   └── index.ts
│   ├── ActionsConfig/
│   ├── ListViewConfig/
│   ├── QuickFilters/
│   ├── DetailConfig/
│   ├── KanbanConfig/
│   ├── GanttConfig/
│   ├── PermissionsConfig/
│   └── DangerZone/
├── store/
│   ├── slices/
│   │   └── tableConfigSlice.ts
│   └── index.ts
├── services/
│   ├── api/
│   │   ├── tableApi.ts
│   │   ├── fieldsApi.ts
│   │   ├── actionsApi.ts
│   │   └── permissionsApi.ts
│   └── apiClient.ts
├── hooks/
│   ├── useTableConfig.ts
│   ├── useFields.ts
│   ├── useActions.ts
│   └── usePermissions.ts
├── types/
│   ├── table.ts
│   ├── field.ts
│   ├── action.ts
│   └── permission.ts
└── utils/
    ├── validation.ts
    ├── uuid.ts
    └── encryption.ts
```

---

## Quy trình triển khai đề xuất

### Phase 1: Setup & Core (Week 1-2)

1. ✅ Setup project (React + TypeScript + Redux)
2. ✅ Implement General Config
3. ✅ Implement Fields Config (basic types)
4. ✅ Setup API integration

### Phase 2: Advanced Fields & Actions (Week 3-4)

5. ✅ Complete all 26 field types
6. ✅ Implement Actions Config
7. ✅ Add validation logic

### Phase 3: View Configurations (Week 5-6)

8. ✅ Implement List View Config
9. ✅ Implement Detail Config
10. ✅ Implement Quick Filters

### Phase 4: Advanced Views (Week 7-8)

11. ✅ Implement Kanban Config
12. ✅ Implement Gantt Config
13. ✅ Testing và bug fixes

### Phase 5: Permissions & Finalize (Week 9-10)

14. ✅ Implement Permissions Config
15. ✅ Implement Danger Zone
16. ✅ Complete testing
17. ✅ Documentation
18. ✅ Deployment

---

## Key Features Comparison

| Feature               | Blade Template   | React 19 Implementation  |
| --------------------- | ---------------- | ------------------------ |
| State Management      | Static variables | Redux Toolkit            |
| Type Safety           | No               | TypeScript               |
| Component Reusability | Limited          | High                     |
| Testing               | Difficult        | Easy with Jest/RTL       |
| Performance           | Page reloads     | SPA, optimized rendering |
| Error Handling        | Basic            | Comprehensive            |
| UI/UX                 | Traditional      | Modern, responsive       |

---

## Notes cho developers

### Best Practices:

1. **Type Safety**: Luôn định nghĩa TypeScript interfaces trước khi code
2. **State Management**: Sử dụng Redux cho global state, useState cho local state
3. **API Calls**: Centralize tất cả API calls trong services layer
4. **Error Handling**: Implement comprehensive error boundaries
5. **Testing**: Viết unit tests cho mọi component
6. **Performance**: Use `useMemo`, `useCallback` để optimize renders
7. **Accessibility**: Đảm bảo tất cả components accessible (ARIA labels, keyboard navigation)

### Common Pitfalls:

1. ❌ Không validate input trước khi gửi API
2. ❌ Quên handle loading và error states
3. ❌ Không cleanup effects (memory leaks)
4. ❌ Mutation state trực tiếp thay vì immutable updates
5. ❌ Không optimize re-renders

### Security Considerations:

1. 🔒 Validate tất cả user input
2. 🔒 Sanitize data trước khi render (XSS prevention)
3. 🔒 Handle encryption keys securely (never log, use secure storage)
4. 🔒 Implement proper CSRF protection
5. 🔒 Use HTTPS cho tất cả API calls

---

## Testing Strategy

### Unit Tests:

- Component rendering
- User interactions
- State updates
- Utility functions

### Integration Tests:

- API integration
- Redux store interactions
- Form submissions
- Navigation flows

### E2E Tests:

- Critical user flows
- Table creation workflow
- Field configuration
- Permissions setup

---

## Resources

### Documentation:

- [React 19 Docs](https://react.dev)
- [Redux Toolkit Docs](https://redux-toolkit.js.org)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tools:

- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [TypeScript Playground](https://www.typescriptlang.org/play)

---

## Changelog

### Version 1.0.0 (2025-01-04)

- ✅ Hoàn thành tài liệu đầy đủ cho 10 modules
- ✅ Chi tiết implementation cho React 19 + TypeScript
- ✅ Code samples và best practices
- ✅ Testing strategies
- ✅ Deployment guidelines

---

## Contributors

Tài liệu này được tạo dựa trên phân tích code gốc từ `active-tables-v2.blade.php` và được chuyển đổi sang React 19 architecture.

---

## License

Internal documentation - Không phân phối ra ngoài tổ chức.
