# Tài liệu: Thiết lập Gantt Chart (Gantt Configuration)

## 1. Tổng quan

Phần **Thiết lập Gantt Chart** cho phép tạo màn hình hiển thị dữ liệu dạng biểu đồ Gantt, phù hợp cho quản lý dự án và timeline.

### Chức năng chính:

- Tạo nhiều cấu hình Gantt Chart cho một bảng
- Cấu hình các trường: tên task, ngày bắt đầu, ngày kết thúc, tiến độ, phụ thuộc
- Mỗi cấu hình có screen ID riêng

---

## 2. Cấu trúc dữ liệu

```typescript
interface GanttConfig {
  ganttScreenId: string; // UUID v7
  screenName: string; // Tên màn hình
  screenDescription?: string; // Mô tả màn hình
  taskNameField: string; // Trường tên task (SHORT_TEXT hoặc TEXT)
  startDateField: string; // Trường ngày bắt đầu (DATE hoặc DATETIME)
  endDateField: string; // Trường ngày kết thúc (DATE hoặc DATETIME)
  progressField?: string; // Trường tiến độ (NUMERIC hoặc INTEGER) - optional
  dependencyField?: string; // Trường phụ thuộc (SELECT_ONE_RECORD hoặc SELECT_LIST_RECORD) - optional
}
```

---

## 3. Component React (tóm tắt)

```tsx
const GanttConfiguration: React.FC = () => {
  // State management
  const eligibleTaskFields = fields.filter((f) => ['SHORT_TEXT', 'TEXT'].includes(f.type));
  const eligibleDateFields = fields.filter((f) => ['DATE', 'DATETIME'].includes(f.type));
  const eligibleProgressFields = fields.filter((f) => ['NUMERIC', 'INTEGER'].includes(f.type));
  const eligibleDependencyFields = fields.filter((f) => ['SELECT_ONE_RECORD', 'SELECT_LIST_RECORD'].includes(f.type));

  // Form với các trường bắt buộc: taskNameField, startDateField, endDateField
  // Các trường tùy chọn: progressField, dependencyField
};
```

---

## 4. So sánh với Code gốc

```javascript
static populateGanttConfigForm() {
    const fields = States.currentTable.config.fields || [];

    // Populate field options
    taskNameField.innerHTML = `<option value="">Chọn trường tên nhiệm vụ</option>` +
        fields
            .filter(f => ['SHORT_TEXT', 'TEXT'].includes(f.type))
            .map(f => `<option value="${f.name}" ${this.currentGanttConfig?.taskNameField === f.name ? 'selected' : ''}>${f.label}</option>`)
            .join('');
    startDateField.innerHTML = `<option value="">Chọn trường ngày bắt đầu</option>` +
        fields
            .filter(f => ['DATE', 'DATETIME'].includes(f.type))
            .map(f => `<option value="${f.name}">${f.label}</option>`)
            .join('');
    endDateField.innerHTML = `<option value="">Chọn trường ngày kết thúc</option>` +
        fields
            .filter(f => ['DATE', 'DATETIME'].includes(f.type))
            .map(f => `<option value="${f.name}">${f.label}</option>`)
            .join('');
    progressField.innerHTML = `<option value="">Chọn trường tiến độ (không bắt buộc)</option>` +
        fields
            .filter(f => ['NUMERIC', 'INTEGER'].includes(f.type))
            .map(f => `<option value="${f.name}">${f.label}</option>`)
            .join('');
    dependencyField.innerHTML = `<option value="">Chọn trường phụ thuộc (không bắt buộc)</option>` +
        fields
            .filter(f => ['SELECT_ONE_RECORD', 'SELECT_LIST_RECORD'].includes(f.type))
            .map(f => `<option value="${f.name}">${f.label}</option>`)
            .join('');

    if (this.currentGanttConfig) {
        ganttScreenId.value = this.currentGanttConfig.ganttScreenId || '';
        screenName.value = this.currentGanttConfig.screenName || '';
        screenDescription.value = this.currentGanttConfig.screenDescription || '';
    } else {
        ganttScreenId.value = CommonUtils.generateUUIDv7();
        screenName.value = '';
        screenDescription.value = '';
    }
}

static async saveGanttConfig() {
    const screenName = document.getElementById('gantt-screen-name').value.trim();
    const taskNameField = document.getElementById('gantt-task-name-field').value;
    const startDateField = document.getElementById('gantt-start-date-field').value;
    const endDateField = document.getElementById('gantt-end-date-field').value;

    if (!screenName || !taskNameField || !startDateField || !endDateField) {
        CommonUtils.showMessage('Vui lòng điền đầy đủ các trường bắt buộc.', false);
        return;
    }

    const ganttConfig = {
        ganttScreenId,
        screenName,
        screenDescription,
        taskNameField,
        startDateField,
        endDateField,
        progressField: progressField || null,
        dependencyField: dependencyField || null
    };

    if (!States.currentTable.config.ganttCharts) {
        States.currentTable.config.ganttCharts = [];
    }

    if (this.currentAction === 'edit_gantt_config') {
        States.currentTable.config.ganttCharts[this.currentGanttConfigIndex] = ganttConfig;
    } else {
        States.currentTable.config.ganttCharts.push(ganttConfig);
    }

    await this.saveTableConfig();
    CommonUtils.closePopup();
    await this.renderGanttConfigList();
}

static async renderGanttConfigList() {
    const ganttConfigList = document.getElementById('gantt-chart-config-list');
    const ganttCharts = States.currentTable.config.ganttCharts || [];

    ganttConfigList.innerHTML = ganttCharts.map((config, index) => `
        <div class="gantt-config-item">
            <div class="gantt-config-item-header">
                <span>${config.screenName}</span>
                <div class="field-actions">
                    <span class="material-icons field-action-btn" onclick="DetailView.editGanttConfig(${index})">edit</span>
                    <span class="material-icons field-action-btn" onclick="DetailView.removeGanttConfig(${index})">delete</span>
                </div>
            </div>
        </div>
    `).join('');
}
```

---

## 5. Validation Rules

### Trường bắt buộc:

- **screenName**: Tên màn hình (required)
- **taskNameField**: Phải là SHORT_TEXT hoặc TEXT (required)
- **startDateField**: Phải là DATE hoặc DATETIME (required)
- **endDateField**: Phải là DATE hoặc DATETIME (required)

### Trường tùy chọn:

- **progressField**: Phải là NUMERIC hoặc INTEGER (optional)
- **dependencyField**: Phải là SELECT_ONE_RECORD hoặc SELECT_LIST_RECORD (optional)

---

## 6. Quy trình nghiệp vụ

### Thêm cấu hình Gantt:

1. Tạo UUID v7 cho ganttScreenId
2. Nhập tên và mô tả màn hình
3. Chọn trường tên task (bắt buộc)
4. Chọn trường ngày bắt đầu (bắt buộc)
5. Chọn trường ngày kết thúc (bắt buộc)
6. Chọn trường tiến độ (tùy chọn)
7. Chọn trường phụ thuộc (tùy chọn)
8. Validate và lưu vào Redux store

### Use Cases:

- **Quản lý dự án**: Task name, start/end date, progress
- **Timeline sự kiện**: Event name, start/end date
- **Lập lịch công việc**: Task name, start/end date, dependencies
