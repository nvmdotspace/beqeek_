# Phân tích: Ordering/Positioning trong Kanban Board

## Kết luận chính

**Kanban board hiện tại KHÔNG hỗ trợ sắp xếp thứ tự card trong cùng một column.**

Cards được hiển thị theo thứ tự fetch về từ database, dựa vào `direction` (`asc` hoặc `desc`) và KHÔNG có logic để user có thể tự sắp xếp/reorder cards trong column bằng drag & drop.

---

## Phân tích chi tiết

### 1. Không có field ordering trong database

**Tìm kiếm trong code**: Không có field nào như:

- `position`
- `offset`
- `order`
- `sequence`
- `index`
- `sort_order`

**Record structure** chỉ có:

```javascript
{
    id: "record_id",
    record: {
        // Các field của table (status, title, etc.)
        matrix_quadrant: "value",
        // ...
    },
    createdAt: "timestamp",
    updatedAt: "timestamp",
    valueUpdatedAt: { /* per-field timestamps */ },
    permissions: { /* permissions object */ }
}
```

**Không có field nào lưu vị trí của card trong column.**

---

### 2. API fetchRecords không hỗ trợ custom ordering

**Code location**: `TableAPI.fetchRecords()` (line ~1717)

```javascript
static async fetchRecords(table, filters = {}, nextId = null, direction = 'asc', limit = 1) {
    // ...
    const response = await CommonUtils.apiCall(
        `${API_PREFIX}/get/active_tables/${table.id}/records`,
        {
            paging: 'cursor',
            filtering: filtering,
            next_id: nextId,
            direction: direction,  // ⚠️ Chỉ có 'asc' hoặc 'desc'
            limit: limit
        },
        true
    );
}
```

**Direction parameter**:

- Chỉ có 2 giá trị: `'asc'` hoặc `'desc'`
- Apply cho toàn bộ records, không phải per-column
- Dựa vào `createdAt` hoặc `id` của record (server-side sorting)

**Không có**:

- Sorting theo field custom
- Sorting theo position/offset
- Per-column sorting

---

### 3. Render logic chỉ map theo thứ tự fetch

**Code location**: `KanbanView.renderKanbanBoard()` (line ~4857)

```javascript
const kanbanRecords = Object.fromEntries(
  await Promise.all(
    statusOptions.map(async (option) => {
      // Fetch records cho từng status
      const response = await RecordView.fetchRecords(
        States.currentTable,
        {
          ...States.currentRecordFilters,
          record: {
            ...States.currentRecordFilters.record,
            [statusField.name]: option.value, // ⚠️ Chỉ filter theo status
          },
        },
        currentPageId,
        direction, // 'asc' hoặc 'desc' global
        limit,
      );
      // ...
    }),
  ),
);
```

**Rendering cards** (line ~4890):

```javascript
${statusOptions.map(option => `
    <div class="kanban-column" data-status="${option.value}">
        <div class="kanban-column-content" data-status="${option.value}">
            ${kanbanRecords[option.value]?.records.map(record =>
                this.renderKanbanCard(record, ...)
            ).join('') || '<div class="kanban-empty">Không có bản ghi</div>'}
        </div>
    </div>
`).join('')}
```

**Vấn đề**:

- `.map()` iterate theo thứ tự trong array `records`
- Array này là kết quả fetch từ API, **không có custom ordering**
- Không có logic sort/reorder trước khi render

---

### 4. Drop event chỉ update status, không update position

**Code location**: `KanbanView.initDragAndDrop()` (line ~5016)

```javascript
column.addEventListener('drop', async (e) => {
  e.preventDefault();
  const recordId = e.dataTransfer.getData('text/plain');
  const newStatus = column.dataset.status;

  const card = document.querySelector(`.kanban-card[data-record-id="${recordId}"]`);
  const currentStatus = card.closest('.kanban-column').dataset.status;

  // Validate status change
  if (currentStatus === newStatus) {
    console.log('Thả trong cùng cột, huỷ thao tác.');
    return; // ⚠️ Nếu cùng column, không làm gì cả
  }

  // Move card UI
  const columnContent = column.querySelector('.kanban-column-content');
  columnContent.appendChild(card); // ⚠️ Append vào cuối, không quan tâm vị trí

  // Update API
  const data = {
    record: { [currentKanbanConfig.statusField]: newStatus },
    hashed_keywords: hashedKeywords,
  };
  await TableAPI.updateRecord(States.currentTable, recordId, data);
  // ⚠️ CHỈ update status field, KHÔNG update position
});
```

**Logic hiện tại**:

1. User drag card từ column A sang column B
2. Validate: `currentStatus !== newStatus`
3. Nếu **cùng column** → **Cancel, không làm gì**
4. Nếu **khác column**:
   - Update UI: `columnContent.appendChild(card)` → card xuất hiện ở **cuối column**
   - Call API: Chỉ update `status` field
   - **KHÔNG** update `position`/`offset`

---

## Cases được hỗ trợ và không được hỗ trợ

### ✅ Cases ĐƯỢC hỗ trợ

| #   | Case                       | Mô tả                              | Cách hoạt động                                          |
| --- | -------------------------- | ---------------------------------- | ------------------------------------------------------- |
| 1   | Drag card sang column khác | Di chuyển card giữa các trạng thái | Update `status` field, card xuất hiện ở cuối column mới |
| 2   | Filter records theo status | Hiển thị cards theo status         | Fetch records với filter `status = value`               |
| 3   | Pagination trong column    | Load thêm cards khi scroll         | Button "Tải thêm" fetch `nextPageId`                    |
| 4   | Sort global theo createdAt | Sắp xếp theo thời gian tạo         | `direction = 'asc'` hoặc `'desc'`                       |
| 5   | Filter theo date range     | Lọc theo thời gian update          | Date filter cho `valueUpdatedAt`                        |

### ❌ Cases KHÔNG được hỗ trợ

| #   | Case                                           | Mô tả                                           | Lý do                                                      |
| --- | ---------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| 1   | **Drag card trong cùng column để reorder**     | User muốn sắp xếp lại vị trí card trong column  | Drop event check `currentStatus === newStatus` → cancel    |
| 2   | **Lưu vị trí card sau khi reorder**            | Persist position của card trong column          | Không có field `position`/`offset` trong database          |
| 3   | **Drag card vào vị trí cụ thể (giữa 2 cards)** | User muốn insert card vào giữa, không phải cuối | `appendChild()` luôn thêm vào cuối                         |
| 4   | **Sort per-column**                            | Mỗi column có thể sort khác nhau                | API chỉ có global `direction`, không phải per-status       |
| 5   | **Manual reordering UI**                       | Nút up/down để di chuyển card                   | Không có UI và logic backend                               |
| 6   | **Persist order sau reload**                   | Order giữ nguyên khi refresh page               | Order phụ thuộc vào API response, không có state persisted |

---

## Cases thực tế có thể xảy ra

### Scenario 1: User muốn prioritize tasks trong "In Progress"

**Mong muốn**:

```
Column: In Progress
1. Task A (high priority)
2. Task B (medium priority)
3. Task C (low priority)
```

**Thực tế**:

- User drag Task C lên trên Task A
- ❌ **Không hoạt động**: Drop event detect `currentStatus === newStatus` → cancel
- Cards vẫn hiển thị theo thứ tự fetch từ DB (ví dụ theo `createdAt`)

**Workaround không tồn tại**:

- Không thể dùng field khác để sort (ví dụ priority field)
- Không có cách nào thay đổi thứ tự hiển thị

---

### Scenario 2: User muốn insert task vào giữa column

**Mong muốn**:

```
Column: To Do
1. Task A
2. [INSERT Task D here]  ← User drops Task D từ "Done"
3. Task B
4. Task C
```

**Thực tế**:

- User drag Task D từ "Done" sang "To Do"
- ✅ Status update thành công
- ❌ **Position không đúng**: Task D xuất hiện ở **cuối column**

```
Column: To Do
1. Task A
2. Task B
3. Task C
4. Task D  ← Xuất hiện ở đây thay vì giữa A và B
```

**Nguyên nhân**:

- Code dùng `columnContent.appendChild(card)` → luôn append vào cuối
- Không có logic detect drop position giữa các cards
- Không có field `position` để lưu vị trí

---

### Scenario 3: Team planning với manual ordering

**Mong muốn**:

```
Column: Sprint Backlog
1. User Story 1 (sprint priority 1)
2. User Story 2 (sprint priority 2)
3. User Story 3 (sprint priority 3)
→ Team thảo luận và reorder priorities
```

**Thực tế**:

- Team không thể reorder cards trong column
- Phải dùng workaround:
  - Tạo field "Priority" (number)
  - Manually edit priority value
  - Không có real-time visual reordering

---

### Scenario 4: Kanban refresh/reload

**Mong muốn**:

- User đã reorder cards trong column (nếu có feature)
- Refresh page → order giữ nguyên

**Thực tế hiện tại**:

- Refresh page → cards hiển thị theo `direction` global
- Nếu `direction = 'desc'` → cards mới tạo xuất hiện trên cùng
- Nếu `direction = 'asc'` → cards cũ xuất hiện trên cùng
- **Không có user-defined order**

---

### Scenario 5: Load more cards trong column

**Mong muốn**:

```
Column: In Progress (đã có 5 cards)
[Load more button]
→ 5 cards tiếp theo xuất hiện đúng thứ tự
```

**Thực tế**:

- Button "Tải thêm" fetch `nextPageId`
- Cards append vào cuối column
- ✅ **Hoạt động tốt** vì không yêu cầu custom ordering
- Order vẫn theo `direction` global

**Code location**: `KanbanView.loadMore()` (line ~5109)

```javascript
column.innerHTML += `${records.map(record =>
    renderKanbanCard(record, ...)
).join('')}`;
```

---

## So sánh với các Kanban tool khác

### Trello

**Hỗ trợ ordering**:

- ✅ Drag & drop trong cùng column để reorder
- ✅ Field `position` (float) trong database
- ✅ Persist order sau reload

**Implementation**:

```javascript
// Pseudo-code Trello-like
{
    id: "card_id",
    list_id: "column_id",
    position: 65535.5,  // Float position for flexible ordering
    // ...
}
```

### Jira

**Hỗ trợ ordering**:

- ✅ Drag & drop trong cùng column (rank)
- ✅ Field `rank` (custom algorithm - Lexorank)
- ✅ Per-user ordering (saved views)

### Notion

**Hỗ trợ ordering**:

- ✅ Manual reordering
- ✅ Multiple sort options per-column
- ✅ Persist per-user

### Beqeek (Current)

**Hỗ trợ ordering**:

- ❌ Không hỗ trợ reordering trong column
- ❌ Không có field position
- ⚠️ Chỉ có global `direction` (asc/desc theo createdAt)

---

## Đề xuất giải pháp (nếu cần implement)

### Option 1: Thêm field `position` (Simple)

**Database schema**:

```javascript
{
    id: "record_id",
    record: {
        status: "in_progress",
        position: 1000,  // Integer position within status
        // ...
    }
}
```

**Logic**:

1. Khi tạo record mới → `position = max(position) + 1000`
2. Khi drag & drop trong column → tính `position` giữa 2 cards
3. Fetch records → sort by `position ASC` trong mỗi status

**Pros**:

- Đơn giản
- Easy to implement

**Cons**:

- Cần migrate database
- Cần API endpoint mới để update position
- Position có thể conflict khi nhiều user cùng edit

---

### Option 2: Dùng Lexorank (Recommended)

**Lexorank algorithm**:

- Jira's solution
- String-based ranking: `"a"`, `"b"`, `"c"`, ...
- Insert giữa: `between("a", "c")` = `"b"`
- Không cần rebalance thường xuyên

**Example**:

```javascript
{
    id: "record_id",
    record: {
        status: "in_progress",
        rank: "0|hzzzzz:",  // Lexorank string
        // ...
    }
}
```

**Pros**:

- Scale tốt
- Không conflict
- Used by Jira (proven solution)

**Cons**:

- Phức tạp hơn
- Cần library implementation

---

### Option 3: Client-side only (Temporary fix)

**Concept**:

- Lưu order trong localStorage
- Chỉ apply cho current user
- Không persist khi thay device

**Pros**:

- Không cần backend changes
- Implement nhanh

**Cons**:

- Không đồng bộ giữa users
- Lost khi clear localStorage
- Không professional

---

## Code changes needed (nếu implement Option 1)

### 1. Database Migration

```sql
ALTER TABLE active_table_records
ADD COLUMN position INTEGER DEFAULT 1000;

CREATE INDEX idx_active_table_records_status_position
ON active_table_records(status, position);
```

### 2. API Changes

**Endpoint mới**:

```
PATCH /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}/records/{recordId}/position
```

**Payload**:

```json
{
  "position": 1500,
  "status": "in_progress"
}
```

### 3. Frontend Changes

**Drop event update** (line ~5016):

```javascript
column.addEventListener('drop', async (e) => {
  e.preventDefault();
  const recordId = e.dataTransfer.getData('text/plain');
  const newStatus = column.dataset.status;
  const dropY = e.clientY;

  // Calculate drop position
  const cards = Array.from(columnContent.querySelectorAll('.kanban-card'));
  let insertIndex = cards.length;

  for (let i = 0; i < cards.length; i++) {
    const cardRect = cards[i].getBoundingClientRect();
    if (dropY < cardRect.top + cardRect.height / 2) {
      insertIndex = i;
      break;
    }
  }

  // Calculate new position value
  const prevCard = cards[insertIndex - 1];
  const nextCard = cards[insertIndex];
  const prevPosition = prevCard ? parseInt(prevCard.dataset.position) : 0;
  const nextPosition = nextCard ? parseInt(nextCard.dataset.position) : prevPosition + 2000;
  const newPosition = Math.floor((prevPosition + nextPosition) / 2);

  // Insert card at correct position
  if (nextCard) {
    columnContent.insertBefore(card, nextCard);
  } else {
    columnContent.appendChild(card);
  }

  // Update API
  const data = {
    record: {
      [currentKanbanConfig.statusField]: newStatus,
      position: newPosition, // ← NEW
    },
    hashed_keywords: hashedKeywords,
  };
  await TableAPI.updateRecord(States.currentTable, recordId, data);
});
```

**Fetch records update**:

```javascript
const response = await RecordView.fetchRecords(
  States.currentTable,
  {
    ...States.currentRecordFilters,
    record: {
      ...States.currentRecordFilters.record,
      [statusField.name]: option.value,
    },
  },
  currentPageId,
  direction,
  limit,
  'position', // ← NEW: Sort field
);
```

**API call update**:

```javascript
const response = await CommonUtils.apiCall(
  `${API_PREFIX}/get/active_tables/${table.id}/records`,
  {
    paging: 'cursor',
    filtering: filtering,
    next_id: nextId,
    direction: direction,
    limit: limit,
    order_by: 'position', // ← NEW
  },
  true,
);
```

---

## Testing checklist (nếu implement)

- [ ] Drag card trong cùng column để reorder
- [ ] Drag card sang column khác
- [ ] Insert card vào giữa 2 cards khác
- [ ] Position được persist sau reload
- [ ] Load more cards giữ đúng order
- [ ] Multiple users không conflict position
- [ ] Migration chạy thành công
- [ ] Performance test với 1000+ cards
- [ ] Encryption key hoạt động với position field
- [ ] Record_hashes bao gồm position (nếu cần search)

---

## Kết luận

**Hiện tại**:

- Kanban board **KHÔNG hỗ trợ** ordering trong column
- Drag & drop **CHỈ** thay đổi status, không thay đổi position
- Cards hiển thị theo thứ tự fetch từ database (theo `createdAt` hoặc `id`)

**Workaround hiện tại**:

- Dùng `direction` global để sort tất cả columns theo `asc` hoặc `desc`
- Không có cách nào để user manually reorder cards

**Nếu cần implement**:

- Recommend: **Option 2 (Lexorank)** cho enterprise solution
- Quick fix: **Option 1 (Position field)** cho MVP
- Avoid: **Option 3 (Client-side only)** - không professional

---

**Related documents**:

- [Kanban Drag & Drop Flow](./kanban-drag-drop-flow.md)
- [API Payload Quick Reference](./kanban-api-payload-quick-ref.md)
- [Visual Flow Diagrams](./kanban-flow-diagrams.md)

**Last Updated**: 2025-11-03  
**Analysis based on**: `active-table-records.blade.php`
