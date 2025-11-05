# Tài liệu: Hành động cẩn trọng (Danger Zone)

## 1. Tổng quan

Phần **Hành động cẩn trọng** (Danger Zone) chứa các hành động có tác động lớn và không thể hoàn tác, chủ yếu là xóa bảng dữ liệu.

### Chức năng chính:

- Xóa bảng dữ liệu và toàn bộ cấu hình
- Confirmation dialog để tránh xóa nhầm
- UI cảnh báo rõ ràng về tính nguy hiểm của hành động

---

## 2. Component React

```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentTable } from '@/store/slices/tableConfigSlice';
import { tableApi } from '@/services/api';

interface DangerZoneProps {
  tableId: string;
}

const DangerZone: React.FC<DangerZoneProps> = ({ tableId }) => {
  const navigate = useNavigate();
  const currentTable = useAppSelector(selectCurrentTable);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteTable = async () => {
    if (confirmText !== currentTable?.name) {
      alert('Tên bảng không khớp. Vui lòng nhập chính xác tên bảng để xác nhận xóa.');
      return;
    }

    setIsDeleting(true);

    try {
      await tableApi.deleteTable(tableId);

      // Show success message
      alert(`Đã xóa bảng "${currentTable?.name}" thành công.`);

      // Navigate back to list
      navigate('/active-tables');
    } catch (error) {
      console.error('Error deleting table:', error);
      alert(`Lỗi khi xóa bảng: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setShowConfirmDialog(false);
      setConfirmText('');
    }
  };

  return (
    <div className="danger-zone-section">
      <div className="section-header">
        <h3>Hành động cẩn trọng</h3>
      </div>

      <div className="danger-zone-content">
        <div className="warning-box">
          <div className="warning-icon">
            <span className="material-icons">warning</span>
          </div>
          <div className="warning-text">
            <h4>Xóa bảng này</h4>
            <p>
              Khi xóa bảng, tất cả dữ liệu, cấu hình, và lịch sử liên quan sẽ bị xóa vĩnh viễn.
              <strong> Hành động này không thể hoàn tác.</strong>
            </p>
          </div>
        </div>

        <button className="btn btn-danger" onClick={() => setShowConfirmDialog(true)}>
          <span className="material-icons">delete_forever</span>
          Xóa bảng này
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="modal-overlay" onClick={() => !isDeleting && setShowConfirmDialog(false)}>
          <div className="modal-content danger-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xác nhận xóa bảng</h3>
              <button className="close-btn" onClick={() => setShowConfirmDialog(false)} disabled={isDeleting}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="danger-warning">
                <span className="material-icons">error</span>
                <p>
                  <strong>Cảnh báo:</strong> Bạn sắp xóa bảng <strong>"{currentTable?.name}"</strong>. Tất cả dữ liệu và
                  cấu hình sẽ bị mất vĩnh viễn.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="confirm-table-name">
                  Nhập tên bảng <code>{currentTable?.name}</code> để xác nhận:
                </label>
                <input
                  id="confirm-table-name"
                  type="text"
                  className="form-control"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={currentTable?.name}
                  disabled={isDeleting}
                  autoFocus
                />
              </div>

              <div className="consequences-list">
                <p>
                  <strong>Khi xóa bảng, những điều sau sẽ xảy ra:</strong>
                </p>
                <ul>
                  <li>Tất cả bản ghi (records) sẽ bị xóa</li>
                  <li>Tất cả cấu hình fields, actions, filters sẽ bị xóa</li>
                  <li>Tất cả cấu hình hiển thị (List, Detail, Kanban, Gantt) sẽ bị xóa</li>
                  <li>Tất cả cấu hình phân quyền sẽ bị xóa</li>
                  <li>Lịch sử thay đổi và comments sẽ bị xóa</li>
                  <li>Các workflow, automation liên quan có thể bị ảnh hưởng</li>
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowConfirmDialog(false)} disabled={isDeleting}>
                Hủy
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteTable}
                disabled={confirmText !== currentTable?.name || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner"></span>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <span className="material-icons">delete_forever</span>
                    Xác nhận xóa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DangerZone;
```

---

## 3. API Service

```typescript
// tableApi.ts
export const tableApi = {
  async deleteTable(tableId: string): Promise<void> {
    const response = await apiClient.delete(`/api/workspace/${workspaceId}/active_tables/${tableId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete table');
    }
  },
};
```

---

## 4. CSS Classes

```css
/* Danger Zone Section */
.danger-zone-section {
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 2px solid #fecaca;
}

.danger-zone-section .section-header h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #dc2626;
}

.danger-zone-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Warning Box */
.warning-box {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

.warning-icon {
  flex-shrink: 0;
}

.warning-icon .material-icons {
  font-size: 32px;
  color: #dc2626;
}

.warning-text h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #991b1b;
}

.warning-text p {
  margin: 0;
  font-size: 14px;
  color: #7f1d1d;
  line-height: 1.5;
}

.warning-text p strong {
  font-weight: 600;
  color: #dc2626;
}

/* Danger Button */
.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);
}

.btn-danger:disabled {
  background: #fca5a5;
  cursor: not-allowed;
}

/* Danger Modal */
.danger-modal {
  border: 2px solid #dc2626;
}

.danger-modal .modal-header {
  background: #fef2f2;
  border-bottom: 1px solid #fecaca;
}

.danger-modal .modal-header h3 {
  color: #dc2626;
}

.danger-warning {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin-bottom: 20px;
}

.danger-warning .material-icons {
  font-size: 24px;
  color: #dc2626;
  flex-shrink: 0;
}

.danger-warning p {
  margin: 0;
  font-size: 14px;
  color: #7f1d1d;
  line-height: 1.5;
}

.danger-warning strong {
  font-weight: 600;
  color: #991b1b;
}

.danger-warning code {
  padding: 2px 6px;
  background: #fee2e2;
  border-radius: 4px;
  font-family: 'Monaco', monospace;
  font-size: 13px;
  color: #991b1b;
}

/* Consequences List */
.consequences-list {
  margin-top: 20px;
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.consequences-list p {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.consequences-list ul {
  margin: 0;
  padding-left: 20px;
}

.consequences-list li {
  margin-bottom: 8px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

/* Form in Danger Modal */
.danger-modal .form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.danger-modal .form-group label code {
  padding: 2px 6px;
  background: #f3f4f6;
  border-radius: 4px;
  font-family: 'Monaco', monospace;
  font-size: 13px;
  color: #1f2937;
}

.danger-modal .form-control {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.danger-modal .form-control:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

/* Loading Spinner in Danger Button */
.btn-danger .spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

## 5. So sánh với Code gốc

```javascript
static async deleteTableConfig() {
    if (!States.currentTable) {
        CommonUtils.showMessage('Không có bảng để xóa.', false);
        return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa Bảng ${States.currentTable.name}?`)) {
        return;
    }

    const response = await TableAPI.deleteTable(States.currentTable.id);
    CommonUtils.navigateToList();
}

// API call
static async deleteTable(tableId) {
    try {
        const response = await CommonUtils.apiCall(`${API_PREFIX}/delete/active_tables/${tableId}`, {});
        return { message: response.message };
    } catch (error) {
        throw new Error(error.message || 'Lỗi khi xóa bảng');
    }
}
```

### Điểm khác biệt React 19:

1. **Confirmation**: Modal chi tiết thay vì `confirm()` đơn giản
2. **Input Verification**: Yêu cầu nhập tên bảng để confirm
3. **Consequences List**: Liệt kê rõ các hậu quả của việc xóa
4. **Loading State**: Hiển thị trạng thái loading khi đang xóa
5. **Error Handling**: Xử lý lỗi và hiển thị message chi tiết

---

## 6. Quy trình nghiệp vụ

### Xóa bảng:

1. Người dùng click "Xóa bảng này"
2. Hiển thị modal xác nhận với:
   - Cảnh báo chi tiết
   - Input yêu cầu nhập tên bảng
   - Danh sách hậu quả
3. Người dùng nhập chính xác tên bảng
4. Click "Xác nhận xóa"
5. Gọi API delete table
6. Hiển thị loading state
7. Nếu thành công: Navigate về danh sách tables
8. Nếu lỗi: Hiển thị error message

---

## 7. Best Practices

### Security:

1. Require explicit confirmation (nhập tên bảng)
2. Disable actions during deletion process
3. Log deletion actions for audit

### UX:

1. Clear warning messages
2. List all consequences
3. Allow cancel at any time before final confirmation
4. Show loading state during deletion
5. Provide feedback after deletion

### Error Handling:

1. Handle API errors gracefully
2. Show specific error messages
3. Don't navigate away if deletion fails
4. Allow retry on failure
