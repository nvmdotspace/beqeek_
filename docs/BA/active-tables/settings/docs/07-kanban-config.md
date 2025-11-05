# Tài liệu: Thiết lập Kanban (Kanban Configuration)

## 1. Tổng quan

Phần **Thiết lập Kanban** cho phép tạo các màn hình hiển thị dữ liệu dạng bảng Kanban, nơi các bản ghi được nhóm theo trạng thái và hiển thị dưới dạng thẻ (cards).

### Chức năng chính:

- Tạo nhiều cấu hình Kanban cho cùng một bảng
- Chọn trường làm trạng thái (status field) - chỉ hỗ trợ SELECT_ONE, SELECT_ONE_WORKSPACE_USER
- Chọn trường làm tiêu đề thẻ (headline)
- Chọn các trường hiển thị trên thẻ
- Mỗi cấu hình có screen ID riêng để truy cập

---

## 2. Cấu trúc dữ liệu

### TypeScript Interfaces

```typescript
interface KanbanConfig {
  kanbanScreenId: string; // UUID v7
  screenName: string; // Tên màn hình Kanban
  screenDescription?: string; // Mô tả màn hình
  statusField: string; // Trường làm trạng thái (phải là SELECT_ONE hoặc SELECT_ONE_WORKSPACE_USER)
  kanbanHeadlineField: string; // Trường làm tiêu đề thẻ
  displayFields: string[]; // Các trường hiển thị trên thẻ
}

interface KanbanState {
  kanbanConfigs: KanbanConfig[];
  fields: Field[];
  editingIndex: number | null;
}
```

---

## 3. Component React

```tsx
import React, { useState } from 'react';
import Select from 'react-select';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  addKanbanConfig,
  updateKanbanConfig,
  removeKanbanConfig,
  selectKanbanConfigs,
  selectFields,
} from '@/store/slices/tableConfigSlice';

const KanbanConfiguration: React.FC = () => {
  const dispatch = useAppDispatch();
  const kanbanConfigs = useAppSelector(selectKanbanConfigs);
  const fields = useAppSelector(selectFields);

  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<KanbanConfig>({
    kanbanScreenId: '',
    screenName: '',
    screenDescription: '',
    statusField: '',
    kanbanHeadlineField: '',
    displayFields: [],
  });

  // Lọc các trường phù hợp làm status field
  const eligibleStatusFields = fields.filter((field) =>
    ['SELECT_ONE', 'SELECT_ONE_WORKSPACE_USER'].includes(field.type),
  );

  // Options cho react-select
  const fieldOptions = fields.map((field) => ({
    value: field.name,
    label: `${field.label} (${field.type})`,
  }));

  const handleOpenForm = (index: number | null = null) => {
    if (eligibleStatusFields.length === 0) {
      alert('Không có trường nào phù hợp để làm trường trạng thái Kanban.');
      return;
    }

    setEditingIndex(index);

    if (index !== null) {
      setFormData(kanbanConfigs[index]);
    } else {
      setFormData({
        kanbanScreenId: generateUUIDv7(),
        screenName: '',
        screenDescription: '',
        statusField: eligibleStatusFields[0]?.name || '',
        kanbanHeadlineField: '',
        displayFields: [],
      });
    }

    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.screenName || !formData.statusField) {
      alert('Vui lòng nhập tên màn hình và chọn trường trạng thái.');
      return;
    }

    if (editingIndex !== null) {
      dispatch(updateKanbanConfig({ index: editingIndex, config: formData }));
    } else {
      dispatch(addKanbanConfig(formData));
    }

    setShowForm(false);
    setFormData({
      kanbanScreenId: '',
      screenName: '',
      screenDescription: '',
      statusField: '',
      kanbanHeadlineField: '',
      displayFields: [],
    });
  };

  const handleRemove = (index: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa cấu hình Kanban này?')) {
      dispatch(removeKanbanConfig(index));
    }
  };

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
    <div className="kanban-config-section">
      <div className="section-header">
        <h3>Thiết lập Kanban</h3>
        <button className="btn btn-primary" onClick={() => handleOpenForm()}>
          <span className="material-icons">add</span>
          Thêm Cấu hình Kanban
        </button>
      </div>

      {eligibleStatusFields.length === 0 && (
        <div className="alert alert-warning">
          Không có trường nào phù hợp. Vui lòng thêm trường kiểu SELECT_ONE hoặc SELECT_ONE_WORKSPACE_USER.
        </div>
      )}

      <div className="kanban-config-list">
        {kanbanConfigs.map((config, index) => {
          const statusField = fields.find((f) => f.name === config.statusField);
          return (
            <div key={config.kanbanScreenId} className="kanban-config-item">
              <div className="config-item-header">
                <div>
                  <h4>{config.screenName}</h4>
                  {config.screenDescription && <p className="description">{config.screenDescription}</p>}
                </div>
                <div className="actions">
                  <button className="icon-btn" onClick={() => handleOpenForm(index)}>
                    <span className="material-icons">edit</span>
                  </button>
                  <button className="icon-btn" onClick={() => handleRemove(index)}>
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              </div>
              <div className="config-details">
                <div className="detail-item">
                  <span className="label">Trường trạng thái:</span>
                  <span className="value">
                    {statusField ? `${statusField.label} (${statusField.type})` : config.statusField}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Screen ID:</span>
                  <code className="value">{config.kanbanScreenId}</code>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingIndex !== null ? 'Sửa Cấu hình Kanban' : 'Thêm Cấu hình Kanban'}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="modal-body">
              <input type="hidden" value={formData.kanbanScreenId} />

              <div className="form-group">
                <label>
                  Tên màn hình <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.screenName}
                  onChange={(e) => setFormData({ ...formData, screenName: e.target.value })}
                  placeholder="Ví dụ: Kanban theo trạng thái"
                />
              </div>

              <div className="form-group">
                <label>Mô tả màn hình</label>
                <textarea
                  className="form-control"
                  value={formData.screenDescription}
                  onChange={(e) => setFormData({ ...formData, screenDescription: e.target.value })}
                  placeholder="Mô tả ngắn gọn về màn hình này"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>
                  Trường trạng thái <span className="required">*</span>
                </label>
                <select
                  className="form-control"
                  value={formData.statusField}
                  onChange={(e) => setFormData({ ...formData, statusField: e.target.value })}
                >
                  <option value="">Chọn trường trạng thái</option>
                  {eligibleStatusFields.map((field) => (
                    <option key={field.name} value={field.name}>
                      {field.label} ({field.type})
                    </option>
                  ))}
                </select>
                <small className="form-text">
                  Trường này xác định các cột trong bảng Kanban. Mỗi giá trị của trường sẽ là một cột.
                </small>
              </div>

              <div className="form-group">
                <label>Trường headline</label>
                <select
                  className="form-control"
                  value={formData.kanbanHeadlineField}
                  onChange={(e) => setFormData({ ...formData, kanbanHeadlineField: e.target.value })}
                >
                  <option value="">Chọn trường headline</option>
                  {fields.map((field) => (
                    <option key={field.name} value={field.name}>
                      {field.label} ({field.type})
                    </option>
                  ))}
                </select>
                <small className="form-text">Trường này sẽ hiển thị làm tiêu đề chính của thẻ Kanban.</small>
              </div>

              <div className="form-group">
                <label>Các trường hiển thị</label>
                <Select
                  isMulti
                  options={fieldOptions}
                  value={fieldOptions.filter((opt) => formData.displayFields.includes(opt.value))}
                  onChange={(selected) =>
                    setFormData({
                      ...formData,
                      displayFields: selected.map((s) => s.value),
                    })
                  }
                  placeholder="Chọn các trường..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
                <small className="form-text">Các trường này sẽ hiển thị trên thẻ Kanban.</small>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
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

export default KanbanConfiguration;
```

---

## 4. Redux Slice

```typescript
const tableConfigSlice = createSlice({
  name: 'tableConfig',
  initialState,
  reducers: {
    addKanbanConfig: (state, action: PayloadAction<KanbanConfig>) => {
      state.kanbanConfigs.push(action.payload);
    },

    updateKanbanConfig: (state, action: PayloadAction<{ index: number; config: KanbanConfig }>) => {
      const { index, config } = action.payload;
      if (index >= 0 && index < state.kanbanConfigs.length) {
        state.kanbanConfigs[index] = config;
      }
    },

    removeKanbanConfig: (state, action: PayloadAction<number>) => {
      state.kanbanConfigs.splice(action.payload, 1);
    },
  },
});

export const { addKanbanConfig, updateKanbanConfig, removeKanbanConfig } = tableConfigSlice.actions;
export const selectKanbanConfigs = (state: RootState) => state.tableConfig.kanbanConfigs;
```

---

## 5. So sánh với Code gốc (Blade Template)

```javascript
static renderKanbanConfigs() {
    const kanbanConfigList = document.getElementById('kanban-config-list');
    const fields = this.fields;
    kanbanConfigList.innerHTML = this.kanbanConfigs.map((config, index) => {
        const field = fields.find(f => f.name === config.statusField);
        return `
<div class="kanban-config-item">
    <div class="kanban-config-item-header">
        <span>${config.screenName}</span>
        <div class="field-actions">
            <span class="material-icons field-action-btn" onclick="DetailView.editKanbanConfig(${index})">edit</span>
            <span class="material-icons field-action-btn" onclick="DetailView.removeKanbanConfig(${index})">delete</span>
        </div>
    </div>
    <div>Trường trạng thái: ${field ? field.label : config.statusField} (${field ? field.type : 'Không xác định'})</div>
</div>
`;
    }).join('');
}

static openKanbanConfigForm(index = null) {
    this.editingKanbanConfigIndex = index;

    // Populate status field dropdown with eligible fields
    const eligibleFields = this.fields.filter(field =>
        ['SELECT_ONE', 'SELECT_ONE_WORKSPACE_USER'].includes(field.type)
    );

    kanbanStatusField.innerHTML = '<option value="">Chọn trường trạng thái</option>' +
        eligibleFields.map(field => `
<option value="${field.name}">${field.label} (${field.type})</option>
`).join('');

    // Populate display fields options
    displayFields.innerHTML = this.fields.map(field => `
<option value="${field.name}">${field.label} (${field.type})</option>
`).join('');

    // Reset or populate form
    if (index !== null) {
        const config = this.kanbanConfigs[index];
        kanbanScreenId.value = config.screenId || CommonUtils.generateUUIDv7();
        kanbanScreenName.value = config.screenName;
        kanbanScreenDescription.value = config.screenDescription || '';
        kanbanStatusField.value = config.statusField || '';
        kanbanHeadlineField.value = config.kanbanHeadlineField || '';
        $('#kanban-display-fields').val(config.displayFields || []);
    } else {
        kanbanScreenId.value = CommonUtils.generateUUIDv7();
        // ...
    }

    $('#kanban-display-fields').select2();
    CommonUtils.togglePopup('kanban-config-form');
}

static saveKanbanConfig() {
    const kanbanScreenId = document.getElementById('kanban-screen-id')?.value;
    const kanbanScreenName = document.getElementById('kanban-screen-name')?.value;
    const kanbanStatusField = document.getElementById('kanban-status-field')?.value;
    const displayFields = $('#kanban-display-fields').val() || [];

    if (!kanbanScreenName || !kanbanStatusField) {
        CommonUtils.showMessage('Vui lòng nhập tên màn hình và chọn trường trạng thái.', false);
        return;
    }

    const kanbanConfig = {
        kanbanScreenId,
        screenName: kanbanScreenName,
        screenDescription: kanbanScreenDescription,
        statusField: kanbanStatusField,
        kanbanHeadlineField: kanbanHeadlineField,
        displayFields: displayFields,
    };

    if (this.editingKanbanConfigIndex !== null) {
        this.kanbanConfigs[this.editingKanbanConfigIndex] = kanbanConfig;
    } else {
        this.kanbanConfigs.push(kanbanConfig);
    }

    this.renderKanbanConfigs();
    CommonUtils.closePopup();
}
```

---

## 6. Quy trình nghiệp vụ

### Thêm cấu hình Kanban:

1. Kiểm tra có trường SELECT_ONE hoặc SELECT_ONE_WORKSPACE_USER
2. Tạo UUID v7 cho screen ID
3. Nhập tên và mô tả màn hình
4. Chọn trường trạng thái (bắt buộc)
5. Chọn trường headline và display fields
6. Lưu vào Redux store

### Validation:

- Screen name: bắt buộc
- Status field: bắt buộc, phải là SELECT_ONE hoặc SELECT_ONE_WORKSPACE_USER
- Headline field và display fields: tùy chọn

---

## 7. CSS Classes

```css
.kanban-config-section {
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
}

.kanban-config-item {
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
}

.config-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.config-item-header h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.config-item-header .description {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.config-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.detail-item .label {
  font-weight: 500;
  color: #374151;
}

.detail-item .value {
  color: #6b7280;
}

.detail-item code {
  padding: 2px 6px;
  background: #f3f4f6;
  border-radius: 4px;
  font-family: 'Monaco', monospace;
  font-size: 12px;
}
```
