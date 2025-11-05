# Tài liệu Danh sách trường

## Tổng quan

Mục Danh sách trường cho phép người dùng quản lý cấu trúc dữ liệu của bảng thông qua việc thêm, sửa, xóa và sắp xếp các trường dữ liệu. Đây là một trong những phần quan trọng nhất vì nó xác định loại dữ liệu có thể lưu trữ và cách thức hiển thị của bảng.

## Thành phần giao diện

### 1. Danh sách trường hiện có

- **Mô tả**: Hiển thị danh sách tất cả các trường đã được tạo trong bảng
- **Thông tin hiển thị** cho mỗi trường:
  - Tên trường và loại dữ liệu
  - Placeholder (nếu có)
  - Giá trị mặc định (nếu có)
  - Trạng thái bắt buộc (Có/Không)
  - Giới hạn ký tự (nếu có)
  - Danh sách tùy chọn (đối với SELECT/CHECKBOX)
  - Thông tin tham chiếu (đối với các trường reference)
  - Điều kiện bổ sung (đối với các trường reference)
- **Hành động trên mỗi trường**:
  - Sửa (icon edit)
  - Xóa (icon delete)

### 2. Nút "Thêm trường"

- **Mô tả**: Nút để mở form thêm trường mới
- **Vị trí**: Ở cuối danh sách trường
- **Chức năng**: Mở popup form với tất các các tùy chọn cấu hình

### 3. Popup Form cấu hình trường

- **Mô tả**: Form chi tiết để thêm/sửa trường
- **Các phần chính**:
  - Loại trường
  - Tên trường
  - Tên biến (Name)
  - Placeholder
  - Giá trị mặc định
  - Các tùy chọn (cho SELECT/CHECKBOX)
  - Tham chiếu (cho các trường reference)
  - Trạng thái bắt buộc

## Các loại trường được hỗ trợ

### 1. Text-based Fields

- **SHORT_TEXT**: Text ngắn (dành cho tên, tiêu đề)
- **TEXT**: Text dài (dành cho mô tả, nội dung)
- **RICH_TEXT**: Rich Text với định dạng (dành cho nội dung phức tạp)
- **EMAIL**: Địa chỉ email (với validation)
- **URL**: Địa chỉ URL (với validation)

### 2. Date/Time Fields

- **YEAR**: Năm
- **MONTH**: Tháng
- **DAY**: Ngày
- **HOUR**: Giờ
- **MINUTE**: Phút
- **SECOND**: Giây
- **DATE**: Ngày tháng năm
- **DATETIME**: Ngày tháng năm và giờ phút
- **TIME**: Thời gian (giờ:phút)

### 3. Numeric Fields

- **INTEGER**: Số nguyên
- **NUMERIC**: Số thập phân

### 4. Selection Fields

- **CHECKBOX_YES_NO**: Checkbox Yes/No
- **CHECKBOX_ONE**: Checkbox đơn
- **CHECKBOX_LIST**: Danh sách checkbox (chọn nhiều)
- **SELECT_ONE**: Dropdown chọn một
- **SELECT_LIST**: Dropdown chọn nhiều

### 5. Reference Fields

- **SELECT_ONE_RECORD**: Chọn một bản ghi từ bảng khác
- **SELECT_LIST_RECORD**: Chọn nhiều bản ghi từ bảng khác
- **FIRST_REFERENCE_RECORD**: Tham chiếu đến bản ghi đầu tiên liên quan

### 6. User Fields

- **SELECT_ONE_WORKSPACE_USER**: Chọn một người dùng trong workspace
- **SELECT_LIST_WORKSPACE_USER**: Chọn nhiều người dùng trong workspace

## Cấu trúc dữ liệu (React)

### 1. Field Interface

```typescript
interface Field {
  id?: string;
  type: FieldType;
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  required?: boolean;
  maxlength?: number;
  options?: FieldOption[];
  referenceTableId?: string;
  referenceField?: string;
  referenceLabelField?: string;
  additionalCondition?: string;
}

interface FieldOption {
  text: string;
  value: string;
  text_color?: string;
  background_color?: string;
}

type FieldType =
  // Text-based
  | 'SHORT_TEXT'
  | 'TEXT'
  | 'RICH_TEXT'
  | 'EMAIL'
  | 'URL'
  // Date/Time
  | 'YEAR'
  | 'MONTH'
  | 'DAY'
  | 'HOUR'
  | 'MINUTE'
  | 'SECOND'
  | 'DATE'
  | 'DATETIME'
  | 'TIME'
  // Numeric
  | 'INTEGER'
  | 'NUMERIC'
  // Selection
  | 'CHECKBOX_YES_NO'
  | 'CHECKBOX_ONE'
  | 'CHECKBOX_LIST'
  | 'SELECT_ONE'
  | 'SELECT_LIST'
  // Reference
  | 'SELECT_ONE_RECORD'
  | 'SELECT_LIST_RECORD'
  | 'FIRST_REFERENCE_RECORD'
  // User
  | 'SELECT_ONE_WORKSPACE_USER'
  | 'SELECT_LIST_WORKSPACE_USER';
```

### 2. Fields State

```typescript
interface FieldsState {
  fields: Field[];
  isEditing: boolean;
  editingFieldIndex: number | null;
  isFormOpen: boolean;
  isSaving: boolean;
  error: string | null;
}
```

## Component React 19

### 1. FieldList Component

```typescript
interface FieldListProps {
  fields: Field[];
  tables: Table[];
  onAddField: () => void;
  onEditField: (index: number) => void;
  onDeleteField: (index: number) => void;
  onFieldSave: (field: Field, index?: number) => void;
  onFieldCancel: () => void;
  isLoading: boolean;
}

const FieldList: React.FC<FieldListProps> = ({
  fields,
  tables,
  onAddField,
  onEditField,
  onDeleteField,
  onFieldSave,
  onFieldCancel,
  isLoading
}) => {
  const [fieldFormOpen, setFieldFormOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Lấy tên bảng từ ID
  const getTableName = (tableId: string): string => {
    const table = tables.find(t => t.id === tableId);
    return table ? table.name : tableId;
  };

  // Render một item trường
  const renderFieldItem = (field: Field, index: number) => {
    return (
      <div className="field-item" key={index}>
        <div className="field-item-header">
          <span>{field.label} ({field.type})</span>
          <div className="field-actions">
            <span
              className="material-icons field-action-btn"
              onClick={() => handleEditField(index)}
            >
              edit
            </span>
            <span
              className="material-icons field-action-btn"
              onClick={() => handleDeleteField(index)}
            >
              delete
            </span>
          </div>
        </div>
        <div>Placeholder: {field.placeholder || 'Không có'}</div>
        <div>Giá trị mặc định: {field.defaultValue ? String(field.defaultValue) : 'Không có'}</div>
        <div>Bắt buộc: {field.required ? 'Có' : 'Không'}</div>
        {field.maxlength && <div>Giới hạn ký tự: {field.maxlength}</div>}
        {field.options && (
          <div>Tùy chọn: {field.options.map(opt => opt.text).join(', ')}</div>
        )}
        {field.referenceTableId && (
          <div>Bảng tham chiếu: {getTableName(field.referenceTableId)}</div>
        )}
        {field.type === 'FIRST_REFERENCE_RECORD' && field.referenceField && (
          <div>Trường liên kết: {field.referenceField}</div>
        )}
        {field.referenceLabelField && (
          <div>Trường hiển thị: {field.referenceLabelField}</div>
        )}
        {field.additionalCondition && (
          <div>Điều kiện bổ sung: {field.additionalCondition}</div>
        )}
      </div>
    );
  };

  // Xử lý sửa trường
  const handleEditField = (index: number) => {
    setEditingField(fields[index]);
    setEditingIndex(index);
    setFieldFormOpen(true);
  };

  // Xử lý xóa trường
  const handleDeleteField = (index: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa trường này?')) {
      onDeleteField(index);
    }
  };

  // Xử lý thêm trường mới
  const handleAddField = () => {
    setEditingField(null);
    setEditingIndex(null);
    setFieldFormOpen(true);
  };

  // Xử lý lưu trường
  const handleFieldSave = (field: Field) => {
    if (editingIndex !== null) {
      onFieldSave(field, editingIndex);
    } else {
      onFieldSave(field);
    }
    setFieldFormOpen(false);
    setEditingField(null);
    setEditingIndex(null);
  };

  // Xử lý hủy form
  const handleFieldCancel = () => {
    setFieldFormOpen(false);
    setEditingField(null);
    setEditingIndex(null);
    onFieldCancel();
  };

  return (
    <div className="fields-container">
      <h2>Cấu hình trường dữ liệu</h2>

      <div className="fields-list" id="field-list">
        {isLoading ? (
          <div className="loading-spinner">Đang tải...</div>
        ) : (
          fields.map((field, index) => renderFieldItem(field, index))
        )}
      </div>

      <div className="add-field-btn" onClick={handleAddField}>
        Thêm trường
      </div>

      {fieldFormOpen && (
        <FieldForm
          field={editingField}
          tables={tables}
          onSave={handleFieldSave}
          onCancel={handleFieldCancel}
          existingFields={fields}
        />
      )}
    </div>
  );
};
```

### 2. FieldForm Component

```typescript
interface FieldFormProps {
  field?: Field | null;
  tables: Table[];
  onSave: (field: Field) => void;
  onCancel: () => void;
  existingFields: Field[];
}

const FieldForm: React.FC<FieldFormProps> = ({
  field,
  tables,
  onSave,
  onCancel,
  existingFields
}) => {
  const [formData, setFormData] = useState<Field>({
    type: 'SHORT_TEXT',
    label: '',
    name: '',
    placeholder: '',
    defaultValue: '',
    required: false,
    options: [],
    referenceTableId: '',
    referenceField: '',
    referenceLabelField: '',
    additionalCondition: ''
  });

  const [options, setOptions] = useState<FieldOption[]>([]);
  const [referenceFields, setReferenceFields] = useState<Field[]>([]);
  const [allReferenceFields, setAllReferenceFields] = useState<Field[]>([]);

  // Khởi tạo form khi field được chọn để sửa
  useEffect(() => {
    if (field) {
      setFormData({
        ...field,
        name: field.name || ''
      });
      setOptions(field.options || []);
    }
  }, [field]);

  // Tải danh sách trường tham chiếu khi thay đổi bảng tham chiếu
  useEffect(() => {
    if (formData.referenceTableId && ['SELECT_ONE_RECORD', 'SELECT_LIST_RECORD', 'FIRST_REFERENCE_RECORD'].includes(formData.type)) {
      // Trong thực tế, đây sẽ là API call để lấy fields của bảng tham chiếu
      // Tạm thời giả sử có sẵn dữ liệu
      const mockFields: Field[] = [
        { id: '1', type: 'SHORT_TEXT', label: 'Tên', name: 'name' },
        { id: '2', type: 'INTEGER', label: 'ID', name: 'id' }
      ];
      setAllReferenceFields(mockFields);

      // Lọc các trường có referenceTableId khớp với tableId hiện tại
      if (formData.type === 'FIRST_REFERENCE_RECORD') {
        const validRefFields = mockFields.filter(f =>
          f.referenceTableId === field?.referenceTableId &&
          ['SELECT_ONE_RECORD', 'SELECT_LIST_RECORD', 'FIRST_REFERENCE_RECORD'].includes(f.type)
        );
        setReferenceFields(validRefFields);
      }
    } else {
      setAllReferenceFields([]);
      setReferenceFields([]);
    }
  }, [formData.referenceTableId, formData.type, field?.referenceTableId]);

  // Cập nhật formData khi có thay đổi
  const handleFieldChange = (field: keyof Field, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Xử lý thay đổi loại trường
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as FieldType;

    // Reset các trường liên quan khi đổi loại
    setFormData(prev => ({
      ...prev,
      type,
      options: [],
      referenceTableId: '',
      referenceField: '',
      referenceLabelField: '',
      additionalCondition: ''
    }));

    // Reset options
    setOptions([]);
  };

  // Thêm một tùy chọn mới
  const addOption = () => {
    setOptions(prev => [
      ...prev,
      {
        text: '',
        value: '',
        text_color: '#000000',
        background_color: '#FFFFFF'
      }
    ]);
  };

  // Xóa một tùy chọn
  const removeOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  // Cập nhật một tùy chọn
  const updateOption = (index: number, field: keyof FieldOption, value: string) => {
    setOptions(prev => prev.map((opt, i) =>
      i === index ? { ...opt, [field]: value } : opt
    ));
  };

  // Tạo tên biến từ tên trường
  const generateFieldName = (label: string): string => {
    return label
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
      .toLowerCase()
      .split(/\W+/)
      .filter(Boolean)
      .join('_');
  };

  // Xử lý thay đổi tên trường để tự động tạo tên biến
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const label = e.target.value;
    handleFieldChange('label', label);

    // Chỉ tự động tạo tên biến nếu chưa có hoặc trống
    if (!formData.name || formData.name === '') {
      handleFieldChange('name', generateFieldName(label));
    }
  };

  // Xác thực form
  const validateForm = (): { isValid: boolean; error: string } => {
    if (!formData.label.trim()) {
      return { isValid: false, error: 'Tên trường không được để trống.' };
    }

    if (!formData.name.trim()) {
      return { isValid: false, error: 'Tên biến không được để trống.' };
    }

    // Kiểm tra trùng tên biến
    const duplicateName = existingFields.some((f, i) =>
      f.name === formData.name && f.id !== field?.id
    );
    if (duplicateName) {
      return { isValid: false, error: 'Tên biến đã tồn tại.' };
    }

    // Kiểm tra các loại trường đặc biệt
    if (['SELECT_ONE', 'SELECT_LIST', 'CHECKBOX_LIST'].includes(formData.type)) {
      if (options.length === 0 || options.every(opt => !opt.text.trim())) {
        return { isValid: false, error: 'Vui lòng thêm ít nhất một tùy chọn.' };
      }
    }

    if (['SELECT_ONE_RECORD', 'SELECT_LIST_RECORD', 'FIRST_REFERENCE_RECORD'].includes(formData.type)) {
      if (!formData.referenceTableId || !formData.referenceLabelField) {
        return { isValid: false, error: 'Vui lòng chọn bảng tham chiếu và trường hiển thị.' };
      }

      if (formData.type === 'FIRST_REFERENCE_RECORD' && !formData.referenceField) {
        return { isValid: false, error: 'Vui lòng chọn trường liên kết.' };
      }
    }

    return { isValid: true, error: '' };
  };

  // Xử lý lưu form
  const handleSave = () => {
    const { isValid, error } = validateForm();

    if (!isValid) {
      alert(error);
      return;
    }

    const fieldData = {
      ...formData,
      options: ['SELECT_ONE', 'SELECT_LIST', 'CHECKBOX_LIST'].includes(formData.type) ? options : undefined
    };

    onSave(fieldData);
  };

  // Render phần tùy chọn
  const renderOptionsSection = () => {
    if (!['SELECT_ONE', 'SELECT_LIST', 'CHECKBOX_ONE', 'CHECKBOX_LIST'].includes(formData.type)) {
      return null;
    }

    return (
      <div id="options-field" style={{ display: 'block' }}>
        <label>Tùy chọn (Select/Checkbox List)</label>
        <div className="option-list">
          {options.map((option, index) => (
            <div className="option-item" key={index}>
              <input
                type="text"
                value={option.text}
                onChange={e => updateOption(index, 'text', e.target.value)}
                placeholder="Tên tùy chọn"
              />
              <input
                type="text"
                value={option.value}
                onChange={e => updateOption(index, 'value', e.target.value)}
                placeholder="Giá trị"
              />
              <input
                type="color"
                className="option-text-color"
                value={option.text_color || '#000000'}
                onChange={e => updateOption(index, 'text_color', e.target.value)}
                title="Màu chữ"
              />
              <input
                type="color"
                className="option-background-color"
                value={option.background_color || '#FFFFFF'}
                onChange={e => updateOption(index, 'background_color', e.target.value)}
                title="Màu nền"
              />
              <button
                className="btn btn-destructive"
                onClick={() => removeOption(index)}
              >
                Xóa
              </button>
            </div>
          ))}
        </div>
        <button className="btn btn-secondary" onClick={addOption}>
          Thêm tùy chọn
        </button>
      </div>
    );
  };

  // Render phần tham chiếu
  const renderReferenceSection = () => {
    if (!['SELECT_ONE_RECORD', 'SELECT_LIST_RECORD', 'FIRST_REFERENCE_RECORD'].includes(formData.type)) {
      return null;
    }

    return (
      <div id="reference-field" style={{ display: 'block' }}>
        <label>Bảng Tham chiếu <span style={{ color: '#ef4444' }}>*</span></label>
        <select
          value={formData.referenceTableId}
          onChange={e => handleFieldChange('referenceTableId', e.target.value)}
        >
          <option value="">Chọn bảng</option>
          {tables.map(table => (
            <option key={table.id} value={table.id}>{table.name}</option>
          ))}
        </select>

        {formData.type === 'FIRST_REFERENCE_RECORD' && (
          <div id="reference-field-container" style={{ display: 'block' }}>
            <label>Trường Liên kết <span style={{ color: '#ef4444' }}>*</span></label>
            <select
              value={formData.referenceField}
              onChange={e => handleFieldChange('referenceField', e.target.value)}
            >
              <option value="">Chọn trường</option>
              {referenceFields.map(field => (
                <option key={field.name} value={field.name}>
                  {field.label} ({field.type})
                </option>
              ))}
            </select>
          </div>
        )}

        <label>Trường Hiển thị <span style={{ color: '#ef4444' }}>*</span></label>
        <select
          value={formData.referenceLabelField}
          onChange={e => handleFieldChange('referenceLabelField', e.target.value)}
        >
          <option value="">Chọn trường</option>
          {allReferenceFields.map(field => (
            <option key={field.name} value={field.name}>
              {field.label} ({field.type})
            </option>
          ))}
        </select>

        <label>Điều kiện bổ sung</label>
        <input
          type="text"
          value={formData.additionalCondition}
          onChange={e => handleFieldChange('additionalCondition', e.target.value)}
          placeholder="Ví dụ: active=1"
        />
      </div>
    );
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>{field ? 'Sửa trường' : 'Thêm trường mới'}</h2>

        <div className="popup-form-container">
          <div className="popup-form">
            <div>
              <label>Loại trường <span style={{ color: '#ef4444' }}>*</span></label>
              <select
                value={formData.type}
                onChange={handleTypeChange}
              >
                <option value="SHORT_TEXT">Short Text</option>
                <option value="YEAR">Year</option>
                <option value="MONTH">Month</option>
                <option value="DAY">Day</option>
                <option value="HOUR">Hour</option>
                <option value="MINUTE">Minute</option>
                <option value="SECOND">Second</option>
                <option value="RICH_TEXT">Rich Text</option>
                <option value="TEXT">Text</option>
                <option value="DATE">Date</option>
                <option value="DATETIME">DateTime</option>
                <option value="TIME">Time</option>
                <option value="INTEGER">Integer</option>
                <option value="NUMERIC">Numeric</option>
                <option value="EMAIL">Email</option>
                <option value="URL">URL</option>
                <option value="CHECKBOX_YES_NO">Checkbox Yes/No</option>
                <option value="CHECKBOX_ONE">Checkbox One</option>
                <option value="CHECKBOX_LIST">Checkbox List</option>
                <option value="SELECT_ONE">Select One</option>
                <option value="SELECT_LIST">Select List</option>
                <option value="SELECT_ONE_RECORD">Select One Record</option>
                <option value="SELECT_LIST_RECORD">Select List Record</option>
                <option value="FIRST_REFERENCE_RECORD">First Reference Record</option>
                <option value="SELECT_ONE_WORKSPACE_USER">Select One Workspace User</option>
                <option value="SELECT_LIST_WORKSPACE_USER">Select List Workspace User</option>
              </select>
            </div>

            <div>
              <label>Tên trường <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                value={formData.label}
                onChange={handleLabelChange}
                placeholder="Tên trường"
              />
            </div>

            <div>
              <label>Tên biến (Name)</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => handleFieldChange('name', e.target.value)}
                placeholder="Tên biến"
              />
            </div>

            <div>
              <label>Placeholder</label>
              <input
                type="text"
                value={formData.placeholder}
                onChange={e => handleFieldChange('placeholder', e.target.value)}
                placeholder="Placeholder"
              />
            </div>

            <div>
              <label>Giá trị mặc định</label>
              <input
                type="text"
                value={formData.defaultValue}
                onChange={e => handleFieldChange('defaultValue', e.target.value)}
                placeholder="Giá trị mặc định"
              />
            </div>

            {renderOptionsSection()}
            {renderReferenceSection()}

            <div className="switch-label">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={formData.required || false}
                  onChange={e => handleFieldChange('required', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <label>Bắt buộc</label>
            </div>
          </div>
        </div>

        <div className="message" style={{ display: 'none' }}></div>

        <div className="popup-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            <span className="material-icons">close</span>
            Hủy
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <span className="material-icons">check</span>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};
```

## State Management (Redux/Context)

### 1. Redux Slice

```typescript
const fieldsSlice = createSlice({
  name: 'fields',
  initialState: {
    fields: [],
    isLoading: false,
    isSaving: false,
    error: null,
  } as FieldsState,
  reducers: {
    setFields: (state, action) => {
      state.fields = action.payload;
    },
    addField: (state, action) => {
      state.fields.push(action.payload);
    },
    updateField: (state, action) => {
      const { index, field } = action.payload;
      state.fields[index] = field;
    },
    deleteField: (state, action) => {
      state.fields.splice(action.payload, 1);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setSaving: (state, action) => {
      state.isSaving = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});
```

### 2. API Integration

**⚠️ LƯU Ý QUAN TRỌNG**:

Không có API endpoint riêng cho Fields. Tất cả fields được quản lý trong **client-side state** và lưu thông qua **một endpoint PATCH duy nhất**:

```
PATCH /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}
```

#### Cách hoạt động:

1. **Thêm field mới** (chỉ thay đổi state local):

```javascript
// User click "Thêm trường" -> Mở popup -> Nhập thông tin -> "Xác nhận"
static async saveFieldConfig() {
  const fieldConfig = {
    type: fieldType,
    label: fieldLabel,
    name: fieldName || CommonUtils.tokenize(fieldLabel).join('_'),
    placeholder: fieldPlaceholder,
    defaultValue: fieldDefault,
    required: fieldRequired,
    options: [...],  // Nếu là SELECT/CHECKBOX
    referenceTableId: '...',  // Nếu là reference field
    // ...
  };

  // CHỈ thêm vào state local, CHƯA GỬI API
  if (this.editingFieldIndex !== null) {
    this.fields[this.editingFieldIndex] = fieldConfig;  // Update
  } else {
    this.fields.push(fieldConfig);  // Create
  }

  await this.renderFields();  // Re-render UI
  CommonUtils.closePopup();

  // Lưu ý: API chỉ được gọi khi user nhấn nút "Lưu" chính
}
```

2. **Xóa field** (chỉ thay đổi state local):

```javascript
static removeField(index) {
  if (confirm('Bạn có chắc chắn muốn xóa trường này?')) {
    this.fields.splice(index, 1);  // CHỈ xóa khỏi state local
    this.renderFields();
  }
}
```

3. **Lưu tất cả thay đổi** (khi nhấn nút "Lưu" chính):

```javascript
static async saveTableConfig() {
  // Gửi TOÀN BỘ config, bao gồm fields đã thay đổi
  const response = await TableAPI.updateTable(tableId, {
    config: {
      fields: this.fields,  // ← TẤT CẢ fields (đã thêm/sửa/xóa)
      actions: this.actions,
      quickFilters: this.quickFilters,
      // ... tất cả config khác
    }
  });
}
```

4. **Lấy reference tables** (cho reference fields):

```javascript
// Sử dụng endpoint GET danh sách bảng
const tables = await TableAPI.fetchTables();
// GET /api/workspace/{workspaceId}/workflow/get/active_tables
```

**Đặc điểm:**

- ✅ CRUD operations chỉ thay đổi state local (`DetailView.fields[]`)
- ✅ Không có immediate API call khi thêm/sửa/xóa field
- ✅ Tất cả changes được batch save khi user nhấn "Lưu"
- ✅ Popup validation chỉ là client-side validation
- ✅ Server validation chỉ xảy ra khi gọi `updateTable()`

Xem [API Endpoints Analysis](./API-ENDPOINTS-ANALYSIS.md) để biết chi tiết đầy đủ.

## Hook tùy chỉnh

### 1. useFields Hook

```typescript
interface UseFieldsOptions {
  tableId: string;
}

const useFields = ({ tableId }: UseFieldsOptions) => {
  const dispatch = useAppDispatch();
  const fields = useAppSelector((state) => state.fields.fields);
  const isLoading = useAppSelector((state) => state.fields.isLoading);
  const isSaving = useAppSelector((state) => state.fields.isSaving);
  const error = useAppSelector((state) => state.fields.error);

  // Tải danh sách trường
  const fetchFields = useCallback(async () => {
    dispatch(fieldsSlice.actions.setLoading(true));
    try {
      const data = await fieldAPI.fetchFields(tableId);
      dispatch(fieldsSlice.actions.setFields(data));
    } catch (err) {
      dispatch(fieldsSlice.actions.setError(err.message));
    } finally {
      dispatch(fieldsSlice.actions.setLoading(false));
    }
  }, [dispatch, tableId]);

  // Thêm trường mới
  const addField = useCallback(
    async (field: Field) => {
      dispatch(fieldsSlice.actions.setSaving(true));
      try {
        const newField = await fieldAPI.createField(tableId, field);
        dispatch(fieldsSlice.actions.addField(newField));
        return newField;
      } catch (err) {
        dispatch(fieldsSlice.actions.setError(err.message));
        throw err;
      } finally {
        dispatch(fieldsSlice.actions.setSaving(false));
      }
    },
    [dispatch, tableId],
  );

  // Cập nhật trường
  const updateField = useCallback(
    async (index: number, field: Field) => {
      dispatch(fieldsSlice.actions.setSaving(true));
      try {
        const updatedField = await fieldAPI.updateField(tableId, index, field);
        dispatch(fieldsSlice.actions.updateField({ index, field: updatedField }));
        return updatedField;
      } catch (err) {
        dispatch(fieldsSlice.actions.setError(err.message));
        throw err;
      } finally {
        dispatch(fieldsSlice.actions.setSaving(false));
      }
    },
    [dispatch, tableId],
  );

  // Xóa trường
  const deleteField = useCallback(
    async (index: number) => {
      dispatch(fieldsSlice.actions.setSaving(true));
      try {
        await fieldAPI.deleteField(tableId, index);
        dispatch(fieldsSlice.actions.deleteField(index));
      } catch (err) {
        dispatch(fieldsSlice.actions.setError(err.message));
        throw err;
      } finally {
        dispatch(fieldsSlice.actions.setSaving(false));
      }
    },
    [dispatch, tableId],
  );

  return {
    fields,
    isLoading,
    isSaving,
    error,
    fetchFields,
    addField,
    updateField,
    deleteField,
  };
};
```

## CSS Classes tham chiếu

```css
/* Fields Container */
.fields-container {
  padding: 16px;
}

.field-item {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 16px;
}

.field-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 500;
}

.field-actions {
  display: flex;
  gap: 4px;
}

.field-action-btn {
  cursor: pointer;
  color: #6b7280;
}

.field-action-btn:hover {
  color: #374151;
}

.add-field-btn {
  padding: 12px 16px;
  background-color: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  color: #6b7280;
  transition: all 0.2s;
}

.add-field-btn:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

/* Popup Styles */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.popup-form-container {
  margin: 20px 0;
}

.popup-form > div {
  margin-bottom: 16px;
}

.popup-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.popup-form input,
.popup-form select,
.popup-form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

/* Options Field */
.option-list {
  margin-bottom: 12px;
}

.option-item {
  display: grid;
  grid-template-columns: 2fr 1fr auto auto auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.option-text-color,
.option-background-color {
  width: 40px;
  height: 40px;
  padding: 2px;
}

/* Switch Label */
.switch-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4f46e5;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

/* Button Styles */
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #4f46e5;
  color: white;
}

.btn-primary:hover {
  background-color: #4338ca;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-destructive {
  background-color: #ef4444;
  color: white;
}

.btn-destructive:hover {
  background-color: #dc2626;
}

.popup-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}
```

## Quy trình nghiệp vụ

### 1. Khởi tạo

1. Người dùng chọn một bảng từ danh sách
2. Hệ thống tải danh sách trường của bảng
3. Component hiển thị danh sách trường hiện có

### 2. Thêm trường mới

1. Người dùng nhấn nút "Thêm trường"
2. Popup form mở với các trường trống
3. Người dùng chọn loại trường và điền thông tin
4. Form tự động cập nhật các phần tùy chọn tham chiếu theo loại trường
5. Khi nhấn "Xác nhận", hệ thống validate và gửi API
6. Nếu thành công, thêm trường vào danh sách và đóng popup

### 3. Sửa trường

1. Người dùng nhấn icon "edit" trên một trường
2. Popup form mở với thông tin của trường được chọn
3. Người dùng chỉnh sửa thông tin
4. Khi nhấn "Xác nhận", hệ thống validate và gửi API
5. Nếu thành công, cập nhật trường trong danh sách và đóng popup

### 4. Xóa trường

1. Người dùng nhấn icon "delete" trên một trường
2. Hệ thống hiển thị dialog xác nhận
3. Nếu người dùng xác nhận, gửi API xóa
4. Nếu thành công, xóa trường khỏi danh sách

### 5. Xử lý đặc biệt

- **Reference Fields**: Khi người dùng chọn loại trường reference, tự động tải danh sách bảng và trường liên quan
- **Options Fields**: Khi người dùng chọn loại có tùy chọn, hiển thị phần quản lý tùy chọn
- **Field Name Generation**: Tự động tạo tên biến từ tên trường theo chuẩn
- **Validation**: Kiểm tra các ràng buộc trước khi lưu

## Mã nguồn tham khảo từ Blade Template

```javascript
// Danh sách trường
<div class="form-builder" id="field-list"></div>
<div class="add-field-btn" onclick="DetailView.addField()">Thêm trường</div>

// Popup form trường
<div id="field-config-form" style="display: none;">
    <div class="popup-form-container">
        <div class="popup-form">
            <div>
                <label>Loại trường <span style="color: #ef4444;">*</span></label>
                <select id="field-type" onchange="DetailView.toggleOptionsField()">
                    <!-- Options list -->
                </select>
            </div>
            <!-- Other fields -->
            <div id="options-field" style="display: none;">
                <label>Tùy chọn (Select/Checkbox List)</label>
                <div id="option-list" class="option-list"></div>
                <button class="btn btn-secondary" onclick="DetailView.addOption()">Thêm tùy chọn</button>
            </div>
            <div id="reference-field" style="display: none;">
                <!-- Reference fields -->
            </div>
            <div class="switch-label">
                <label class="switch">
                    <input type="checkbox" id="field-required" />
                    <span class="slider"></span>
                </label>
                <label>Bắt buộc</label>
            </div>
        </div>
    </div>
</div>
```

## Lưu ý khi triển khai

1. **Performance**: Sử dụng React.memo cho FieldItem component để tránh re-render không cần thiết
2. **Virtualization**: Sử dụng react-window nếu có nhiều trường để cải thiện hiệu năng
3. **Accessibility**: Đảm bảo các form controls có label và ARIA attributes phù hợp
4. **Validation**: Xử lý validation cả ở client và server
5. **Error Handling**: Hiển thị thông báo lỗi một cách thân thiện với người dùng
6. **Type Safety**: Sử dụng TypeScript để đảm bảo type safety cho các field types
7. **Testing**: Viết unit tests cho các component và integration tests cho các workflow
