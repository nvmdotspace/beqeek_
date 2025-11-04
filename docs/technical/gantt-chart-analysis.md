# Phân Tích Chi Tiết Feature Gantt Chart

## Tổng quan

Feature Gantt Chart trong hệ thống Active Tables được thiết kế để hiển thị dữ liệu dưới dạng biểu đồ Gantt, giúp người dùng quản lý và theo dõi tiến độ công việc một cách trực quan. Tài liệu này phân tích chi tiết về cấu trúc, luồng hoạt động, các tính năng đã và chưa được triển khai.

## Cấu Trúc Object GanttView

### 1. Class Definition và State Management

```javascript
class GanttView extends CommonStates {
  static currentStates = {
    currentGanttConfig: null, // Lưu trữ cấu hình Gantt đang hoạt động
    ganttRecords: [], // Danh sách các bản ghi hiển thị trên Gantt
    nextPageId: null, // ID cho trang tiếp theo (pagination)
    direction: null, // Hướng phân trang (asc/desc)
    chartInstance: null, // Instance của Frappe Gantt chart
  };
}
```

**Phân tích chi tiết:**

- `currentGanttConfig`: Lưu trữ toàn bộ cấu hình Gantt bao gồm các trường ánh xạ (taskNameField, startDateField, endDateField, progressField, dependencyField)
- `ganttRecords`: Mảng lưu trữ các bản ghi sau khi được fetch từ API và xử lý
- `nextPageId`: Hỗ trợ cơ chế cursor-based pagination để tải thêm dữ liệu
- `direction`: Quyết định hướng phân trang khi tải thêm dữ liệu
- `chartInstance`: Tham chiếu đến đối tượng Frappe Gantt để tương tác với biểu đồ

### 2. Phương thức chính

#### 2.1. render(tableId, ganttConfigId, queryParams)

- **Mục đích**: Khởi tạo view Gantt với ID bảng và cấu hình Gantt cụ thể
- **Luồng hoạt động**:
  1. Kiểm tra tính hợp lệ của tableId
  2. Fetch thông tin chi tiết của bảng nếu chưa có trong state
  3. Xác định cấu hình Gantt cần sử dụng
  4. Kích hoạt view Gantt thông qua `activeRecordSubSectionView`
  5. Gọi `renderContent()` để hiển thị nội dung

#### 2.2. renderContent()

- **Mục đích**: Hiển thị nội dung chính của Gantt chart
- **Luồng hoạt động**:
  1. Reset state view để xóa dữ liệu cũ
  2. Hiển thị selector để chuyển đổi giữa các cấu hình Gantt (nếu có nhiều)
  3. Render các bộ lọc nhanh (quick filters)
  4. Gọi `renderGanttBoard()` để hiển thị biểu đồ

#### 2.3. renderGanttBoard()

- **Mục đích**: Fetch dữ liệu và render biểu đồ Gantt
- **Luồng hoạt động**:
  1. Lấy cấu hình Gantt hiện tại từ state
  2. Validate các trường bắt buộc (taskName, startDate, endDate)
  3. Fetch dữ liệu bản ghi thông qua `RecordView.fetchRecords()`
  4. Xử lý các trường tham chiếu (reference fields)
  5. Transform dữ liệu sang format phù hợp cho Gantt chart
  6. Khởi tạo instance Frappe Gantt với các tùy chọn

#### 2.4. initGanttChart(data)

- **Mục đích**: Khởi tạo Frappe Gantt với dữ liệu đã được xử lý
- **Cấu hình chính**:
  - `view_mode`: 'Day' (chế độ xem theo ngày)
  - `language`: 'vi' (hỗ trợ tiếng Việt)
  - `date_format`: Format ngày theo locale Việt Nam
  - `custom_popup_html`: Template popup hiển thị chi tiết task
  - Event handlers: `on_click`, `on_date_change`, `on_progress_change`, `on_view_change`

#### 2.5. switchGanttConfig(configId)

- **Mục đích**: Chuyển đổi giữa các cấu hình Gantt khác nhau
- **Luồng hoạt động**:
  1. Tìm cấu hình Gantt theo configId
  2. Cập nhật state với cấu hình mới
  3. Render lại nội dung với cấu hình đã chọn

## Luồng Dữ Liệu và API Calls

### 1. Data Fetching Flow

```
User Access → GanttView.render() → fetchTableDetails() → renderContent() →
fetchRecords() → Data Transformation → initGanttChart()
```

**Phân tích chi tiết:**

#### 1.1. Table Details Fetching

- **Endpoint**: `${API_PREFIX}/get/active_tables/${tableId}`
- **Method**: POST với `isGetAction = true`
- **Response**: Chi tiết bảng bao gồm cấu hình Gantt trong `table.config.ganttCharts`
- **Xử lý E2EE**: Nếu bảng có mã hóa đầu cuối, sẽ yêu cầu người dùng nhập khóa

#### 1.2. Records Fetching

- **Endpoint**: `${API_PREFIX}/get/active_tables/${tableId}/records`
- **Parameters**:
  ```javascript
  {
      paging: 'cursor',
      filtering: States.currentRecordFilters,
      next_id: currentPageId,
      direction: direction,
      limit: limit
  }
  ```
- **Response**: Danh sách bản ghi với cursor-based pagination
- **Decryption**: Nếu có E2EE, các trường sensitive được giải mã trước khi hiển thị

### 2. Data Transformation Process

#### 2.1. Reference Fields Resolution

- **User Fields**: Lấy thông tin user từ các trường SELECT_WORKSPACE_USER
- **Record References**: Lấy thông tin bản ghi từ các trường SELECT_RECORD

#### 2.2. Gantt Data Mapping

Mỗi bản ghi được transform sang format:

```javascript
{
    id: record.id,                    // ID bản ghi gốc
    name: taskName || '-',           // Tên task
    start: startDate,                // Ngày bắt đầu
    end: endDate,                    // Ngày kết thúc
    progress: progress || 0,         // Tiến độ (0-100)
    dependencies: dependencies || ''  // Chuỗi các task phụ thuộc
}
```

## Phân Tích Tính Năng Đã Triển Khai

### 1. ✅ Tính năng đã hoàn thành

#### 1.1. Hiển thị cơ bản

- Biểu đồ Gantt với các task được hiển thị theo timeline
- Hỗ trợ multiple Gantt configurations
- Hiển thị thông tin task khi hover/click

#### 1.2. Localization

- Giao diện hoàn toàn tiếng Việt
- Format ngày tháng theo locale Việt Nam
- Message error/info bằng tiếng Việt

#### 1.3. Navigation

- Chuyển đổi giữa các cấu hình Gantt
- Tích hợp với navigation hệ thống
- Route-based navigation với support cho ganttConfigId

#### 1.4. Data Security

- Hỗ trợ E2EE cho các trường sensitive
- Quyền truy cập dựa trên workspace authentication
- Token-based API authentication

### 2. ❌ Tính năng chưa hoàn thành

#### 2.1. CRUD Operations

**Vấn đề:** Event handlers chỉ log thay đổi mà không persist

```javascript
// Hiện tại chỉ log console
on_date_change: (task, start, end) => {
  console.log(`Task "${task.name}" đổi thời gian:`, start, end);
};
```

**Cần triển khai:**

- API calls để update dates
- API calls để update progress
- Validation trước khi update
- Error handling cho failed updates

#### 2.2. Task Management

- Không thể tạo mới task từ Gantt view
- Không thể xóa task
- Không thể edit task properties trực tiếp trên Gantt
- Không thể add/remove dependencies

#### 2.3. Advanced Gantt Features

- Critical path visualization
- Milestone markers
- Resource allocation và leveling
- Task grouping/hierarchy
- Baseline comparison
- Slack/float visualization

#### 2.4. Real-time Updates

- Không có WebSocket support
- Không có live updates khi user khác thay đổi data
- Không có conflict resolution

#### 2.5. Performance Optimizations

- Không có virtual scrolling cho large datasets
- Không có lazy loading ngoài pagination
- Không có caching cho fetched data

#### 2.6. Export/Reporting

- Không có export to PDF
- Không có export to Excel
- Không có print-optimized view
- Không có reporting dashboard

## Phân Tích API Capabilities

### 1. Supported API Operations

#### 1.1. Table Operations

- ✅ `get/active_tables/{id}` - Fetch table details with Gantt configs
- ✅ `get/active_tables/{id}/records` - Fetch records with pagination and filters

#### 1.2. Record Operations

- ✅ `post/active_tables/{id}/records` - Create new record
- ✅ `patch/active_tables/{id}/records/{recordId}` - Update existing record
- ✅ `delete/active_tables/{id}/records/{recordId}` - Delete record

### 2. Missing API Operations for Gantt

#### 2.1. Batch Operations

- ❌ `patch/active_tables/{id}/records/batch` - Bulk update multiple records
- ❌ `post/active_tables/{id}/records/batch` - Bulk create records

#### 2.2. Dependency Management

- ❌ `get/active_tables/{id}/dependencies` - Get task dependencies
- ❌ `post/active_tables/{id}/dependencies` - Create task dependency
- ❌ `delete/active_tables/{id}/dependencies/{id}` - Remove dependency

#### 2.3. Gantt-specific Operations

- ❌ `get/active_tables/{id}/gantt/critical_path` - Calculate critical path
- ❌ `get/active_tables/{id}/gantt/resource_allocation` - Get resource usage
- ❌ `get/active_tables/{id}/gantt/baseline` - Get baseline data

## Đề Xuất Cải Thiện

### 1. Immediate Improvements (High Priority)

#### 1.1. Implement CRUD Operations

```javascript
// Cần triển khai trong on_date_change handler
on_date_change: async (task, start, end) => {
  try {
    await TableAPI.updateRecord(States.currentTable, task.id, {
      record: {
        [currentGanttConfig.startDateField]: start,
        [currentGanttConfig.endDateField]: end,
      },
    });
    CommonUtils.showMessage('Cập nhật thời gian thành công', true);
  } catch (error) {
    CommonUtils.showMessage('Lỗi khi cập nhật thời gian: ' + error.message, false);
    // Revert chart change
    ganttChart.refresh();
  }
};
```

#### 1.2. Add Task Creation Modal

- Button tạo task mới trên Gantt view
- Form với các trường: name, start date, end date, progress
- Tự động tính dependencies khi cần

#### 1.3. Implement Error Handling

- Validation cho date ranges
- Conflict resolution cho overlapping tasks
- Network error handling với retry mechanism

### 2. Medium Priority Improvements

#### 2.1. Performance Optimization

- Implement virtual scrolling cho large datasets
- Add client-side caching với expiration
- Implement incremental updates instead of full refresh

#### 2.2. Advanced Gantt Features

- Critical path calculation algorithm
- Milestone visualization
- Task hierarchy support

#### 2.3. Export Functionality

- PDF export with custom date ranges
- Excel export with Gantt template
- PNG export for sharing

### 3. Long-term Improvements

#### 3.1. Real-time Collaboration

- WebSocket integration for live updates
- Conflict resolution algorithm
- User presence indicators

#### 3.2. Advanced Analytics

- Resource utilization charts
- Burn-down/burn-up charts
- Performance metrics dashboard

## Kết Luận

Feature Gantt Chart hiện tại đang ở giai đoạn **proof-of-concept** với các chức năng cơ bản đã được triển khai nhưng thiếu nhiều tính năng quan trọng của một công cụ quản lý project thực tế. Cần tập trung vào việc hoàn thiện CRUD operations, error handling, và các tính năng tương tác người dùng để biến nó thành một công cụ hữu ích trong môi trường production.

Architecture hiện tại có nền tảng tốt với separation of concerns rõ ràng, state management hiệu quả, và integration chặt chẽ với hệ thống Active Tables. Điều này tạo điều kiện thuận lợi để phát triển thêm các tính năng nâng cao trong tương lai.
