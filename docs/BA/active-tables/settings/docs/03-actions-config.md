# Tài liệu Danh sách hành động

## Tổng quan

Mục Danh sách hành động cho phép người dùng định nghĩa các hành động có thể thực hiện trên bản ghi trong bảng. Hành động có thể là các hành động mặc định của hệ thống hoặc các hành động tùy chỉnh do người dùng định nghĩa, giúp mở rộng chức năng của bảng theo nhu cầu cụ thể.

## Thành phần giao diện

### 1. Danh sách hành động hiện có

- **Mô tả**: Hiển thị danh sách tất cả các hành động đã được cấu hình trong bảng
- **Bộ lọc**: Chỉ hiển thị các hành động loại "custom" (định nghĩa bởi người dùng)
- **Thông tin hiển thị** cho mỗi hành động:
  - Tên hành động
  - Icon (nếu có)
  - ID hành động (dùng cho tích hợp)
  - Nút sao chép ID
- **Hành động trên mỗi action**:
  - Sửa (icon edit)
  - Xóa (icon delete)

### 2. Nút "Thêm hành động"

- **Mô tả**: Nút để mở form thêm hành động mới
- **Vị trí**: Ở cuối danh sách hành động
- **Chức năng**: Mở popup form với các tùy chọn cấu hình

### 3. Popup Form cấu hình hành động

- **Mô tả**: Form chi tiết để thêm/sửa hành động
- **Các phần chính**:
  - Tên Action
  - Icon (chọn từ danh sách icon định sẵn)
  - ID Action (tự động tạo)
  - Nút sao chép ID Action

## Các loại hành động mặc định

Hệ thống tự động tạo các hành động mặc định sau:

1. **Tạo mới bản ghi** (type: create)
   - Icon: create
   - Chức năng: Cho phép người dùng tạo bản ghi mới

2. **Truy cập bản ghi** (type: access)
   - Icon: access
   - Chức năng: Cho phép người dùng xem danh sách bản ghi

3. **Cập nhật bản ghi** (type: update)
   - Icon: update
   - Chức năng: Cho phép người dùng sửa thông tin bản ghi

4. **Xoá bản ghi** (type: delete)
   - Icon: delete
   - Chức năng: Cho phép người dùng xóa bản ghi

5. **Thêm bình luận** (type: comment_create)
   - Icon: create
   - Chức năng: Cho phép người dùng thêm bình luận

6. **Truy cập bình luận** (type: comment_access)
   - Icon: access
   - Chức năng: Cho phép người dùng xem bình luận

7. **Cập nhật bình luận** (type: comment_update)
   - Icon: update
   - Chức năng: Cho phép người dùng sửa bình luận

8. **Xoá bình luận** (type: comment_delete)
   - Icon: delete
   - Chức năng: Cho phép người dùng xóa bình luận

## Các icon được hỗ trợ

- **play**: Biểu tượng phát/ thực thi
- **send**: Biểu tượng gửi
- **check_circle**: Biểu tượng xác nhận/hoàn thành
- **notifications**: Biểu tượng thông báo
- **star**: Biểu tượng đánh dấu/tiện ích

## Cấu trúc dữ liệu (React)

### 1. Action Interface

```typescript
interface Action {
  id?: string;
  name: string;
  type: 'default' | 'custom';
  icon?: string;
  actionId: string;
}

interface ActionsState {
  actions: Action[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}
```

### 2. Available Icons

```typescript
type IconType = 'play' | 'send' | 'check_circle' | 'notifications' | 'star';
```

## Component React 19

### 1. ActionList Component

```typescript
interface ActionListProps {
  actions: Action[];
  onAddAction: () => void;
  onEditAction: (actionId: string) => void;
  onDeleteAction: (actionId: string) => void;
  onCopyActionId: (actionId: string) => void;
  onActionSave: (action: Action, index?: number) => void;
  onActionCancel: () => void;
  isLoading: boolean;
}

const ActionList: React.FC<ActionListProps> = ({
  actions,
  onAddAction,
  onEditAction,
  onDeleteAction,
  onCopyActionId,
  onActionSave,
  onActionCancel,
  isLoading
}) => {
  const [actionFormOpen, setActionFormOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Lọc chỉ các hành động tùy chỉnh để hiển thị
  const customActions = actions.filter(action => action.type === 'custom');

  // Render một item hành động
  const renderActionItem = (action: Action, index: number, actualIndex: number) => {
    return (
      <div className="action-item" key={index}>
        <div className="action-item-header">
          <span>{action.name}</span>
          <div className="field-actions">
            <span
              className="material-icons field-action-btn"
              onClick={() => handleEditAction(action.actionId)}
            >
              edit
            </span>
            <span
              className="material-icons field-action-btn"
              onClick={() => handleDeleteAction(action.actionId)}
            >
              delete
            </span>
          </div>
        </div>
        <div>
          Icon: {action.icon ? <span className="material-icons">{action.icon}</span> : 'Không có'}
        </div>
        <div className="input-wrapper">
          <span>ID hành động</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              type="text"
              value={action.actionId}
              style={{ border: 'none' }}
              readOnly
            />
            <button
              className="btn btn-secondary copy-btn"
              onClick={() => handleCopyActionId(action.actionId)}
            >
              <span className="material-icons">content_copy</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Xử lý sửa hành động
  const handleEditAction = (actionId: string) => {
    const index = actions.findIndex(action => action.actionId === actionId);
    if (index !== -1) {
      setEditingAction(actions[index]);
      setEditingIndex(index);
      setActionFormOpen(true);
    }
  };

  // Xử lý xóa hành động
  const handleDeleteAction = (actionId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa action này?')) {
      onDeleteAction(actionId);
    }
  };

  // Xử lý sao chép ID hành động
  const handleCopyActionId = (actionId: string) => {
    onCopyActionId(actionId);
  };

  // Xử lý thêm hành động mới
  const handleAddAction = () => {
    setEditingAction(null);
    setEditingIndex(null);
    setActionFormOpen(true);
  };

  // Xử lý lưu hành động
  const handleActionSave = (action: Action) => {
    if (editingIndex !== null) {
      onActionSave(action, editingIndex);
    } else {
      onActionSave(action);
    }
    setActionFormOpen(false);
    setEditingAction(null);
    setEditingIndex(null);
  };

  // Xử lý hủy form
  const handleActionCancel = () => {
    setActionFormOpen(false);
    setEditingAction(null);
    setEditingIndex(null);
    onActionCancel();
  };

  return (
    <div className="actions-container">
      <h2>Cấu hình hành động</h2>

      <div className="actions-list" id="action-list">
        {isLoading ? (
          <div className="loading-spinner">Đang tải...</div>
        ) : (
          customActions.map((action, index) => {
            const actualIndex = actions.findIndex(a => a.actionId === action.actionId);
            return renderActionItem(action, index, actualIndex);
          })
        )}
      </div>

      <div className="add-field-btn" onClick={handleAddAction}>
        Thêm hành động
      </div>

      {actionFormOpen && (
        <ActionForm
          action={editingAction}
          onSave={handleActionSave}
          onCancel={handleActionCancel}
        />
      )}
    </div>
  );
};
```

### 2. ActionForm Component

```typescript
interface ActionFormProps {
  action?: Action | null;
  onSave: (action: Action) => void;
  onCancel: () => void;
}

const ActionForm: React.FC<ActionFormProps> = ({
  action,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Action>({
    name: '',
    type: 'custom',
    icon: '',
    actionId: ''
  });

  const availableIcons: IconType[] = [
    'play', 'send', 'check_circle', 'notifications', 'star'
  ];

  // Khởi tạo form khi action được chọn để sửa
  useEffect(() => {
    if (action) {
      setFormData({
        ...action
      });
    } else {
      // Tạo actionId mới khi thêm mới
      setFormData(prev => ({
        ...prev,
        actionId: generateUUIDv7()
      }));
    }
  }, [action]);

  // Cập nhật formData khi có thay đổi
  const handleFieldChange = (field: keyof Action, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Xác thực form
  const validateForm = (): { isValid: boolean; error: string } => {
    if (!formData.name.trim()) {
      return { isValid: false, error: 'Tên Action không được để trống.' };
    }

    if (!formData.actionId.trim()) {
      return { isValid: false, error: 'ID Action không được để trống.' };
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

    onSave(formData);
  };

  // Tạo UUID v7
  const generateUUIDv7 = (): string => {
    const timestamp = Date.now();
    const timestampHex = timestamp.toString(16).padStart(12, '0');
    const randomBytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
    randomBytes[6] = (randomBytes[6] & 0x0f) | 0x70;
    randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80;
    const hex = randomBytes.map(b => b.toString(16).padStart(2, '0'));
    return `${timestampHex.slice(0, 8)}-${timestampHex.slice(8, 12)}-${hex[4]}-${hex[6]}-${hex[8]}${hex[9]}${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`;
  };

  // Xử lý sao chép ID
  const handleCopyActionId = async () => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(formData.actionId);
        alert('Đã sao chép Action ID!');
      } catch (err) {
        console.error('Clipboard API error:', err);
        fallbackCopyToClipboard(formData.actionId);
      }
    } else {
      fallbackCopyToClipboard(formData.actionId);
    }
  };

  // Fallback cho trình duyệt cũ
  const fallbackCopyToClipboard = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Đã sao chép Action ID!');
    } catch (err) {
      console.error('Fallback copy error:', err);
      alert('Lỗi khi sao chép Action ID.');
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>{action ? 'Sửa hành động' : 'Thêm hành động mới'}</h2>

        <div className="popup-form-container">
          <div className="popup-form">
            <div>
              <label>Tên Action <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={e => handleFieldChange('name', e.target.value)}
                placeholder="Tên Action"
              />
            </div>

            <div>
              <label>Icon</label>
              <select
                value={formData.icon}
                onChange={e => handleFieldChange('icon', e.target.value)}
              >
                <option value="">Không có icon</option>
                {availableIcons.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>

            <div className="input-wrapper">
              <label>Action ID</label>
              <input
                type="text"
                value={formData.actionId}
                readOnly
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-secondary copy-btn"
                onClick={handleCopyActionId}
              >
                <span className="material-icons">content_copy</span>
                Copy
              </button>
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

### 3. InitDefaultActions Utility Function

```typescript
const initDefaultActions = (currentActions: Action[]): Action[] => {
  // Ensure currentActions is an array
  if (!Array.isArray(currentActions)) {
    currentActions = [];
  }

  // Define default actions
  const defaultActions: Action[] = [
    { name: 'Tạo mới bản ghi', type: 'default', icon: 'create', actionId: '' },
    { name: 'Truy cập bản ghi', type: 'default', icon: 'access', actionId: '' },
    { name: 'Cập nhật bản ghi', type: 'default', icon: 'update', actionId: '' },
    { name: 'Xoá bản ghi', type: 'default', icon: 'delete', actionId: '' },
    { name: 'Thêm bình luận', type: 'default', icon: 'create', actionId: '' },
    { name: 'Truy cập bình luận', type: 'default', icon: 'access', actionId: '' },
    { name: 'Cập nhật bình luận', type: 'default', icon: 'update', actionId: '' },
    { name: 'Xoá bình luận', type: 'default', icon: 'delete', actionId: '' },
  ];

  // Map currentActions by type for quick lookup
  const currentActionsMap = new Map(currentActions.map((action) => [action.type, action]));

  // Merge default actions with currentActions, preserving existing actionId
  const mergedActions: Action[] = defaultActions.map((defaultAction) => {
    if (currentActionsMap.has(defaultAction.type)) {
      // Use existing actionId if type exists in currentActions
      return { ...defaultAction, actionId: currentActionsMap.get(defaultAction.type)!.actionId };
    } else {
      // Generate new actionId for missing types
      return { ...defaultAction, actionId: generateUUIDv7() };
    }
  });

  // Add remaining actions from currentActions that are not default types
  const remainingActions = currentActions.filter(
    (action) => !defaultActions.some((defaultAction) => defaultAction.type === action.type),
  );

  // Combine and return the final list
  return [...mergedActions, ...remainingActions];
};
```

## State Management (Redux/Context)

### 1. Redux Slice

```typescript
const actionsSlice = createSlice({
  name: 'actions',
  initialState: {
    actions: [],
    isLoading: false,
    isSaving: false,
    error: null,
  } as ActionsState,
  reducers: {
    setActions: (state, action) => {
      state.actions = action.payload;
    },
    addAction: (state, action) => {
      state.actions.push(action.payload);
    },
    updateAction: (state, action) => {
      const { index, actionData } = action.payload;
      state.actions[index] = actionData;
    },
    deleteAction: (state, action) => {
      const index = state.actions.findIndex((action) => action.actionId === action.payload);
      if (index !== -1) {
        state.actions.splice(index, 1);
      }
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

Không có API endpoint riêng cho Actions. Tất cả actions được quản lý trong **client-side state** và lưu thông qua **một endpoint PATCH duy nhất**:

```
PATCH /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}
```

#### Cách hoạt động:

1. **Khởi tạo actions mặc định**:

```javascript
// Khi load table, system tự động merge default actions
static initDefaultActions(currentActions) {
  const defaultActions = [
    { name: 'Tạo mới bản ghi', type: 'create', icon: 'create' },
    { name: 'Truy cập bản ghi', type: 'access', icon: 'access' },
    { name: 'Cập nhật bản ghi', type: 'update', icon: 'update' },
    { name: 'Xoá bản ghi', type: 'delete', icon: 'delete' },
    { name: 'Thêm bình luận', type: 'comment_create', icon: 'create' },
    { name: 'Truy cập bình luận', type: 'comment_access', icon: 'access' },
    { name: 'Cập nhật bình luận', type: 'comment_update', icon: 'update' },
    { name: 'Xoá bình luận', type: 'comment_delete', icon: 'delete' },
  ];

  // Merge với currentActions, giữ nguyên actionId đã có
  const mergedActions = defaultActions.map(defaultAction => {
    const existing = currentActions.find(a => a.type === defaultAction.type);
    return existing
      ? { ...defaultAction, actionId: existing.actionId }
      : { ...defaultAction, actionId: CommonUtils.generateUUIDv7() };
  });

  // Thêm các custom actions
  const customActions = currentActions.filter(a =>
    !defaultActions.some(d => d.type === a.type)
  );

  return [...mergedActions, ...customActions];
}
```

2. **Thêm custom action** (chỉ thay đổi state local):

```javascript
// User click "Thêm hành động" -> Nhập thông tin -> "Xác nhận"
static saveActionConfig() {
  const action = {
    name: actionName.value,
    type: 'custom',
    icon: actionIcon.value || null,
    actionId: actionId.value  // UUID v7 đã tạo sẵn
  };

  // CHỈ thêm/update vào state local
  if (this.editingActionIndex !== null) {
    this.actions[this.editingActionIndex] = action;
  } else {
    this.actions.push(action);
  }

  this.renderActions();
  CommonUtils.closePopup();

  // API chỉ được gọi khi user nhấn nút "Lưu" chính
}
```

3. **Xóa action** (chỉ thay đổi state local):

```javascript
static removeAction(actionId) {
  if (confirm('Bạn có chắc chắn muốn xóa action này?')) {
    const index = this.actions.findIndex(a => a.actionId === actionId);
    this.actions.splice(index, 1);  // CHỈ xóa khỏi state local
    this.renderActions();
  }
}
```

4. **Lưu tất cả thay đổi**:

```javascript
static async saveTableConfig() {
  const response = await TableAPI.updateTable(tableId, {
    config: {
      actions: this.actions,  // ← TẤT CẢ actions (default + custom)
      fields: this.fields,
      // ... tất cả config khác
    }
  });
}
```

**Đặc điểm:**

- ✅ Default actions tự động được tạo và merge với existing actions
- ✅ Custom actions được add vào state local với UUID v7
- ✅ Chỉ custom actions hiển thị trong UI để edit/delete
- ✅ Default actions không thể xóa, chỉ có thể config permissions
- ✅ actionId được dùng để map với permissions config

Xem [API Endpoints Analysis](./API-ENDPOINTS-ANALYSIS.md) để biết chi tiết đầy đủ.

## Hook tùy chỉnh

### 1. useActions Hook

```typescript
interface UseActionsOptions {
  tableId: string;
}

const useActions = ({ tableId }: UseActionsOptions) => {
  const dispatch = useAppDispatch();
  const actions = useAppSelector((state) => state.actions.actions);
  const isLoading = useAppSelector((state) => state.actions.isLoading);
  const isSaving = useAppSelector((state) => state.actions.isSaving);
  const error = useAppSelector((state) => state.actions.error);

  // Tải danh sách hành động
  const fetchActions = useCallback(async () => {
    dispatch(actionsSlice.actions.setLoading(true));
    try {
      const data = await actionAPI.fetchActions(tableId);
      const initializedActions = initDefaultActions(data);
      dispatch(actionsSlice.actions.setActions(initializedActions));
    } catch (err) {
      dispatch(actionsSlice.actions.setError(err.message));
    } finally {
      dispatch(actionsSlice.actions.setLoading(false));
    }
  }, [dispatch, tableId]);

  // Thêm hành động mới
  const addAction = useCallback(
    async (action: Action) => {
      dispatch(actionsSlice.actions.setSaving(true));
      try {
        const newAction = await actionAPI.createAction(tableId, action);
        dispatch(actionsSlice.actions.addAction(newAction));
        return newAction;
      } catch (err) {
        dispatch(actionsSlice.actions.setError(err.message));
        throw err;
      } finally {
        dispatch(actionsSlice.actions.setSaving(false));
      }
    },
    [dispatch, tableId],
  );

  // Cập nhật hành động
  const updateAction = useCallback(
    async (actionId: string, action: Action) => {
      dispatch(actionsSlice.actions.setSaving(true));
      try {
        const updatedAction = await actionAPI.updateAction(tableId, actionId, action);
        const index = actions.findIndex((a) => a.actionId === actionId);
        if (index !== -1) {
          dispatch(actionsSlice.actions.updateAction({ index, actionData: updatedAction }));
        }
        return updatedAction;
      } catch (err) {
        dispatch(actionsSlice.actions.setError(err.message));
        throw err;
      } finally {
        dispatch(actionsSlice.actions.setSaving(false));
      }
    },
    [dispatch, actions, tableId],
  );

  // Xóa hành động
  const deleteAction = useCallback(
    async (actionId: string) => {
      dispatch(actionsSlice.actions.setSaving(true));
      try {
        await actionAPI.deleteAction(tableId, actionId);
        dispatch(actionsSlice.actions.deleteAction(actionId));
      } catch (err) {
        dispatch(actionsSlice.actions.setError(err.message));
        throw err;
      } finally {
        dispatch(actionsSlice.actions.setSaving(false));
      }
    },
    [dispatch, tableId],
  );

  // Sao chép ID hành động
  const copyActionId = useCallback(async (actionId: string) => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(actionId);
        return { success: true, message: 'Đã sao chép Action ID!' };
      } catch (err) {
        console.error('Clipboard API error:', err);
        return fallbackCopyToClipboard(actionId);
      }
    } else {
      return fallbackCopyToClipboard(actionId);
    }
  }, []);

  // Fallback cho trình duyệt cũ
  const fallbackCopyToClipboard = (text: string): { success: boolean; message: string } => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return { success: true, message: 'Đã sao chép Action ID!' };
    } catch (err) {
      console.error('Fallback copy error:', err);
      return { success: false, message: 'Lỗi khi sao chép Action ID.' };
    }
  };

  return {
    actions,
    isLoading,
    isSaving,
    error,
    fetchActions,
    addAction,
    updateAction,
    deleteAction,
    copyActionId,
  };
};
```

## CSS Classes tham chiếu

```css
/* Actions Container */
.actions-container {
  padding: 16px;
}

.action-item {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 16px;
}

.action-item-header {
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

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: 'liga';
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.input-wrapper label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.input-wrapper input,
.input-wrapper select {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

/* Copy Button */
.copy-btn {
  padding: 8px 12px;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Popup Styles (reuse from FieldForm) */
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
  max-width: 600px;
  width: 100%;
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
.popup-form select {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.popup-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
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
```

## Quy trình nghiệp vụ

### 1. Khởi tạo

1. Người dùng chọn một bảng từ danh sách
2. Hệ thống tải danh sách hành động của bảng
3. Hệ thống tự động thêm các hành động mặc định nếu thiếu
4. Component hiển thị danh sách hành động (chỉ các loại "custom")

### 2. Thêm hành động mới

1. Người dùng nhấn nút "Thêm hành động"
2. Popup form mở với ID được tự động tạo
3. Người dùng điền tên và chọn icon (tùy chọn)
4. Người dùng có thể sao chép ID để sử dụng trong tích hợp
5. Khi nhấn "Xác nhận", hệ thống validate và gửi API
6. Nếu thành công, thêm hành động vào danh sách và đóng popup

### 3. Sửa hành động

1. Người dùng nhấn icon "edit" trên một hành động
2. Popup form mở với thông tin của hành động được chọn
3. Người dùng chỉnh sửa tên và icon
4. Khi nhấn "Xác nhận", hệ thống validate và gửi API
5. Nếu thành công, cập nhật hành động trong danh sách và đóng popup

### 4. Xóa hành động

1. Người dùng nhấn icon "delete" trên một hành động
2. Hệ thống hiển thị dialog xác nhận
3. Nếu người dùng xác nhận, gửi API xóa
4. Nếu thành công, xóa hành động khỏi danh sách

### 5. Sao chép ID hành động

1. Người dùng nhấn nút "Copy" trên một hành động
2. Hệ thống sao chép ID vào clipboard
3. Hiển thị thông báo thành công/lỗi
4. ID có thể được sử dụng cho tích hợp với các hệ thống khác

## Mã nguồn tham khảo từ Blade Template

```javascript
// Danh sách hành động
<div id="action-list"></div>
<div class="add-field-btn" onclick="DetailView.addAction()">Thêm hành động</div>

// Popup form hành động
<div id="action-config-form" style="display: none;">
    <div class="popup-form-container">
        <div class="popup-form">
            <div>
                <label>Tên Action <span style="color: #ef4444;">*</span></label>
                <input type="text" id="action-name" placeholder="Tên Action" />
            </div>
            <div>
                <label>Icon</label>
                <select id="action-icon">
                    <option value="">Không có icon</option>
                    <option value="play_arrow">Play</option>
                    <option value="send">Send</option>
                    <option value="check_circle">Check Circle</option>
                    <option value="notifications">Notification</option>
                    <option value="star">Star</option>
                </select>
            </div>
            <div class="input-wrapper">
                <label>Action ID</label>
                <input type="text" id="action-id" readonly />
                <button class="btn btn-secondary copy-btn" onclick="DetailView.copyActionId()">
                    <span class="material-icons">content_copy</span>
                    Copy
                </button>
            </div>
        </div>
    </div>
</div>

// Khởi tạo hành động mặc định
static initDefaultActions(currentActions) {
    // Ensure currentActions is an array
    if (!Array.isArray(currentActions)) {
        currentActions = [];
    }

    // Define default actions
    const defaultActions = [
        { name: 'Tạo mới bản ghi', type: 'create', icon: 'create' },
        { name: 'Truy cập bản ghi', type: 'access', icon: 'access' },
        { name: 'Cập nhật bản ghi', type: 'update', icon: 'update' },
        { name: 'Xoá bản ghi', type: 'delete', icon: 'delete' },
        { name: 'Thêm bình luận', type: 'comment_create', icon: 'create' },
        { name: 'Truy cập bình luận', type: 'comment_access', icon: 'access' },
        { name: 'Cập nhật bình luận', type: 'comment_update', icon: 'update' },
        { name: 'Xoá bình luận', type: 'comment_delete', icon: 'delete' },
    ];

    // Map currentActions by type for quick lookup
    const currentActionsMap = new Map(currentActions.map(action => [action.type, action]));

    // Merge default actions with currentActions, preserving existing actionId
    const mergedActions = defaultActions.map(defaultAction => {
        if (currentActionsMap.has(defaultAction.type)) {
            // Use existing actionId if type exists in currentActions
            return { ...defaultAction, actionId: currentActionsMap.get(defaultAction.type).actionId };
        } else {
            // Generate new actionId for missing types
            return { ...defaultAction, actionId: CommonUtils.generateUUIDv7() };
        }
    });

    // Add remaining actions from currentActions that are not default types
    const remainingActions = currentActions.filter(action => !defaultActions.some(defaultAction => defaultAction.type === action.type));

    // Combine and return the final list
    return [...mergedActions, ...remainingActions];
}

// Sao chép ID hành động
static copyActionId() {
    const actionIdInput = document.getElementById('action-id');
    if (!actionIdInput || !actionIdInput.value) {
        CommonUtils.showMessage('Không có Action ID để sao chép.', false);
        return;
    }
    const id = actionIdInput.value;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(id)
            .then(() => CommonUtils.showMessage('Đã sao chép Action ID!', true))
            .catch(error => {
                console.error('Clipboard API error:', error);
                this.fallbackCopy(id);
            });
    } else {
        this.fallbackCopy(id);
    }
}
```

## Lưu ý khi triển khai

1. **ID Generation**: Sử dụng thuật toán UUID v7 để tạo ID duy nhất và có sắp xếp theo thời gian
2. **Icon Integration**: Cân nhắc tích hợp với thư viện icon như Material Icons hoặc Font Awesome
3. **Default Actions**: Đảm bảo các hành động mặc định luôn có sẵn cho tất cả các bảng
4. **Permission Integration**: Actions cần được tích hợp với hệ thống phân quyền
5. **Action Execution**: Cần có cơ chế thực thi các action dựa trên actionId
6. **Security**: Xác thực và phân quyền trước khi thực thi các action
7. **Testing**: Viết unit tests và integration tests cho các action functions
8. **Logging**: Ghi lại các hành động của người dùng cho audit trail
