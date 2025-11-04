# Technical Documentation

## Overview

This directory contains technical documentation for Beqeek's internal implementation details, focusing on Active Tables features.

## Contents

### Kanban Board

Complete analysis of the drag & drop Kanban board implementation:

- **[Kanban Drag & Drop Flow](./kanban-drag-drop-flow.md)** 📖  
  In-depth analysis of the entire drag & drop flow, encryption methods, API integration, and security considerations.
- **[API Payload Quick Reference](./kanban-api-payload-quick-ref.md)** ⚡  
  Quick reference guide for developers needing immediate answers about payload structure and encryption.
- **[Visual Flow Diagrams](./kanban-flow-diagrams.md)** 📊  
  Mermaid diagrams illustrating the system architecture, data flow, encryption pipeline, and error handling.

### Reference Implementations

- **[HTML Module Examples](./html-module/)** 🔍  
  Legacy PHP Blade template implementations for reference.
  - `active-table-records.blade.php` - Complete Active Tables UI with Kanban, Gantt, and Table views

## Quick Start

### For Backend Developers

1. Read [API Payload Quick Reference](./kanban-api-payload-quick-ref.md) to understand payload structure
2. Check the API endpoint section for request/response format
3. Review [Security Model diagram](./kanban-flow-diagrams.md#9-security-model) to understand encryption flow

### For Frontend Developers

1. Start with [Visual Flow Diagrams](./kanban-flow-diagrams.md) to understand the overall architecture
2. Read [Drag & Drop Event Flow](./kanban-drag-drop-flow.md#2-xử-lý-drop-event) for implementation details
3. Check [Encryption Methods](./kanban-drag-drop-flow.md#4-encryption-logic-commonutilsencrypttabledata) to understand field type handling

### For DevOps/Security

1. Review [Security Considerations](./kanban-drag-drop-flow.md#security-considerations)
2. Understand [Encryption Key Management](./kanban-drag-drop-flow.md#1-encryption-key-management)
3. Check [Security Model diagram](./kanban-flow-diagrams.md#9-security-model)

## Key Concepts

### End-to-End Encryption (E2EE)

Beqeek implements client-side E2EE for Active Tables:

- **Encryption key**: Stored in browser localStorage, never sent to server
- **Server validation**: Uses `SHA256³(key)` as auth key
- **Three encryption methods**:
  - HMAC-SHA256 for SELECT fields (equality search)
  - AES-256-CBC for TEXT fields (secure storage)
  - OPE for NUMERIC/DATE fields (range queries)

### Multi-Kanban Board Configuration

Một bảng Active Tables có thể có **nhiều cấu hình Kanban khác nhau**, cho phép người dùng xem dữ liệu theo nhiều cách:

**Cấu trúc dữ liệu**:

```javascript
{
  kanbanConfigs: [
    {
      kanbanScreenId: 'kanban-001', // ID duy nhất của cấu hình
      screenName: 'Task Status', // Tên hiển thị
      statusField: 'status', // Trường chứa trạng thái
      options: [
        // Các trạng thái khả dụng
        { value: 'todo', label: 'To Do' },
        { value: 'inprogress', label: 'In Progress' },
        { value: 'done', label: 'Done' },
      ],
    },
    {
      kanbanScreenId: 'kanban-002',
      screenName: 'Priority View',
      statusField: 'priority',
      options: [
        { value: 'low', label: 'Low Priority' },
        { value: 'medium', label: 'Medium Priority' },
        { value: 'high', label: 'High Priority' },
      ],
    },
  ];
}
```

**Luồng hoạt động**:

1. Khi người dùng truy cập `/table/{tableId}/kanban`, hệ thống sẽ:
   - Fetch tất cả `kanbanConfigs` từ `table.config`
   - Nếu không có `kanbanConfigId` trong URL, sẽ tự động chọn cấu hình đầu tiên
   - Hiển thị selector để chuyển đổi giữa các cấu hình (nếu có nhiều hơn 1)

2. Khi chuyển đổi cấu hình:
   - Gọi `KanbanView.switchKanbanConfig(kanbanScreenId)`
   - Cập nhật `currentKanbanConfig` trong state
   - Render lại toàn bộ Kanban board với cấu hình mới

3. API Calls cho mỗi cấu hình:
   - Cùng sử dụng endpoint `get/active_tables/{tableId}/records`
   - Filter theo `statusField` tương ứng với cấu hình đang active
   - Mỗi column sẽ fetch records với filter riêng theo status value

### Kanban Drag & Drop

When dragging a card between Kanban columns:

1. Client validates the status change
2. Encrypts the new status value based on field type
3. Creates hash for database indexing
4. Sends PATCH request with encrypted payload
5. Updates UI or rolls back on error

**Example payload**:

```json
{
  "record": {
    "status": "d96ba1768a0f22f6..." // Encrypted value
  },
  "record_hashes": {
    "status": "d96ba1768a0f22f6..." // Hash for indexing
  }
}
```

## Architecture Diagrams

### System Overview

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────┐
│  Browser/React  │ HTTPS │   API Server     │       │  Database   │
│                 ├──────►│                  ├──────►│  (E2EE)     │
│  - Encryption   │       │  - Validation    │       │             │
│  - UI/UX        │       │  - Business      │       │             │
│  - State Mgmt   │◄──────┤    Logic         │◄──────┤             │
└─────────────────┘       └──────────────────┘       └─────────────┘
     ▲
     │
     │ Encryption Key
     │ (Never leaves client)
     └──────────────────────────────────────────────────────
```

### Data Flow (Simplified)

```
User Action → Validate → Encrypt → Hash → API Call → Save → Response
     │                      │       │                           │
     │                      │       └─── For indexing           │
     │                      └─────────── For storage            │
     └──────────────────────────────────────────────────────────┘
                    Update UI or Rollback
```

## Related Documentation

### Core Documentation

- [README.md](../../README.md) - Project overview
- [CLAUDE.md](../../CLAUDE.md) - Coding guidelines
- [AGENTS.md](../../AGENTS.md) - Comprehensive development guide

### Feature Documentation

- [docs/feature-active-tables.md](../feature-active-tables.md) - Active Tables feature specification
- [docs/swagger.yaml](../swagger.yaml) - API specification

### Package Documentation

- [packages/encryption-core/](../../packages/encryption-core/) - Encryption utilities
- [packages/active-tables-core/](../../packages/active-tables-core/) - Active Tables core logic
- [apps/web/src/features/active-tables/](../../apps/web/src/features/active-tables/) - React implementation

## Migration Path

### From PHP Blade to React

The current implementation is in PHP Blade templates (`html-module/`). When migrating to React:

1. **State Management**: Replace global `States` with Zustand stores
2. **Drag & Drop**: Use `@dnd-kit/core` instead of vanilla DOM events
3. **Encryption**: Reuse `@workspace/encryption-core` package
4. **API Client**: Use `@/shared/api/active-tables-client.ts`
5. **Routing**: Use TanStack Router with file-based routing

See [MIGRATION_FILE_BASED_ROUTING.md](../../MIGRATION_FILE_BASED_ROUTING.md) for routing migration details.

## Testing

### Manual Testing Checklist

For Kanban drag & drop:

- [ ] Can drag card within same column (should cancel)
- [ ] Can drag card to different column (should update)
- [ ] Error shows when API fails (should rollback)
- [ ] Loading state shows during API call
- [ ] Success message shows on successful update
- [ ] Encryption key required before any operation
- [ ] Invalid key shows error message

### Automated Testing

Test scenarios to implement:

```typescript
describe('Kanban Drag & Drop', () => {
  it('should encrypt field value correctly', () => {
    const encrypted = encryptTableData(table, 'status', 'done');
    expect(encrypted).toMatch(/^[a-f0-9]{64}$/); // HMAC-SHA256 hex
  });

  it('should create record_hashes for indexing', () => {
    const hashes = hashRecordData(fields, record, key);
    expect(hashes).toHaveProperty('status');
    expect(hashes.status).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should rollback on API error', async () => {
    mockApiError();
    await handleDrop(recordId, newStatus);
    expect(screen.getByText(/lỗi/i)).toBeInTheDocument();
    // Verify card returned to original column
  });
});
```

## Troubleshooting

### Common Issues

**Q: API returns 400 Bad Request**  
A: Check payload structure and encryption. Use [Debugging Tips](./kanban-api-payload-quick-ref.md#debugging-tips).

**Q: Encryption key not found**  
A: User needs to input encryption key first. Check localStorage for `e2ee_key_{workspaceId}_{tableId}`.

**Q: Drag & drop not working**  
A: Check browser console for errors. Ensure `initDragAndDrop()` was called after board render.

**Q: Card jumps back after drop**  
A: API call likely failed. Check network tab and server logs.

## Contributing

When updating these technical docs:

1. Keep diagrams in sync with code changes
2. Update examples with real payload data
3. Add new encryption methods to the comparison table
4. Update migration notes for breaking changes

## Changelog

- **2025-11-03**: Initial documentation of Kanban drag & drop flow
  - Added comprehensive analysis
  - Added quick reference guide
  - Added visual diagrams with Mermaid

---

**Maintained by**: Engineering Team  
**Last Updated**: 2025-11-03  
**Version**: 1.0
