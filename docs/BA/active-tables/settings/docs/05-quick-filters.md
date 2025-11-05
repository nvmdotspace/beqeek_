# Tài liệu: Cấu hình Bộ lọc nhanh (Quick Filters)

## 1. Tổng quan

Phần **Cấu hình bộ lọc nhanh** cho phép người dùng tạo và quản lý các bộ lọc nhanh cho bảng dữ liệu. Các bộ lọc này giúp người dùng nhanh chóng lọc dữ liệu dựa trên các trường có kiểu dữ liệu đặc biệt như checkbox, select, reference.

### Chức năng chính:

- Thêm bộ lọc nhanh từ các trường phù hợp
- Hiển thị danh sách bộ lọc nhanh hiện có
- Chỉnh sửa và xóa bộ lọc nhanh
- Hỗ trợ các kiểu trường: CHECKBOX_YES_NO, SELECT_ONE, SELECT_LIST, SELECT_ONE_RECORD, SELECT_ONE_WORKSPACE_USER, SELECT_LIST_WORKSPACE_USER

---

## 2. Cấu trúc dữ liệu

### TypeScript Interfaces

```typescript
// Interface cho Quick Filter
interface QuickFilter {
  filterId: string; // UUID v7
  fieldName: string; // Tên trường được lọc
  fieldLabel?: string; // Nhãn hiển thị của trường
  fieldType?: string; // Loại trường (CHECKBOX_YES_NO, SELECT_ONE, etc.)
}

// Interface cho Field (để tham chiếu)
interface Field {
  name: string;
  label: string;
  type: string;
  // ... các thuộc tính khác
}

// State interface
interface QuickFiltersState {
  quickFilters: QuickFilter[];
  fields: Field[];
  editingFilterIndex: number | null;
}
```

---

## 3. Component React

### Component QuickFilters

```tsx
import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  addQuickFilter,
  updateQuickFilter,
  removeQuickFilter,
  selectQuickFilters,
  selectFields,
} from '@/store/slices/tableConfigSlice';

interface QuickFiltersProps {
  tableId: string;
}

const QuickFilters: React.FC<QuickFiltersProps> = ({ tableId }) => {
  const dispatch = useAppDispatch();
  const quickFilters = useAppSelector(selectQuickFilters);
  const fields = useAppSelector(selectFields);

  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedFieldName, setSelectedFieldName] = useState('');

  // Lọc các trường phù hợp để làm bộ lọc nhanh
  const eligibleFields = fields.filter((field) =>
    [
      'CHECKBOX_YES_NO',
      'SELECT_ONE',
      'SELECT_LIST',
      'SELECT_ONE_RECORD',
      'SELECT_ONE_WORKSPACE_USER',
      'SELECT_LIST_WORKSPACE_USER',
    ].includes(field.type),
  );

  const handleOpenForm = (index: number | null = null) => {
    setEditingIndex(index);

    if (index !== null) {
      const filter = quickFilters[index];
      setSelectedFieldName(filter.fieldName);
    } else {
      setSelectedFieldName(eligibleFields[0]?.name || '');
    }

    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingIndex(null);
    setSelectedFieldName('');
  };

  const handleSaveFilter = () => {
    if (!selectedFieldName) {
      alert('Vui lòng chọn trường để lọc.');
      return;
    }

    const selectedField = fields.find((f) => f.name === selectedFieldName);
    if (!selectedField) {
      alert('Trường không hợp lệ.');
      return;
    }

    const filterData: QuickFilter = {
      filterId: editingIndex !== null ? quickFilters[editingIndex].filterId : generateUUIDv7(),
      fieldName: selectedField.name,
      fieldLabel: selectedField.label,
      fieldType: selectedField.type,
    };

    if (editingIndex !== null) {
      dispatch(updateQuickFilter({ index: editingIndex, filter: filterData }));
    } else {
      dispatch(addQuickFilter(filterData));
    }

    handleCloseForm();
  };

  const handleRemoveFilter = (index: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa bộ lọc này?')) {
      dispatch(removeQuickFilter(index));
    }
  };

  // Utility function để tạo UUID v7
  const generateUUIDv7 = (): string => {
    const timestamp = Date.now();
    const timestampHex = timestamp.toString(16).padStart(12, '0');
    const randomBytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
    randomBytes[6] = (randomBytes[6] & 0x0f) | 0x70;
    randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80;
    const hex = randomBytes.map((b) => b.toString(16).padStart(2, '0'));
    return `${timestampHex.slice(0, 8)}-${timestampHex.slice(8, 12)}-${hex[4]}-${hex[6]}-${hex[8]}${hex[9]}${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`;
  };

  return (
    <div className="quick-filters-section">
      <div className="section-header">
        <h3>Cấu hình bộ lọc nhanh</h3>
        <button className="btn btn-primary" onClick={() => handleOpenForm()} disabled={eligibleFields.length === 0}>
          <span className="material-icons">add</span>
          Thêm Quick Filter
        </button>
      </div>

      {eligibleFields.length === 0 && (
        <div className="alert alert-warning">
          Không có trường nào phù hợp để làm bộ lọc nhanh. Vui lòng thêm trường có kiểu CHECKBOX, SELECT hoặc REFERENCE.
        </div>
      )}

      <div className="quick-filter-list">
        {quickFilters.map((filter, index) => {
          const field = fields.find((f) => f.name === filter.fieldName);
          return (
            <div key={filter.filterId} className="filter-item">
              <div className="filter-item-header">
                <span className="filter-name">{filter.fieldLabel || filter.fieldName}</span>
                <div className="filter-actions">
                  <button className="icon-btn" onClick={() => handleOpenForm(index)} title="Chỉnh sửa">
                    <span className="material-icons">edit</span>
                  </button>
                  <button className="icon-btn" onClick={() => handleRemoveFilter(index)} title="Xóa">
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              </div>
              <div className="filter-details">
                <span className="field-type-badge">{field?.type || filter.fieldType}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingIndex !== null ? 'Sửa Quick Filter' : 'Thêm Quick Filter'}</h3>
              <button className="close-btn" onClick={handleCloseForm}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="filter-field">
                  Trường Quick Filter <span className="required">*</span>
                </label>
                <select
                  id="filter-field"
                  className="form-control"
                  value={selectedFieldName}
                  onChange={(e) => setSelectedFieldName(e.target.value)}
                >
                  {eligibleFields.map((field) => (
                    <option key={field.name} value={field.name}>
                      {field.label} ({field.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseForm}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleSaveFilter}>
                <span className="material-icons">check</span>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickFilters;
```

---

## 4. Redux Slice

### tableConfigSlice.ts

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

// ... existing interfaces and state

const tableConfigSlice = createSlice({
  name: 'tableConfig',
  initialState,
  reducers: {
    // ... existing reducers

    addQuickFilter: (state, action: PayloadAction<QuickFilter>) => {
      state.quickFilters.push(action.payload);
    },

    updateQuickFilter: (state, action: PayloadAction<{ index: number; filter: QuickFilter }>) => {
      const { index, filter } = action.payload;
      if (index >= 0 && index < state.quickFilters.length) {
        state.quickFilters[index] = filter;
      }
    },

    removeQuickFilter: (state, action: PayloadAction<number>) => {
      state.quickFilters.splice(action.payload, 1);
    },

    setQuickFilters: (state, action: PayloadAction<QuickFilter[]>) => {
      state.quickFilters = action.payload;
    },
  },
});

export const { addQuickFilter, updateQuickFilter, removeQuickFilter, setQuickFilters } = tableConfigSlice.actions;

// Selectors
export const selectQuickFilters = (state: RootState) => state.tableConfig.quickFilters;

export default tableConfigSlice.reducer;
```

---

## 5. Custom Hooks

### useQuickFilters.ts

```typescript
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addQuickFilter,
  updateQuickFilter,
  removeQuickFilter,
  selectQuickFilters,
  selectFields,
} from '@/store/slices/tableConfigSlice';

export const useQuickFilters = () => {
  const dispatch = useAppDispatch();
  const quickFilters = useAppSelector(selectQuickFilters);
  const fields = useAppSelector(selectFields);

  const eligibleFields = fields.filter((field) =>
    [
      'CHECKBOX_YES_NO',
      'SELECT_ONE',
      'SELECT_LIST',
      'SELECT_ONE_RECORD',
      'SELECT_ONE_WORKSPACE_USER',
      'SELECT_LIST_WORKSPACE_USER',
    ].includes(field.type),
  );

  const handleAddFilter = useCallback(
    (filter: QuickFilter) => {
      dispatch(addQuickFilter(filter));
    },
    [dispatch],
  );

  const handleUpdateFilter = useCallback(
    (index: number, filter: QuickFilter) => {
      dispatch(updateQuickFilter({ index, filter }));
    },
    [dispatch],
  );

  const handleRemoveFilter = useCallback(
    (index: number) => {
      dispatch(removeQuickFilter(index));
    },
    [dispatch],
  );

  return {
    quickFilters,
    eligibleFields,
    addFilter: handleAddFilter,
    updateFilter: handleUpdateFilter,
    removeFilter: handleRemoveFilter,
  };
};
```

---

## 6. API Services

### quickFiltersApi.ts

```typescript
import apiClient from '@/lib/apiClient';

export interface SaveQuickFiltersRequest {
  tableId: string;
  quickFilters: QuickFilter[];
}

export interface SaveQuickFiltersResponse {
  success: boolean;
  message: string;
  data: {
    quickFilters: QuickFilter[];
  };
}

export const quickFiltersApi = {
  // Lưu cấu hình quick filters (thực tế là lưu trong table config)
  async saveQuickFilters(request: SaveQuickFiltersRequest): Promise<SaveQuickFiltersResponse> {
    const response = await apiClient.patch(`/api/workspace/${workspaceId}/active_tables/${request.tableId}`, {
      config: {
        quickFilters: request.quickFilters,
      },
    });
    return response.data;
  },

  // Lấy danh sách quick filters
  async getQuickFilters(tableId: string): Promise<QuickFilter[]> {
    const response = await apiClient.get(`/api/workspace/${workspaceId}/active_tables/${tableId}`);
    return response.data.data.config.quickFilters || [];
  },
};
```

---

## 7. CSS Classes

### quick-filters.css

```css
/* Quick Filters Section */
.quick-filters-section {
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.quick-filters-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.quick-filters-section .section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

/* Quick Filter List */
.quick-filter-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-item {
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.filter-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.filter-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.filter-item-header .filter-name {
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  padding: 6px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: #e5e7eb;
}

.icon-btn .material-icons {
  font-size: 18px;
  color: #6b7280;
}

.icon-btn:hover .material-icons {
  color: #1f2937;
}

.filter-details {
  display: flex;
  gap: 8px;
  align-items: center;
}

.field-type-badge {
  display: inline-block;
  padding: 4px 8px;
  background: #dbeafe;
  color: #1e40af;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
}

/* Alert */
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.alert-warning {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  padding: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

/* Form Styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-group .required {
  color: #ef4444;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

---

## 8. Quy trình nghiệp vụ

### 8.1. Thêm Quick Filter mới

1. Người dùng click nút "Thêm Quick Filter"
2. Hệ thống kiểm tra có trường phù hợp không (CHECKBOX, SELECT, REFERENCE)
3. Nếu không có → hiển thị cảnh báo
4. Nếu có → mở form chọn trường
5. Người dùng chọn trường từ dropdown
6. Click "Xác nhận"
7. Hệ thống tạo UUID v7 cho filter
8. Thêm filter vào danh sách
9. Cập nhật Redux store
10. Đóng form

### 8.2. Chỉnh sửa Quick Filter

1. Người dùng click icon "edit" trên filter
2. Mở form với giá trị hiện tại
3. Người dùng thay đổi trường
4. Click "Xác nhận"
5. Cập nhật filter trong danh sách
6. Cập nhật Redux store
7. Đóng form

### 8.3. Xóa Quick Filter

1. Người dùng click icon "delete"
2. Hiển thị confirm dialog
3. Nếu xác nhận → xóa filter khỏi danh sách
4. Cập nhật Redux store

### 8.4. Lưu cấu hình

1. Người dùng click nút "Lưu" (ở component cha)
2. Thu thập tất cả quick filters
3. Gửi request PATCH đến API
4. API cập nhật config.quickFilters
5. Trả về kết quả
6. Hiển thị thông báo thành công/lỗi

---

## 9. Validation Rules

### 9.1. Khi thêm/sửa Quick Filter:

- **Trường lọc (fieldName)**: Bắt buộc, phải là tên trường hợp lệ
- **Kiểu trường**: Chỉ chấp nhận các loại sau:
  - CHECKBOX_YES_NO
  - SELECT_ONE
  - SELECT_LIST
  - SELECT_ONE_RECORD
  - SELECT_ONE_WORKSPACE_USER
  - SELECT_LIST_WORKSPACE_USER

### 9.2. Logic nghiệp vụ:

- Không cho phép tạo quick filter nếu không có trường phù hợp
- Mỗi trường chỉ được tạo một quick filter
- Filter ID phải là UUID v7 duy nhất

---

## 10. So sánh với Code gốc (Blade Template)

### Code gốc (JavaScript):

```javascript
static renderQuickFilters() {
    const quickFilterList = document.getElementById('quick-filter-list');
    if (!quickFilterList) {
        console.error('Quick filter list element not found');
        return;
    }
    quickFilterList.innerHTML = this.quickFilters.map((filter, index) => {
        const field = this.fields.find(f => f.name === filter.fieldName);
        return `
            <div class="filter-item">
                <div class="filter-item-header">
                    <span>${field ? field.label : filter.fieldName} (${field ? field.type : 'Không xác định'})</span>
                    <div class="field-actions">
                        <span class="material-icons field-action-btn" onclick="DetailView.editQuickFilter(${index})">edit</span>
                        <span class="material-icons field-action-btn" onclick="DetailView.removeQuickFilter(${index})">delete</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

static openQuickFilterForm(index = null) {
    this.editingQuickFilterIndex = index;
    CommonUtils.setupPopup(
        index === null ? 'Thêm Quick Filter' : 'Sửa Quick Filter',
        'check',
        'Xác nhận'
    );

    const popupForm = document.createElement('div');
    popupForm.id = 'quick-filter-form';
    popupForm.innerHTML = `
        <div class="popup-form-container">
            <div class="popup-form">
                <div>
                    <label>Trường Quick Filter <span style="color: #ef4444;">*</span></label>
                    <select id="quick-filter-field">
                        ${this.fields
                            .filter(field => ['CHECKBOX_YES_NO', 'SELECT_ONE', 'SELECT_LIST', 'SELECT_ONE_RECORD', 'SELECT_ONE_WORKSPACE_USER', 'SELECT_LIST_WORKSPACE_USER'].includes(field.type))
                            .map(field => `<option value="${field.name}">${field.label} (${field.type})</option>`)
                            .join('')}
                    </select>
                </div>
            </div>
        </div>
    `;
    // ... more code
}

static saveQuickFilterConfig() {
    const fieldName = document.getElementById('quick-filter-field')?.value;
    if (!fieldName) {
        CommonUtils.showMessage('Vui lòng chọn trường để lọc.', false);
        return;
    }

    const field = this.fields.find(f => f.name === fieldName);
    const quickFilter = {
        filterId: CommonUtils.generateUUIDv7(),
        fieldName: fieldName,
        fieldLabel: field ? field.label : fieldName,
        fieldType: field ? field.type : 'UNKNOWN'
    };

    if (this.editingQuickFilterIndex !== null) {
        this.quickFilters[this.editingQuickFilterIndex] = quickFilter;
    } else {
        this.quickFilters.push(quickFilter);
    }

    this.renderQuickFilters();
    CommonUtils.closePopup();
}

static removeQuickFilter(index) {
    if (confirm('Bạn có chắc chắn muốn xóa bộ lọc này?')) {
        this.quickFilters.splice(index, 1);
        this.renderQuickFilters();
    }
}
```

### Điểm khác biệt React 19:

1. **State Management**: Redux Toolkit thay vì biến static
2. **Component Structure**: Functional component với hooks
3. **Type Safety**: TypeScript interfaces
4. **Event Handling**: React event handlers thay vì onclick attributes
5. **Rendering**: JSX thay vì template strings
6. **Form Management**: Controlled components với useState

---

## 11. Testing

### Unit Tests

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import QuickFilters from '@/components/QuickFilters';
import tableConfigReducer from '@/store/slices/tableConfigSlice';

describe('QuickFilters Component', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        tableConfig: tableConfigReducer
      },
      preloadedState: {
        tableConfig: {
          quickFilters: [],
          fields: [
            { name: 'status', label: 'Status', type: 'SELECT_ONE' },
            { name: 'active', label: 'Active', type: 'CHECKBOX_YES_NO' }
          ]
        }
      }
    });
  });

  it('should render quick filters section', () => {
    render(
      <Provider store={store}>
        <QuickFilters tableId="test-table" />
      </Provider>
    );

    expect(screen.getByText('Cấu hình bộ lọc nhanh')).toBeInTheDocument();
    expect(screen.getByText('Thêm Quick Filter')).toBeInTheDocument();
  });

  it('should open form when clicking add button', () => {
    render(
      <Provider store={store}>
        <QuickFilters tableId="test-table" />
      </Provider>
    );

    fireEvent.click(screen.getByText('Thêm Quick Filter'));

    expect(screen.getByText('Thêm Quick Filter')).toBeInTheDocument();
    expect(screen.getByLabelText(/Trường Quick Filter/)).toBeInTheDocument();
  });

  it('should add new quick filter', async () => {
    render(
      <Provider store={store}>
        <QuickFilters tableId="test-table" />
      </Provider>
    );

    fireEvent.click(screen.getByText('Thêm Quick Filter'));

    const select = screen.getByLabelText(/Trường Quick Filter/);
    fireEvent.change(select, { target: { value: 'status' } });

    fireEvent.click(screen.getByText('Xác nhận'));

    await waitFor(() => {
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  it('should disable add button when no eligible fields', () => {
    store = configureStore({
      reducer: {
        tableConfig: tableConfigReducer
      },
      preloadedState: {
        tableConfig: {
          quickFilters: [],
          fields: [
            { name: 'name', label: 'Name', type: 'SHORT_TEXT' }
          ]
        }
      }
    });

    render(
      <Provider store={store}>
        <QuickFilters tableId="test-table" />
      </Provider>
    );

    const addButton = screen.getByText('Thêm Quick Filter');
    expect(addButton).toBeDisabled();
  });
});
```

---

## 12. Ghi chú bổ sung

### 12.1. Lưu ý khi implement:

1. **Performance**: Sử dụng `useMemo` để cache danh sách eligible fields
2. **Error Handling**: Xử lý trường hợp field đã bị xóa nhưng vẫn tồn tại trong filter
3. **UX**: Disable form submission khi chưa có dữ liệu hợp lệ
4. **Validation**: Kiểm tra field type trước khi cho phép tạo filter

### 12.2. Tích hợp với các module khác:

- **Fields Configuration**: Lấy danh sách fields để tạo filters
- **Table Config**: Quick filters là một phần của table configuration
- **Record List**: Filters được sử dụng để lọc records trong danh sách

### 12.3. Best Practices:

1. Sử dụng Redux cho state management
2. Implement proper error boundaries
3. Add loading states khi save
4. Validate dữ liệu trước khi submit
5. Show confirmation dialog khi xóa
