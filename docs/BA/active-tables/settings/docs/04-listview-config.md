# Tài liệu Cấu hình màn danh sách

## Tổng quan

Mục Cấu hình màn danh sách cho phép người dùng tùy chỉnh cách thức hiển thị bản ghi trên danh sách. Người dùng có thể chọn giữa hai bố cục khác nhau: Bố cục bảng và Bố cục nhiều dòng, cùng với việc chọn các trường cụ thể cần hiển thị và cách sắp xếp thông tin.

## Thành phần giao diện

### 1. Loại bố cục

- **Mô tả**: Cho phép chọn giữa hai loại bố cục khác nhau cho danh sách
- **Tùy chọn**:
  - Bố cục bảng (generic-table): Hiển thị bản ghi dưới dạng bảng thông thường
  - Bố cục nhiều dòng (head-column): Hiển thị bản ghi dạng thẻ với nhiều dòng thông tin

### 2. Cấu hình Bố cục bảng

- **Hiển thị khi**: Loại bố cục được chọn là "Bố cục bảng"
- **Các trường hiển thị**:
  - Multi-select để chọn các trường cần hiển thị trên bảng
  - Thứ tự hiển thị theo thứ tự chọn

### 3. Cấu hình Bố cục nhiều dòng

- **Hiển thị khi**: Loại bố cục được chọn là "Bố cục nhiều dòng"
- **Các trường cấu hình**:
  - Trường tiêu đề: Chọn một trường làm tiêu đề chính của thẻ
  - Các dòng đầu: Chọn các trường hiển thị ở phía trên tiêu đề
  - Các dòng cuối: Chọn các trường hiển thị ở phía dưới tiêu đề

## Các loại bố cục

### 1. Bố cục bảng (generic-table)

- **Mô tả**: Hiển thị bản ghi dưới dạng lưới hàng/cột truyền thống
- **Cấu trúc**:
  - Tiêu đề cột tương ứng với các trường được chọn
  - Mỗi hàng là một bản ghi
  - Các ô hiển thị giá trị của trường tương ứng
- **Ưu điểm**:
  - Dễ dàng so sánh dữ liệu giữa các bản ghi
  - Tiết kiệm không gian hiển thị
  - Thích hợp cho dữ liệu có cấu trúc đồng nhất

### 2. Bố cục nhiều dòng (head-column)

- **Mô tả**: Hiển thị bản ghi dưới dạng các thẻ thông tin
- **Cấu trúc**:
  - Tiêu đề thẻ là trường được chọn làm tiêu đề
  - Dòng đầu hiển thị các trường được chọn cho phần đầu
  - Dòng cuối hiển thị các trường được chọn cho phần cuối
- **Ưu điểm**:
  - Hiển thị được nhiều thông tin hơn trên mỗi bản ghi
  - Thích hợp cho dữ liệu có cấu trúc phức tạp
  - Tùy biến cao về mặt hiển thị

## Cấu trúc dữ liệu (React)

### 1. RecordListConfig Interface

```typescript
interface RecordListConfig {
  layout: 'generic-table' | 'head-column';
  // For generic-table layout
  displayFields?: string[];
  // For head-column layout
  titleField?: string;
  subLineFields?: string[];
  tailFields?: string[];
}

interface ListViewState {
  config: RecordListConfig;
  fields: Field[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}
```

## Component React 19

### 1. ListViewConfig Component

```typescript
interface ListViewConfigProps {
  config: RecordListConfig;
  fields: Field[];
  onConfigChange: (config: RecordListConfig) => void;
  isLoading?: boolean;
}

const ListViewConfig: React.FC<ListViewConfigProps> = ({
  config,
  fields,
  onConfigChange,
  isLoading = false
}) => {
  const [layout, setLayout] = useState<'generic-table' | 'head-column'>(config.layout || 'generic-table');
  const [displayFields, setDisplayFields] = useState<string[]>(config.displayFields || []);
  const [titleField, setTitleField] = useState<string>(config.titleField || '');
  const [subLineFields, setSubLineFields] = useState<string[]>(config.subLineFields || []);
  const [tailFields, setTailFields] = useState<string[]>(config.tailFields || []);

  // Xử lý thay đổi layout
  const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLayout = e.target.value as 'generic-table' | 'head-column';
    setLayout(newLayout);

    // Tạo config mới dựa trên layout
    const newConfig: RecordListConfig = { layout: newLayout };

    if (newLayout === 'generic-table') {
      newConfig.displayFields = displayFields;
    } else {
      newConfig.titleField = titleField;
      newConfig.subLineFields = subLineFields;
      newConfig.tailFields = tailFields;
    }

    onConfigChange(newConfig);
  };

  // Xử lý thay đổi các trường hiển thị (generic-table)
  const handleDisplayFieldsChange = (selectedFields: string[]) => {
    setDisplayFields(selectedFields);
    onConfigChange({
      layout,
      displayFields: selectedFields
    });
  };

  // Xử lý thay đổi trường tiêu đề (head-column)
  const handleTitleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTitleField = e.target.value;
    setTitleField(newTitleField);
    onConfigChange({
      layout,
      titleField: newTitleField,
      subLineFields,
      tailFields
    });
  };

  // Xử lý thay đổi các trường dòng đầu (head-column)
  const handleSubLineFieldsChange = (selectedFields: string[]) => {
    setSubLineFields(selectedFields);
    onConfigChange({
      layout,
      titleField,
      subLineFields: selectedFields,
      tailFields
    });
  };

  // Xử lý thay đổi các trường dòng cuối (head-column)
  const handleTailFieldsChange = (selectedFields: string[]) => {
    setTailFields(selectedFields);
    onConfigChange({
      layout,
      titleField,
      subLineFields,
      tailFields: selectedFields
    });
  };

  // Render phần cấu hình generic-table
  const renderGenericTableConfig = () => {
    if (layout !== 'generic-table') return null;

    return (
      <div id="generic-table-config" style={{ display: 'block' }}>
        <label>Các trường hiển thị <span style={{ color: '#ef4444' }}>*</span></label>
        <Select
          isMulti
          value={fields.filter(field => displayFields.includes(field.name)).map(field => ({
            value: field.name,
            label: field.label
          }))}
          options={fields.map(field => ({
            value: field.name,
            label: field.label
          }))}
          onChange={(selectedOptions) => {
            handleDisplayFieldsChange(selectedOptions.map(option => option.value));
          }}
          placeholder="Chọn các trường hiển thị trên bảng"
          className="select2-display-fields"
          classNamePrefix="select2"
        />
      </div>
    );
  };

  // Render phần cấu hình head-column
  const renderHeadColumnConfig = () => {
    if (layout !== 'head-column') return null;

    return (
      <div id="head-column-config" style={{ display: 'block' }}>
        <div style={{ marginBottom: '8px' }}>
          <label>Trường tiêu đề <span style={{ color: '#ef4444' }}>*</span></label>
          <select
            value={titleField}
            onChange={handleTitleFieldChange}
            className="select-3"
          >
            <option value="">Chọn trường</option>
            {fields.map(field => (
              <option key={field.name} value={field.name}>
                {field.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label>Các dòng đầu</label>
          <Select
            isMulti
            value={fields.filter(field => subLineFields.includes(field.name)).map(field => ({
              value: field.name,
              label: field.label
            }))}
            options={fields.map(field => ({
              value: field.name,
              label: field.label
            }))}
            onChange={(selectedOptions) => {
              handleSubLineFieldsChange(selectedOptions.map(option => option.value));
            }}
            placeholder="Chọn các trường hiển thị ở dòng đầu"
            className="select2-sub-line-fields"
            classNamePrefix="select2"
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label>Các dòng cuối</label>
          <Select
            isMulti
            value={fields.filter(field => tailFields.includes(field.name)).map(field => ({
              value: field.name,
              label: field.label
            }))}
            options={fields.map(field => ({
              value: field.name,
              label: field.label
            }))}
            onChange={(selectedOptions) => {
              handleTailFieldsChange(selectedOptions.map(option => option.value));
            }}
            placeholder="Chọn các trường hiển thị ở dòng cuối"
            className="select2-tail-fields"
            classNamePrefix="select2"
          />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="loading-spinner">Đang tải...</div>;
  }

  return (
    <div className="listview-config">
      <h2>Cấu hình Danh sách Bản ghi</h2>

      <div className="config-fields">
        <div className="input-wrapper" style={{ marginBottom: '8px' }}>
          <label>Loại bố cục <span style={{ color: '#ef4444' }}>*</span></label>
          <select
            value={layout}
            onChange={handleLayoutChange}
            className="select-3"
          >
            <option value="generic-table">Bố cục bảng</option>
            <option value="head-column">Bố cục nhiều dòng</option>
          </select>
        </div>

        {renderGenericTableConfig()}
        {renderHeadColumnConfig()}
      </div>
    </div>
  );
};
```

### 2. useListViewConfig Hook

```typescript
interface UseListViewConfigOptions {
  tableId: string;
}

const useListViewConfig = ({ tableId }: UseListViewConfigOptions) => {
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.listViewConfig.config);
  const fields = useAppSelector((state) => state.fields.fields);
  const isLoading = useAppSelector((state) => state.listViewConfig.isLoading);
  const isSaving = useAppSelector((state) => state.listViewConfig.isSaving);
  const error = useAppSelector((state) => state.listViewConfig.error);

  // Tải cấu hình danh sách
  const fetchListViewConfig = useCallback(async () => {
    dispatch(listViewSlice.actions.setLoading(true));
    try {
      const data = await listViewConfigAPI.fetchConfig(tableId);
      dispatch(listViewSlice.actions.setConfig(data));
    } catch (err) {
      dispatch(listViewSlice.actions.setError(err.message));
    } finally {
      dispatch(listViewSlice.actions.setLoading(false));
    }
  }, [dispatch, tableId]);

  // Cập nhật cấu hình danh sách
  const updateListViewConfig = useCallback(
    async (config: RecordListConfig) => {
      dispatch(listViewSlice.actions.setConfig(config));

      try {
        const updatedConfig = await listViewConfigAPI.updateConfig(tableId, config);
        dispatch(listViewSlice.actions.setConfig(updatedConfig));
        return updatedConfig;
      } catch (err) {
        dispatch(listViewSlice.actions.setError(err.message));
        throw err;
      }
    },
    [dispatch, tableId],
  );

  // Reset về cấu hình mặc định
  const resetListViewConfig = useCallback(() => {
    const defaultConfig: RecordListConfig = {
      layout: 'generic-table',
      displayFields: [],
    };
    updateListViewConfig(defaultConfig);
  }, [updateListViewConfig]);

  return {
    config,
    fields,
    isLoading,
    isSaving,
    error,
    fetchListViewConfig,
    updateListViewConfig,
    resetListViewConfig,
  };
};
```

## State Management (Redux/Context)

### 1. Redux Slice

```typescript
const listViewSlice = createSlice({
  name: 'listViewConfig',
  initialState: {
    config: {
      layout: 'generic-table',
      displayFields: [],
    },
    isLoading: false,
    isSaving: false,
    error: null,
  } as ListViewState,
  reducers: {
    setConfig: (state, action) => {
      state.config = action.payload;
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

### 2. API Services

```typescript
interface ListViewConfigAPI {
  fetchConfig: (tableId: string) => Promise<RecordListConfig>;
  updateConfig: (tableId: string, config: RecordListConfig) => Promise<RecordListConfig>;
}

const listViewConfigAPI: ListViewConfigAPI = {
  fetchConfig: async (tableId: string) => {
    const response = await api.get(`/api/tables/${tableId}/list-view-config`);
    return response.data;
  },

  updateConfig: async (tableId: string, config: RecordListConfig) => {
    const response = await api.patch(`/api/tables/${tableId}/list-view-config`, config);
    return response.data;
  },
};
```

## Component hiển thị thực tế

### 1. GenericTable Component

```typescript
interface GenericTableProps {
  records: Record[];
  config: RecordListConfig;
  fields: Field[];
  onRecordClick?: (record: Record) => void;
}

const GenericTable: React.FC<GenericTableProps> = ({
  records,
  config,
  fields,
  onRecordClick
}) => {
  const displayFields = config.displayFields || [];

  // Lấy thông tin các trường sẽ hiển thị
  const displayFieldInfos = displayFields.map(fieldName => {
    return fields.find(field => field.name === fieldName) || { name: fieldName, label: fieldName };
  });

  return (
    <div className="generic-table-container">
      <table className="generic-table">
        <thead>
          <tr>
            {displayFieldInfos.map((field, index) => (
              <th key={index}>{field.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record, recordIndex) => (
            <tr
              key={record.id || recordIndex}
              className={onRecordClick ? 'clickable-row' : ''}
              onClick={() => onRecordClick && onRecordClick(record)}
            >
              {displayFields.map((fieldName, fieldIndex) => (
                <td key={fieldIndex}>
                  {formatFieldValue(record[fieldName], fields.find(f => f.name === fieldName))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### 2. HeadColumnList Component

```typescript
interface HeadColumnListProps {
  records: Record[];
  config: RecordListConfig;
  fields: Field[];
  onRecordClick?: (record: Record) => void;
}

const HeadColumnList: React.FC<HeadColumnListProps> = ({
  records,
  config,
  fields,
  onRecordClick
}) => {
  const titleField = config.titleField || '';
  const subLineFields = config.subLineFields || [];
  const tailFields = config.tailFields || [];

  // Lấy thông tin trường tiêu đề
  const titleFieldInfo = fields.find(field => field.name === titleField) || { name: titleField, label: titleField };

  return (
    <div className="head-column-list">
      <div className="head-column-container">
        {records.map((record, recordIndex) => (
          <div
            key={record.id || recordIndex}
            className={`head-column-item ${onRecordClick ? 'clickable-item' : ''}`}
            onClick={() => onRecordClick && onRecordClick(record)}
          >
            {/* Tiêu đề */}
            <div className="head-column-title">
              {formatFieldValue(record[titleField], titleFieldInfo)}
            </div>

            {/* Các dòng đầu */}
            {subLineFields.length > 0 && (
              <div className="head-column-sublines">
                {subLineFields.map((fieldName, fieldIndex) => {
                  const fieldInfo = fields.find(field => field.name === fieldName) || { name: fieldName, label: fieldName };
                  return (
                    <div key={fieldIndex} className="head-column-subline">
                      <span className="field-label">{fieldInfo.label}:</span>
                      <span className="field-value">
                        {formatFieldValue(record[fieldName], fieldInfo)}
                      </span>
                    </div>
                  )}
                )}
              </div>
            )}

            {/* Các dòng cuối */}
            {tailFields.length > 0 && (
              <div className="head-column-tails">
                {tailFields.map((fieldName, fieldIndex) => {
                  const fieldInfo = fields.find(field => field.name === fieldName) || { name: fieldName, label: fieldName };
                  return (
                    <div key={fieldIndex} className="head-column-tail">
                      <span className="field-label">{fieldInfo.label}:</span>
                      <span className="field-value">
                        {formatFieldValue(record[fieldName], fieldInfo)}
                      </span>
                    </div>
                  )}
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 3. RecordList Component (Container)

```typescript
interface RecordListProps {
  tableId: string;
  onRecordClick?: (record: Record) => void;
}

const RecordList: React.FC<RecordListProps> = ({ tableId, onRecordClick }) => {
  const { config, fields, records, isLoading } = useRecordList({ tableId });

  if (isLoading) {
    return <div className="loading-spinner">Đang tải...</div>;
  }

  return (
    <div className="record-list">
      {config.layout === 'generic-table' ? (
        <GenericTable
          records={records}
          config={config}
          fields={fields}
          onRecordClick={onRecordClick}
        />
      ) : (
        <HeadColumnList
          records={records}
          config={config}
          fields={fields}
          onRecordClick={onRecordClick}
        />
      )}
    </div>
  );
};
```

## Utility Functions

### 1. Format Field Value

```typescript
const formatFieldValue = (value: any, field?: Field): React.ReactNode => {
  if (value === null || value === undefined) return '-';

  if (!field) return String(value);

  switch (field.type) {
    case 'CHECKBOX_YES_NO':
    case 'CHECKBOX_ONE':
      return value ? <span className="check-icon">✓</span> : <span className="cross-icon">✗</span>;

    case 'DATE':
    case 'DATETIME':
    case 'TIME':
      return formatDateTime(value, field.type);

    case 'SELECT_ONE':
    case 'SELECT_LIST':
      if (field.options && Array.isArray(field.options)) {
        if (Array.isArray(value)) {
          return value.map(v => {
            const option = field.options.find(opt => opt.value === v);
            return option ? option.text : v;
          }).join(', ');
        } else {
          const option = field.options.find(opt => opt.value === value);
          return option ? option.text : value;
        }
      }
      return value;

    case 'SELECT_ONE_RECORD':
    case 'SELECT_LIST_RECORD':
    case 'SELECT_ONE_WORKSPACE_USER':
    case 'SELECT_LIST_WORKSPACE_USER':
      // Đây sẽ là async component để fetch thông tin chi tiết
      return <ReferenceValue referenceId={value} fieldType={field.type} />;

    default:
      return String(value);
  }
};

const formatDateTime = (value: string | Date, type: string): string => {
  if (!value) return '-';

  const date = new Date(value);

  switch (type) {
    case 'DATE':
      return date.toLocaleDateString('vi-VN');
    case 'DATETIME':
      return date.toLocaleString('vi-VN');
    case 'TIME':
      return date.toLocaleTimeString('vi-VN');
    default:
      return date.toLocaleString('vi-VN');
  }
};
```

### 2. ReferenceValue Component

```typescript
interface ReferenceValueProps {
  referenceId: string | string[];
  fieldType: string;
}

const ReferenceValue: React.FC<ReferenceValueProps> = ({ referenceId, fieldType }) => {
  const [referenceData, setReferenceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Gọi API để lấy thông tin chi tiết của reference
        // Đây là giả định, cần cài đặt thực tế
        const data = await referenceAPI.getReferenceInfo(referenceId, fieldType);
        setReferenceData(data);
      } catch (error) {
        console.error('Error fetching reference data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (referenceId) {
      fetchReferenceData();
    } else {
      setIsLoading(false);
    }
  }, [referenceId, fieldType]);

  if (isLoading) return <span className="loading-text">Đang tải...</span>;
  if (!referenceData) return <span className="error-text">Lỗi tải dữ liệu</span>;

  if (Array.isArray(referenceId)) {
    return (
      <ul className="reference-list">
        {referenceData.map((item: any, index: number) => (
          <li key={index}>{item.label || item.name || JSON.stringify(item)}</li>
        ))}
      </ul>
    );
  }

  return <span>{referenceData.label || referenceData.name || JSON.stringify(referenceData)}</span>;
};
```

## CSS Classes tham chiếu

```css
/* List View Config */
.listview-config {
  padding: 16px;
}

.config-fields {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.input-wrapper {
  margin-bottom: 16px;
}

.input-wrapper label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.input-wrapper select,
.input-wrapper input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

/* Select2 overrides */
.select2-container {
  width: 100% !important;
}

.select-3 {
  min-height: 44px;
}

/* Generic Table */
.generic-table-container {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.generic-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.generic-table th,
.generic-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.generic-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
  position: sticky;
  top: 0;
}

.generic-table tr:hover {
  background-color: #f9fafb;
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  background-color: #f3f4f6;
}

/* Head Column List */
.head-column-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.head-column-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background-color: #fff;
  transition: all 0.2s;
}

.head-column-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.clickable-item {
  cursor: pointer;
}

.head-column-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.head-column-sublines,
.head-column-tails {
  margin-bottom: 12px;
}

.head-column-subline,
.head-column-tail {
  display: flex;
  margin-bottom: 6px;
  font-size: 14px;
}

.field-label {
  font-weight: 500;
  color: #6b7280;
  margin-right: 8px;
  min-width: 100px;
}

.field-value {
  color: #111827;
}

.check-icon {
  color: #10b981;
}

.cross-icon {
  color: #ef4444;
}

.reference-list {
  margin: 0;
  padding-left: 20px;
}

.reference-list li {
  margin-bottom: 4px;
}

.loading-text,
.error-text {
  font-style: italic;
  color: #6b7280;
}

.error-text {
  color: #ef4444;
}
```

## Quy trình nghiệp vụ

### 1. Khởi tạo

1. Người dùng chọn một bảng từ danh sách
2. Hệ thống tải cấu hình danh sách của bảng
3. Component hiển thị các tùy chọn cấu hình hiện tại

### 2. Chọn bố cục

1. Người dùng chọn giữa "Bố cục bảng" và "Bố cục nhiều dòng"
2. Giao diện tự động thay đổi để hiển thị các tùy chọn phù hợp
3. Cấu hình được lưu tự động hoặc khi người dùng nhấn "Lưu"

### 3. Cấu hình Bố cục bảng

1. Người dùng chọn các trường cần hiển thị từ dropdown multi-select
2. Thứ tự hiển thị theo thứ tự chọn
3. Khi người dùng thay đổi, hệ thống tự động lưu hoặc đợi "Lưu"

### 4. Cấu hình Bố cục nhiều dòng

1. Người dùng chọn trường tiêu đề từ dropdown
2. Người dùng chọn các trường cho dòng đầu từ multi-select
3. Người dùng chọn các trường cho dòng cuối từ multi-select
4. Khi người dùng thay đổi, hệ thống tự động lưu hoặc đợi "Lưu"

### 5. Xem trước và áp dụng

1. Người dùng có thể xem trước cách hiển thị với cấu hình hiện tại
2. Khi người dùng nhấn "Lưu", hệ thống lưu cấu hình
3. Danh sách bản ghi được hiển thị theo cấu hình mới

## Mã nguồn tham khảo từ Blade Template

```javascript
// Cấu hình chung
<div class="input-wrapper" style="margin-bottom: 8px">
    <label>Loại bố cục <span style="color: #ef4444;">*</span></label>
    <select id="record-list-layout" onchange="DetailView.toggleRecordListConfig()" class="select-3">
        <option value="generic-table">Bố cục bảng</option>
        <option value="head-column">Bố cục nhiều dòng</option>
    </select>
</div>

<div id="generic-table-config" style="display: none;margin-bottom: 8px">
    <label>Các trường hiển thị <span style="color: #ef4444;">*</span></label>
    <select id="generic-table-display-fields" multiple="multiple" class="select2-display-fields select-3">
        <!-- Options will be populated dynamically -->
    </select>
</div>

<div id="head-column-config" style="display: none;">
    <div class="input-wrapper" style="margin-bottom: 8px">
        <label>Trường tiêu đề <span style="color: #ef4444;">*</span></label>
        <select id="head-column-title-field" class="select-3">
            <option value="">Chọn trường</option>
            <!-- Options will be populated dynamically -->
        </select>
    </div>
    <div class="input-wrapper" style="margin-bottom: 8px">
        <label>Các dòng đầu</label>
        <select id="head-column-sub-line-fields" multiple="multiple" class="select2-sub-line-fields select-3">
            <!-- Options will be populated dynamically -->
        </select>
    </div>
    <div class="input-wrapper" style="margin-bottom: 8px">
        <label>Các dòng cuối</label>
        <select id="head-column-tail-fields" multiple="multiple" class="select2-tail-fields select-3">
            <!-- Options will be populated dynamically -->
        </select>
    </div>
</div>

// Toggle function
static toggleRecordListConfig() {
    const layout = document.getElementById('record-list-layout').value;
    document.getElementById('generic-table-config').style.display = layout === 'generic-table' ? 'block' : 'none';
    document.getElementById('head-column-config').style.display = layout === 'head-column' ? 'block' : 'none';
}

// Populate function
static populateRecordListConfig() {
    const fields = States.currentTable?.config?.fields || [];
    const displayFieldsSelect = document.getElementById('generic-table-display-fields');
    const titleFieldSelect = document.getElementById('head-column-title-field');
    const subLineFieldsSelect = document.getElementById('head-column-sub-line-fields');
    const tailFieldsSelect = document.getElementById('head-column-tail-fields');

    // Populate fields for Generic Table
    displayFieldsSelect.innerHTML = fields.map(field =>
        `<option value="${field.name}">${field.label}</option>`
    ).join('');

    // Populate fields for Head Column
    titleFieldSelect.innerHTML = `<option value="">Chọn trường</option>` +
        fields.map(field =>
            `<option value="${field.name}">${field.label}</option>`
        ).join('');
    subLineFieldsSelect.innerHTML = fields.map(field =>
        `<option value="${field.name}">${field.label}</option>`
    ).join('');
    tailFieldsSelect.innerHTML = fields.map(field =>
        `<option value="${field.name}">${field.label}</option>`
    ).join('');

    // Initialize Select2
    $(displayFieldsSelect).select2();
    $(subLineFieldsSelect).select2();
    $(tailFieldsSelect).select2();

    // Set existing values
    const config = States.currentTable?.config?.recordListConfig || {};
    if (config.layout) {
        document.getElementById('record-list-layout').value = config.layout;
        if (config.layout === 'generic-table' && config.displayFields) {
            $(displayFieldsSelect).val(config.displayFields).trigger('change');
        } else if (config.layout === 'head-column') {
            if (config.titleField) {
                titleFieldSelect.value = config.titleField;
            }
            if (config.subLineFields) {
                $(subLineFieldsSelect).val(config.subLineFields).trigger('change');
            }
            if (config.tailFields) {
                $(tailFieldsSelect).val(config.tailFields).trigger('change');
            }
        }
    }

    this.toggleRecordListConfig();
}
```

## Lưu ý khi triển khai

1. **Performance**: Sử dụng virtualization cho bảng dữ liệu lớn
2. **Responsive Design**: Đảm bảo các bố cục hiển thị tốt trên thiết bị di động
3. **Accessibility**: Đảm bảo các bảng có thể điều hướng bằng bàn phím và screen reader
4. **Field Type Handling**: Xử lý đặc biệt cho các field type như reference, date, boolean
5. **Sort/Filter Integration**: Cân nhắc tích hợp với các tính năng sắp xếp và lọc
6. **State Persistence**: Lưu lại trạng thái hiển thị của người dùng (các cột đã ẩn/hiện)
7. **Export/Print**: Cân nhắc thêm tính năng xuất dữ liệu hoặc in ấn
8. **Testing**: Viết unit tests và integration tests cho các component
