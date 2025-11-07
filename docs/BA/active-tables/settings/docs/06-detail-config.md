# Tài liệu: Cấu hình Chi tiết (Detail Configuration)

## 1. Tổng quan

Phần **Cấu hình chi tiết** cho phép người dùng tùy chỉnh cách hiển thị thông tin chi tiết của một bản ghi với 2 layout: Head Detail và Two Column Detail.

## 2. Cấu trúc dữ liệu

```typescript
enum RecordDetailLayout {
  HEAD_DETAIL = 'head-detail',
  TWO_COLUMN_DETAIL = 'two-column-detail',
}

enum CommentsPosition {
  RIGHT_PANEL = 'right-panel',
  BOTTOM = 'bottom',
  HIDDEN = 'hidden',
}

interface RecordDetailConfig {
  layout: RecordDetailLayout;
  headTitleField: string;
  headSubLineFields: string[];
  rowTailFields?: string[]; // Chỉ cho Head Detail
  column1Fields?: string[]; // Chỉ cho Two Column
  column2Fields?: string[]; // Chỉ cho Two Column
  commentsPosition: CommentsPosition;
}
```

## 3. Component React (tóm tắt)

Component cho phép chọn layout, cấu hình các trường hiển thị, và preview thời gian thực.

## 4. Code gốc (Blade Template)

```javascript
static populateRecordDetailFields() {
    const fields = States.currentTable.config.fields || [];
    // Populate dropdowns và multi-select với Select2
    const detailConfig = States.currentTable.config.recordDetailConfig || {};
    // Set giá trị hiện tại
    this.toggleRecordDetailConfig();
}
```

Xem file đầy đủ tại `/docs/06-detail-config.md` để biết chi tiết implementation.
