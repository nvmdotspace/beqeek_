# Tài liệu Cấu hình Chung

## Tổng quan

Mục Cấu hình chung là phần đầu tiên trong trang cấu hình bảng, cho phép người dùng thiết lập các thông tin cơ bản và quan trọng nhất của bảng dữ liệu. Đây là nền tảng cho tất cả các cấu hình khác và ảnh hưởng đến toàn bộ chức năng của bảng.

## Thành phần giao diện

### 1. ID Bảng

- **Mô tả**: Hiển thị ID duy nhất của bảng được hệ thống tự động tạo
- **Kiểu dữ liệu**: Text (readonly)
- **Chức năng**:
  - Hiển thị ID để người dùng có thể tham khảo
  - Nút "Copy" để sao chép ID vào clipboard
- **Lưu ý**: ID không thể thay đổi, được dùng để định danh duy nhất của bảng

### 2. Khóa mã hóa

- **Mô tả**: Trường nhập khóa mã hóa dữ liệu
- **Kiểu dữ liệu**: Text
- **Chức năng**:
  - Nhập khóa mã hóa để bảo vệ dữ liệu nhạy cảm
  - Hỗ trợ mã hóa đầu cuối (E2EE) nếu được bật
- **Lưu ý**:
  - Khóa mã hóa cần được lưu trữ an toàn bởi người dùng
  - Mất khóa sẽ không thể phục hồi dữ liệu

### 3. Giới hạn bản ghi

- **Mô tả**: Thiết lập số lượng bản ghi tối đa cho bảng
- **Kiểu dữ liệu**: Number (min: 1, max: 1000)
- **Chức năng**:
  - Giới hạn số lượng bản ghi có thể lưu trữ trong bảng
  - Hỗ trợ quản lý tài nguyên hệ thống
- **Lưu ý**:
  - Trường bắt buộc (đánh dấu bằng dấu \* màu đỏ)
  - Giá trị mặc định: 1000

### 4. Chiều sắp xếp mặc định

- **Mô tả**: Thiết lập thứ tự sắp xếp mặc định cho bản ghi
- **Kiểu dữ liệu**: Select
- **Tùy chọn**:
  - `asc`: Cũ nhất (xếp theo thứ tự tăng dần)
  - `desc`: Mới nhất (xếp theo thứ tự giảm dần)
- **Chức năng**:
  - Xác định thứ tự hiển thị mặc định khi người dùng xem danh sách
- **Lưu ý**:
  - Trường bắt buộc (đánh dấu bằng dấu \* màu đỏ)
  - Giá trị mặc định: `desc`

### 5. Trường dữ liệu tìm kiếm

- **Mô tả**: Chọn các trường dùng để tạo chỉ mục tìm kiếm
- **Kiểu dữ liệu**: Multiple Select
- **Chức năng**:
  - Tích hợp với hệ thống tìm kiếm toàn văn bản
  - Hỗ trợ tìm kiếm nhanh trên các trường đã chọn
- **Lưu ý**:
  - Trường bắt buộc (đánh dấu bằng dấu \* màu đỏ)
  - Chỉ hiển thị các trường text-based phù hợp
  - Hỗ trợ chọn nhiều trường

## Cấu trúc dữ liệu (React)

```typescript
interface GeneralConfig {
  tableId: string; // ID duy nhất của bảng
  encryptionKey?: string; // Khóa mã hóa (tùy chọn)
  tableLimit: number; // Giới hạn bản ghi (1-1000)
  defaultSort: 'asc' | 'desc'; // Chiều sắp xếp mặc định
  hashedKeywordFields: string[]; // Danh sách trường tìm kiếm
}
```

## Component React 19

### 1. GeneralConfig Component

```typescript
interface GeneralConfigProps {
  config: GeneralConfig;
  fields: Field[];              // Danh sách các trường của bảng
  onConfigChange: (config: GeneralConfig) => void;
  onCopyTableId: () => void;    // Hàm xử lý copy ID
}

const GeneralConfig: React.FC<GeneralConfigProps> = ({
  config,
  fields,
  onConfigChange,
  onCopyTableId
}) => {
  const [encryptionKey, setEncryptionKey] = useState(config.encryptionKey || '');
  const [tableLimit, setTableLimit] = useState(config.tableLimit);
  const [defaultSort, setDefaultSort] = useState<'asc' | 'desc'>(config.defaultSort);
  const [hashedKeywordFields, setHashedKeywordFields] = useState<string[]>(config.hashedKeywordFields);

  // Lọc các trường phù hợp cho tìm kiếm
  const eligibleFields = fields.filter(field =>
    ['SHORT_TEXT', 'TEXT', 'RICH_TEXT', 'EMAIL', 'URL'].includes(field.type)
  );

  const handleConfigUpdate = useCallback(() => {
    onConfigChange({
      tableId: config.tableId,
      encryptionKey,
      tableLimit,
      defaultSort,
      hashedKeywordFields
    });
  }, [encryptionKey, tableLimit, defaultSort, hashedKeywordFields, config.tableId, onConfigChange]);

  return (
    <div className="general-config">
      <h2>Cấu hình chung</h2>

      {/* ID Bảng */}
      <div className="input-wrapper">
        <label>ID Bảng</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={config.tableId}
            readOnly
            className="inp-text"
          />
          <button className="btn btn-secondary copy-btn" onClick={onCopyTableId}>
            <span className="material-icons">content_copy</span>
            Copy
          </button>
        </div>
      </div>

      {/* Khóa mã hóa */}
      <div className="input-wrapper">
        <label>Khóa mã hóa</label>
        <input
          type="text"
          value={encryptionKey}
          onChange={(e) => setEncryptionKey(e.target.value)}
          className="inp-text"
          placeholder="Nhập khóa mã hóa"
        />
      </div>

      {/* Giới hạn bản ghi */}
      <div className="input-wrapper">
        <label>Giới hạn bản ghi (Tối đa 1000) <span style={{ color: '#ef4444' }}>*</span></label>
        <input
          type="number"
          value={tableLimit}
          onChange={(e) => setTableLimit(Math.min(1000, Math.max(1, parseInt(e.target.value) || 1)))}
          className="inp-text"
          min="1"
          max="1000"
          placeholder="Nhập giới hạn bản ghi"
        />
      </div>

      {/* Chiều sắp xếp mặc định */}
      <div className="input-wrapper">
        <label>Chiều sắp xếp mặc định <span style={{ color: '#ef4444' }}>*</span></label>
        <select
          value={defaultSort}
          onChange={(e) => setDefaultSort(e.target.value as 'asc' | 'desc')}
          className="inp-select select-3"
        >
          <option value="asc">Cũ nhất</option>
          <option value="desc">Mới nhất</option>
        </select>
      </div>

      {/* Trường dữ liệu tìm kiếm */}
      <div className="input-wrapper">
        <label>Trường dữ liệu tìm kiếm <span style={{ color: '#ef4444' }}>*</span></label>
        <Select
          isMulti
          value={eligibleFields.filter(field => hashedKeywordFields.includes(field.name)).map(field => ({
            value: field.name,
            label: `${field.label} (${field.type})`
          }))}
          options={eligibleFields.map(field => ({
            value: field.name,
            label: `${field.label} (${field.type})`
          }))}
          onChange={(selectedOptions) => {
            setHashedKeywordFields(selectedOptions.map(option => option.value));
          }}
          placeholder="Chọn các trường để tạo dữ liệu tìm kiếm"
          className="select2-container"
          classNamePrefix="select2"
        />
      </div>
    </div>
  );
};
```

### 2. Hook useGeneralConfig

```typescript
interface UseGeneralConfigOptions {
  initialConfig: GeneralConfig;
  fields: Field[];
}

const useGeneralConfig = ({ initialConfig, fields }: UseGeneralConfigOptions) => {
  const [config, setConfig] = useState<GeneralConfig>(initialConfig);
  const [isDirty, setIsDirty] = useState(false);

  const updateConfig = useCallback((updates: Partial<GeneralConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(initialConfig);
    setIsDirty(false);
  }, [initialConfig]);

  const validateConfig = useCallback(() => {
    if (!config.tableLimit || config.tableLimit < 1 || config.tableLimit > 1000) {
      return { isValid: false, error: 'Giới hạn bản ghi phải từ 1 đến 1000.' };
    }
    if (!config.hashedKeywordFields || config.hashedKeywordFields.length === 0) {
      return { isValid: false, error: 'Phải chọn ít nhất một trường tìm kiếm.' };
    }
    return { isValid: true, error: null };
  }, [config]);

  return {
    config,
    isDirty,
    updateConfig,
    resetConfig,
    validateConfig,
  };
};
```

## State Management (Redux/Context)

### 1. Redux Slice

```typescript
interface GeneralConfigState {
  config: GeneralConfig;
  isLoading: boolean;
  error: string | null;
  lastSaved: string | null;
}

const generalConfigSlice = createSlice({
  name: 'generalConfig',
  initialState: {
    config: {
      tableId: '',
      encryptionKey: '',
      tableLimit: 1000,
      defaultSort: 'desc',
      hashedKeywordFields: [],
    },
    isLoading: false,
    error: null,
    lastSaved: null,
  } as GeneralConfigState,
  reducers: {
    setConfig: (state, action) => {
      state.config = { ...state.config, ...action.payload };
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setLastSaved: (state) => {
      state.lastSaved = new Date().toISOString();
    },
    resetConfig: (state) => {
      state.config = {
        tableId: '',
        encryptionKey: '',
        tableLimit: 1000,
        defaultSort: 'desc',
        hashedKeywordFields: [],
      };
      state.error = null;
      state.lastSaved = null;
    },
  },
});
```

### 2. API Integration

**⚠️ LƯU Ý QUAN TRỌNG**:

Không có API endpoint riêng cho General Config. Tất cả cấu hình (bao gồm General Config, Fields, Actions, Permissions, Layouts, ...) được lưu thông qua **một endpoint PATCH duy nhất**:

```
PATCH /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}
```

#### Cách hoạt động:

1. **Lấy cấu hình** (GET via POST method):

```javascript
const response = await CommonUtils.apiCall(
  `/api/workspace/${WORKSPACE_ID}/workflow/get/active_tables/${tableId}`,
  {},
  true, // isGetAction = true, nhưng vẫn dùng POST method
);
// response.data.config chứa toàn bộ cấu hình
```

2. **Lưu cấu hình** (khi người dùng nhấn nút "Lưu"):

```javascript
// User thay đổi General Config trên UI
DetailView.tableLimit = 500;
DetailView.defaultSort = 'asc';
DetailView.hashedKeywordFields = ['field1', 'field2'];

// Khi nhấn "Lưu", GỬI TOÀN BỘ CONFIG
const response = await TableAPI.updateTable(tableId, {
  name: tableName,
  description: tableDescription,
  config: {
    title: tableName,
    fields: DetailView.fields, // ← Tất cả fields
    actions: DetailView.actions, // ← Tất cả actions
    quickFilters: DetailView.quickFilters,
    tableLimit: DetailView.tableLimit, // ← General config
    defaultSort: DetailView.defaultSort, // ← General config
    hashedKeywordFields: DetailView.hashedKeywordFields, // ← General config
    encryptionKey: DetailView.encryptionKey,
    encryptionAuthKey: DetailView.encryptionAuthKey,
    kanbanConfigs: DetailView.kanbanConfigs,
    ganttCharts: DetailView.ganttCharts,
    recordListConfig: DetailView.recordListConfig,
    recordDetailConfig: DetailView.recordDetailConfig,
    permissionsConfig: DetailView.permissionsConfig,
  },
});
```

**Đặc điểm:**

- ✅ Mọi thay đổi được lưu **batch** (cùng lúc)
- ✅ Không có endpoint riêng cho từng phần config
- ✅ Client-side state management (thay đổi local trước, lưu sau)
- ✅ Sử dụng POST method cho cả GET và PATCH operations

Xem [API Endpoints Analysis](./API-ENDPOINTS-ANALYSIS.md) để biết chi tiết đầy đủ.

## Quy trình nghiệp vụ

### 1. Khởi tạo

1. Người dùng chọn một bảng từ danh sách
2. Hệ thống tải cấu hình chung của bảng
3. Component hiển thị các giá trị hiện tại

### 2. Chỉnh sửa

1. Người dùng thay đổi giá trị trên form
2. Component cập nhật state cục bộ
3. Hiển thị trạng thái "đã thay đổi" (isDirty)
4. Thực hiện validation theo từng trường

### 3. Lưu cấu hình

1. Người dùng nhấn nút "Lưu"
2. Hệ thống thực hiện validation toàn bộ
3. Gọi API cập nhật cấu hình
4. Hiển thị trạng thái thành công/lỗi
5. Cập nhật state chung nếu thành công

### 4. Xử lý đặc biệt

- **Copy ID**: Sử dụng Clipboard API với fallback cho trình duyệt cũ
- **Validation**: Kiểm tra giá trị trong khoảng cho phép
- **Encryption**: Xác thực khóa mã hóa trước khi lưu

## Mã nguồn tham khảo từ Blade Template

```javascript
// Blade Template Code
<div class="inp-box config-fields" id="general-config">
    <div class="input-wrapper">
        <label>ID Bảng</label>
        <div style="display: flex;gap: 10px;">
            <input type="text" id="table-id" class="inp-text" readonly />
            <button class="btn btn-secondary copy-btn" onclick="DetailView.copyTableId()">
                <span class="material-icons">content_copy</span>
                Copy
            </button>
        </div>
    </div>
    <div class="input-wrapper">
        <label>Khóa mã hóa</label>
        <input type="text" id="table-encryption-key" class="inp-text" placeholder="Nhập khóa mã hóa" />
    </div>
    <div class="input-wrapper">
        <label>Giới hạn bản ghi (Tối đa 1000) <span style="color: #ef4444;">*</span></label>
        <input type="number" id="table-limit" class="inp-text" min="1" max="1000" placeholder="Nhập giới hạn bản ghi" />
    </div>
    <div class="input-wrapper">
        <label>Chiều sắp xếp mặc định <span style="color: #ef4444;">*</span></label>
        <select id="default-sort" class="inp-select select-3">
            <option value="asc">Cũ nhất</option>
            <option value="desc">Mới nhất</option>
        </select>
    </div>
    <div class="input-wrapper">
        <label>Trường dữ liệu tìm kiếm <span style="color: #ef4444;">*</span></label>
        <select id="hashed-keyword-fields" multiple="multiple" class="inp-select select-3">
            <!-- Options will be populated dynamically -->
        </select>
    </div>
</div>
```

## CSS Classes tham chiếu

```css
/* General Container */
.general-config {
  padding: 16px;
}

/* Input Wrapper */
.input-wrapper {
  margin-bottom: 16px;
}

.input-wrapper label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

/* Input Styles */
.inp-text {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.inp-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background-color: #fff;
  box-sizing: border-box;
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

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.copy-btn {
  padding: 6px 12px;
}

.material-icons {
  font-size: 18px;
  margin-right: 4px;
}

/* Select2 overrides */
.select2-container {
  width: 100% !important;
}

.select-3 {
  min-height: 44px;
}
```

## Lưu ý khi triển khai

1. **Khả năng tái sử dụng**: Component nên được thiết kế để tái sử dụng ở nhiều nơi
2. **Performance**: Sử dụng React.memo để tránh render không cần thiết
3. **Accessibility**: Đảm bảo các field có label và aria attributes phù hợp
4. **Internationalization**: Cân nhắc thêm i18n cho các label và thông báo
5. **Error Handling**: Xử lý gracefully các lỗi API và validation
6. **Testing**: Viết unit tests và integration tests đầy đủ
