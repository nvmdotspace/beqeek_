## Tài liệu về `FIRST_REFERENCE_RECORD`

### Giới thiệu

`FIRST_REFERENCE_RECORD` là một loại trường (field type) đặc biệt trong hệ thống, được thiết kế để hiển thị dữ liệu từ một bảng có liên quan (bảng tham chiếu). Đặc điểm chính của trường này là **chỉ đọc (read-only)**, nghĩa là người dùng không thể trực tiếp chỉnh sửa giá trị của nó thông qua giao diện.

Giá trị của trường này được tự động lấy từ bản ghi đầu tiên được tìm thấy trong một bảng khác mà có tham chiếu đến bản ghi hiện tại.

### Cơ chế hoạt động

1.  **Thiết lập liên kết ngược (Reverse Lookup):**
    - Giả sử chúng ta có hai bảng: `Bảng A` (bảng hiện tại) và `Bảng B` (bảng tham chiếu).
    - `FIRST_REFERENCE_RECORD` được định nghĩa là một trường trong `Bảng A`.
    - Trong `Bảng B`, phải có một trường (ví dụ: `field_X`) được cấu hình để lưu trữ ID của các bản ghi từ `Bảng A`. Đây là một liên kết "chọn một bản ghi" (select one record) từ `Bảng B` tới `Bảng A`.

2.  **Truy xuất dữ liệu:**
    - Khi một bản ghi trong `Bảng A` được hiển thị, hệ thống sẽ tìm kiếm trong `Bảng B`.
    - Nó sẽ tìm bản ghi **đầu tiên** trong `Bảng B` mà giá trị của `field_X` (được cấu hình là `referenceField`) khớp với ID của bản ghi hiện tại trong `Bảng A`.
    - Sau khi tìm thấy bản ghi đó trong `Bảng B`, hệ thống sẽ lấy giá trị từ một trường khác trong bản ghi đó (được cấu hình là `referenceLabelField`) để hiển thị làm giá trị cho trường `FIRST_REFERENCE_RECORD`.

### Ví dụ

- **Bảng `Đơn hàng` (Orders):** Bảng hiện tại, chứa các đơn hàng.
- **Bảng `Thanh toán` (Payments):** Bảng tham chiếu, chứa các lần thanh toán cho đơn hàng. Mỗi thanh toán sẽ có một trường `order_id` để liên kết với một đơn hàng cụ thể.

Nếu chúng ta thêm một trường `FIRST_REFERENCE_RECORD` vào bảng `Đơn hàng` với các cấu hình sau:

- **Reference Table:** `Thanh toán`
- **Reference Field:** `order_id`
- **Reference Label Field:** `payment_date` (ngày thanh toán)

=> Khi xem một đơn hàng, trường này sẽ hiển thị ngày thanh toán của **lần thanh toán đầu tiên** được tìm thấy cho đơn hàng đó.

### Truy vấn API

Để tối ưu hiệu suất, hệ thống không truy vấn từng bản ghi tham chiếu một cách riêng lẻ. Thay vào đó, nó thực hiện các truy vấn hàng loạt (batch queries) để lấy tất cả các dữ liệu cần thiết trong một vài lệnh gọi API.

#### Chi tiết logic truy vấn API

Logic cốt lõi thực hiện việc truy vấn API nằm trong hàm `RecordView.fetchBatchReferenceRecords`. Hàm này lặp qua một map (`tableIdMap`) chứa thông tin về các bảng và các bản ghi cần được truy vấn.

```javascript
// Vòng lặp qua mỗi tableId cần truy vấn
for (const [tableId, { recordIds, filtering = {}, group }] of Object.entries(tableIdMap)) {
  // 1. Xây dựng tham số truy vấn (payload)
  const apiParams = {
    filtering: { record: { ...filtering } },
    limit: limit,
    offset: offset,
  };

  // Thêm điều kiện tìm kiếm nếu có
  if (search) {
    apiParams.filtering.record.search = search;
  }

  // Thêm điều kiện group nếu có - ĐÃ CẬP NHẬT: group được set bằng field.referenceField
  if (group) {
    apiParams.group = group;
  }

  // Thêm filter theo danh sách ID (dùng cho SELECT_ONE_RECORD, SELECT_LIST_RECORD, FIRST_REFERENCE_RECORD)
  // Đối với FIRST_REFERENCE_RECORD, recordIds thường rỗng vì lọc dựa trên referenceField
  // và `id:in` được áp dụng cho `{field.referenceField}:in`
  if (recordIds?.length > 0) {
    apiParams.filtering.record['id:in'] = recordIds;
  }

  // ... (phần logic về cache) ...

  // 2. Gọi API bằng hàm CommonUtils.apiCall
  console.log(`Fetching records for table ${tableId} with params:`, apiParams);
  const response = await CommonUtils.apiCall(
    // Endpoint của API
    `${API_PREFIX}/get/active_tables/${tableId}/records`,
    // Dữ liệu gửi đi (payload)
    apiParams,
    // isGetAction = true (sử dụng phương thức POST nhưng để lấy dữ liệu)
    true,
  );

  // 3. Xử lý kết quả trả về
  results[tableId] = (response.data || []).filter((rec) => rec && rec.id != null);

  // ... (lưu vào cache) ...
}
```

**Giải thích chi tiết:**

1.  **Xây dựng `apiParams`**:
    - Đối tượng `apiParams` chính là payload sẽ được gửi trong body của request.
    - Nó nhận các điều kiện lọc (`filtering`) đã được chuẩn bị từ trước. Đối với `FIRST_REFERENCE_RECORD`, điều kiện lọc quan trọng là `${field.referenceField}:in` được xây dựng trong `collectReferenceFieldMap` để tìm các bản ghi trong bảng tham chiếu có trường liên kết khớp với ID của bản ghi hiện tại.
    - **Tham số `group`:** Đặc biệt, đối với `FIRST_REFERENCE_RECORD`, trường `group` trong `apiParams` sẽ được gán bằng `field.referenceField` (tên trường tham chiếu ngược trong bảng B). Điều này báo hiệu cho backend API rằng kết quả nên được nhóm theo trường này.
    - Nó cũng có thể nhận thêm các tham số như `search`, `limit` và `offset` cho phân trang.

2.  **Gọi `CommonUtils.apiCall`**:
    - Đây là một hàm tiện ích chung để thực hiện các lệnh gọi API.
    - **Endpoint**: Được xây dựng động dựa trên `tableId` của bảng tham chiếu: `${API_PREFIX}/get/active_tables/${tableId}/records`.
    - **Payload**: Chính là đối tượng `apiParams` đã được xây dựng.
    - `isGetAction: true`: Tham số này cho `CommonUtils.apiCall` biết rằng mặc dù request dùng phương thức `POST` (để có thể gửi payload phức tạp), nhưng mục đích là để lấy dữ liệu (`GET`).

3.  **Xử lý kết quả**:
    - Kết quả trả về từ API (`response.data`) được gán vào đối tượng `results` theo `tableId` tương ứng. Các bản ghi không hợp lệ (null hoặc thiếu ID) sẽ được lọc bỏ.
    - Kết quả này sau đó được lưu vào cache (`RecordView.referenceCache`) để tránh các truy vấn lặp lại.
    - **Tầm quan trọng của `group`:** Khi API trả về dữ liệu được nhóm theo `field.referenceField`, frontend có thể dễ dàng lấy "bản ghi đầu tiên" cho mỗi ID bản ghi chính bằng cách lấy phần tử đầu tiên của mỗi nhóm (hoặc tìm kiếm trực tiếp với `find` như trong `parseDisplayValue`).

#### Chế độ xem danh sách (List View)

1.  **Bước 1: Lấy danh sách bản ghi chính**
    Hệ thống gửi yêu cầu để lấy danh sách các bản ghi từ bảng hiện tại (ví dụ: `Bảng A`).

2.  **Bước 2: Gom nhóm và truy vấn hàng loạt**
    - Hàm `RecordView.collectReferenceFieldMap` sẽ duyệt qua các trường, nếu gặp `FIRST_REFERENCE_RECORD`, nó sẽ thu thập tất cả ID của các bản ghi từ `Bảng A` hiện có trong danh sách.
    - Nó tạo ra một đối tượng `{referenceTableId: { ... group: field.referenceField } }` và truyền vào `fetchBatchReferenceRecords`.
    - Hàm `fetchBatchReferenceRecords` sẽ gửi một yêu cầu API đến bảng tham chiếu (`Bảng B`), bao gồm:
      - `filtering`: Chứa điều kiện lọc `record["{referenceField}:in"]` với tất cả các ID từ `Bảng A`.
      - `group`: Được đặt là `field.referenceField` (tên trường liên kết ngược).
    - **Endpoint:** `POST /api/workspace/{workspaceId}/workflow/get/active_tables/{referenceTableId}/records`
    - **Payload ví dụ:**
      ```json
      {
        "filtering": {
          "record": {
            "order_id:in": ["order_id_1", "order_id_2", "..."]
          }
        },
        "group": "order_id"
      }
      ```
      Trong đó:
      - `{referenceTableId}`: ID của bảng tham chiếu (ví dụ: `Bảng Thanh toán`).
      - `order_id`: Tên của trường trong `Bảng Thanh toán` dùng để liên kết ngược về `Bảng Đơn hàng`.
      - `["order_id_1", "order_id_2", ...]` là mảng chứa ID của tất cả các đơn hàng đang hiển thị.

3.  **Bước 3: Xử lý ở Client-side**
    - Frontend nhận về một danh sách các bản ghi từ `Bảng B` (có thể đã được nhóm hoặc không, tùy thuộc vào cách backend xử lý tham số `group`).
    - Hàm `RecordBaseView.parseDisplayValue` sẽ tìm bản ghi đầu tiên trong dữ liệu `referenceRecords` đã cache, nơi `refRecord.record[field.referenceField]` khớp với `record.id` của bản ghi hiện tại.

#### Chế độ xem chi tiết (Detail View)

Quy trình tương tự như xem danh sách nhưng đơn giản hơn vì chỉ áp dụng cho một bản ghi duy nhất.

1.  **Bước 1: Lấy bản ghi chính**
    Hệ thống lấy chi tiết bản ghi đang xem từ `Bảng A`.

2.  **Bước 2: Truy vấn bản ghi tham chiếu**
    Hệ thống gửi yêu cầu đến bảng tham chiếu (`Bảng B`).

    **Endpoint:** `POST /api/workspace/{workspaceId}/workflow/get/active_tables/{referenceTableId}/records`

    **Payload:**

    ```json
    {
      "filtering": {
        "record": {
          "{referenceField}:in": ["current_record_id"]
        }
      },
      "group": "{referenceField}",
      "limit": 1
    }
    ```

    Trong đó `current_record_id` là ID của bản ghi trong `Bảng A` đang được xem. `group` được đặt là `{field.referenceField}` và `limit: 1` giúp tối ưu vì chúng ta chỉ cần bản ghi đầu tiên của nhóm.

3.  **Bước 3: Hiển thị**
    Hệ thống lấy bản ghi đầu tiên từ kết quả trả về và hiển thị trường `referenceLabelField`.

### Đặc điểm chính

- **Chỉ đọc:** Không thể sửa trực tiếp.
- **Tự động:** Giá trị được hệ thống tự động truy xuất.
- **Quan hệ "Has-One" ngược:** Nó cho phép hiển thị thông tin từ một bản ghi liên quan (trong mối quan hệ một-nhiều) từ phía "một".
- **Lấy bản ghi đầu tiên:** Chỉ lấy dữ liệu từ bản ghi đầu tiên tìm thấy, được hỗ trợ bởi tham số `group` trong truy vấn API để backend tối ưu việc trả về bản ghi đại diện.
