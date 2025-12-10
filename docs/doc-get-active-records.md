### **Mô tả API**

**Endpoint:** `POST /api/workspace/{workspaceId}/workflow/get/active_tables/{tableId}/records`

**Method:** `POST`

**Mô tả:** Lấy danh sách các bản ghi từ một bảng dữ liệu động (`ActiveTable`). Hỗ trợ phân trang (offset hoặc cursor), lọc theo nhiều điều kiện và nhóm kết quả. Dữ liệu bản ghi được mã hóa đầu cuối (E2EE) hoặc mã hóa phía máy chủ, tùy thuộc vào cấu hình bảng.

**Tags:** `Active Records`

---

### **Tham số (Parameters)**

#### **Path Parameters**

| Tên           | Kiểu   | Bắt buộc | Mô tả                                             |
| :------------ | :----- | :------- | :------------------------------------------------ |
| `workspaceId` | string | Có       | ID của không gian làm việc (workspace).           |
| `tableId`     | string | Có       | ID của bảng dữ liệu (`ActiveTable`) cần truy vấn. |

#### **Query Parameters**

Endpoint này hỗ trợ hai kiểu phân trang: **offset-based** (mặc định) và **cursor-based**.

**1. Phân trang Offset-based:**

| Tên      | Kiểu    | Mặc định | Mô tả                                                     |
| :------- | :------ | :------- | :-------------------------------------------------------- |
| `limit`  | integer | 1000     | Số lượng bản ghi tối đa trả về trong một lần gọi.         |
| `offset` | integer | 0        | Vị trí bắt đầu lấy bản ghi (bỏ qua `n` bản ghi đầu tiên). |

**2. Phân trang Cursor-based:**

Để sử dụng, cần truyền `paging=cursor`.

| Tên         | Kiểu    | Mặc định | Mô tả                                                                     |
| :---------- | :------ | :------- | :------------------------------------------------------------------------ |
| `paging`    | string  | (none)   | Đặt giá trị là `cursor` để bật chế độ phân trang cursor.                  |
| `next_id`   | string  | (none)   | ID của bản ghi cuối cùng từ trang trước để lấy trang tiếp theo.           |
| `direction` | string  | `asc`    | Hướng sắp xếp theo ID. Chấp nhận `asc` (tăng dần) hoặc `desc` (giảm dần). |
| `limit`     | integer | 1000     | Số lượng bản ghi tối đa trả về.                                           |

**3. Lọc (Filtering):**

Hệ thống lọc mạnh mẽ dựa trên thư viện `AlchemistRestfulApi`. Cú pháp chung là `filtering[group][field:operator]=value`. (`[group]` là tuỳ chọn; `:operator` cũng là tuỳ chọn, khi khuyết thiếu sẽ api server sẽ hiểu là `eq`)

#### **Các Nhóm Lọc (Filtering Groups)**

| Nhóm                       | Kiểu dữ liệu | Cú pháp ví dụ                                                                                                                                           | Mô tả                                                                                                                                |
| :------------------------- | :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| `id`                       | mixed        | `filtering[id:in][]=732878538910205329`                                                                                                                 | Lọc theo ID bản ghi. Hỗ trợ toán tử `eq`, `in`.                                                                                      |
| `fulltext`                 | string       | `filtering[fulltext]=ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb 3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d` | Tìm kiếm toàn văn bản (full-text search). Hỗ trợ toán tử `eq`.                                                                       |
| `record`                   | mixed        | `filtering[record][status:eq]=20bc534fb1cdf23178878ddbf795f550f76eb149475ec0b6d3eea85194c81322`                                                         | Lọc trên các trường dữ liệu tùy chỉnh của bản ghi. Các toán tử hỗ trợ phụ thuộc vào kiểu dữ liệu của trường (xem chi tiết bên dưới). |
| `valueUpdatedAt`           | datetime     | `filtering[valueUpdatedAt][status:gt]={encryptedValue}`                                                                                                 | Lọc theo thời gian cập nhật của một trường cụ thể. Áp dụng cho các trường kiểu lựa chọn (select, list, checkbox).                    |
| `historicalValueUpdatedAt` | datetime     | `filtering[historicalValueUpdatedAt][status:gt]={encryptedValue}`                                                                                       | Lọc theo thời gian cập nhật giá trị lịch sử của một trường. Áp dụng cho các trường kiểu lựa chọn đơn (select one).                   |
| `historicalValue`          | mixed        | `filtering[historicalValue][eq]=20bc534fb1cdf23178878ddbf795f550f76eb149475ec0b6d3eea85194c81322`                                                       | Lọc theo giá trị lịch sử (dùng để bổ trợ cho `historicalValueUpdatedAt`). Hỗ trợ toán tử `eq`.                                       |

**Lưu ý về Giá trị Lọc khi có Mã hóa (E2EE):**

Vì bảng được bật mã hóa đầu cuối, giá trị (`value`) bạn truyền vào để lọc cần được xử lý đặc biệt phía client trước khi gửi lên server:

- **Nhóm `fulltext`:**
  - Giá trị phải là **hash của từ khóa** (keyword hash; code tham chiếu trong [active-table-records.blade.php](resources/views/html-module/active-table-records.blade.php): `CommonUtils.hashKeyword(query, States.currentTable?.config?.encryptionKey).join(' ')`).

- **Nhóm `record`:**
  - **Trường hợp 1: Toán tử so sánh bằng (`eq`, `ne`, `in`, `not_in`)**
    - Áp dụng cho mọi kiểu trường (`encryptFields`, `opeEncryptFields`, `hashEncryptFields`).
    - Giá trị truyền vào phải là **hash của giá trị** (value hash).
  - **Trường hợp 2: Toán tử so sánh thứ tự (`lt`, `gt`, `lte`, `gte`, `between`, `not_between`)**
    - Chỉ áp dụng cho các trường `opeEncryptFields`.
    - Giá trị truyền vào phải là **dữ liệu đã được mã hóa** (encrypted value).

**Lưu ý về Lọc các Trường Dữ liệu Không Mã hóa (Unencrypted Fields):**

Đối với các trường dữ liệu không được mã hóa như `SELECT_LIST_RECORD`, `SELECT_ONE_RECORD`, `SELECT_ONE_WORKSPACE_USER`, `SELECT_LIST_WORKSPACE_USER`:

- Dữ liệu truyền lên để lọc là **ID thô (raw ID)** của bản ghi hoặc người dùng.
- Các toán tử được hỗ trợ: `eq`, `ne`, `in`, `not_in`.

#### **Chi tiết Lọc theo Trường Dữ liệu (nhóm `record`)**

Các toán tử (`operator`) có sẵn cho nhóm `record` phụ thuộc vào kiểu mã hóa của trường trong cấu hình hệ thống.

| Kiểu Mã hóa (tương ứng với `CommonUtils` class) | Toán tử (`operator`) được hỗ trợ                               |
| :---------------------------------------------- | :------------------------------------------------------------- |
| `encryptFields` (AES-256 CBC)                   | `eq`, `ne`                                                     |
| `opeEncryptFields` (OPE)                        | `eq`, `ne`, `lt`, `gt`, `lte`, `gte`, `between`, `not_between` |
| `hashEncryptFields` (HMAC-SHA256)               | `eq`, `ne`, `in`, `not_in`                                     |

#### **Chi tiết Lọc theo Thời gian Cập nhật (nhóm `valueUpdatedAt` & `historicalValueUpdatedAt`)**

- **Toán tử hỗ trợ:** `eq`, `ne`, `lt`, `gt`, `lte`, `gte`, `between`, `not_between`.
- **Giá trị:** Giá trị phải là định dạng ngày giờ hợp lệ (ví dụ: `2025-10-22 12:00:00`).
- **Lưu ý:** Khi lọc theo `historicalValueUpdatedAt`, bạn cần cung cấp giá trị lịch sử (historicalValue) của trường đó.

#### **Phân biệt `valueUpdatedAt` và `historicalValueUpdatedAt`**

Hai nhóm lọc này đều liên quan đến thời gian cập nhật của một trường, nhưng chúng có mục đích và cách sử dụng khác nhau:

- **`valueUpdatedAt`**:
  - **Tác dụng:** Lọc các bản ghi dựa trên thời điểm **giá trị hiện tại** của một trường được cập nhật lần cuối.
  - **Áp dụng cho:** Các trường có thể chọn một hoặc nhiều giá trị (ví dụ: `SELECT_ONE`, `SELECT_ONE_RECORD`, `SELECT_ONE_WORKSPACE_USER`, `CHECKBOX_LIST`, `SELECT_LIST`, `SELECT_LIST_RECORD`, `SELECT_LIST_WORKSPACE_USER`).
  - **Mục tiêu:** Tìm các bản ghi mà giá trị của một trường cụ thể đã được thay đổi trong một khoảng thời gian nhất định (ví dụ: "Tìm tất cả các công việc có trường `status` được cập nhật trong 24 giờ qua").
  - **Ví dụ:** Bạn muốn tìm các bản ghi mà trường `priority` (độ ưu tiên) được thay đổi gần đây.
    ```json
    "filtering": {
        "valueUpdatedAt": {
            "priority:gt": "2025-12-04 00:00:00"
        }
    }
    ```
    Yêu cầu này sẽ trả về tất cả các bản ghi có trường `priority` được cập nhật sau nửa đêm ngày 4 tháng 12, bất kể giá trị trước đó là gì.

- **`historicalValueUpdatedAt`**:
  - **Tác dụng:** Lọc các bản ghi dựa trên thời điểm một trường được thay đổi **khỏi một giá trị cũ cụ thể (giá trị lịch sử)**.
  - **Áp dụng cho:** Chỉ hỗ trợ các trường (`SELECT_ONE`, `SELECT_ONE_RECORD`, `SELECT_ONE_WORKSPACE_USER`) được theo dõi lịch sử.
  - **Mục tiêu:** Tìm các bản ghi đã từng có một giá trị nhất định và được thay đổi sang giá trị đó vào một thời điểm cụ thể (ví dụ: "Tìm tất cả các công việc đã từng ở trạng thái `Pending` và đã được chuyển sang trạng thái này sau ngày 1 tháng 12").
  - **Lưu ý quan trọng:** Khi sử dụng `historicalValueUpdatedAt`, bạn **bắt buộc** phải sử dụng kèm bộ lọc `historicalValue` để chỉ định giá trị lịch sử mà bạn muốn truy vấn.
  - **Ví dụ:** Để tìm các bản ghi mà trường `status` **từng là** `Pending` và đã được cập nhật sang giá trị này sau ngày 1 tháng 12.
    ```json
    "filtering": {
        "historicalValue": "{hash_của_giá_trị_Pending}",
        "historicalValueUpdatedAt": {
            "status:gt": "2025-12-01 00:00:00"
        }
    }
    ```

**4. Nhóm (Grouping):**

| Tên     | Kiểu   | Mô tả                        |
| :------ | :----- | :--------------------------- |
| `group` | string | Tên trường cần nhóm kết quả. |

---

#### **Ví dụ Payload Lọc (Filtering Payload Example)**

**Lọc theo fulltext:**

```json
{
  "paging": "cursor",
  "filtering": {
    "fulltext": "6f6dcb309d226a807cb715f9bdc515e8a635c6bd3f2d2c82fa5716820e147549 3e1517251c4588d47dfd8ab5f9169729102b13eb162e5607aeb943cfcfa5026e"
  },
  "next_id": null,
  "direction": "desc",
  "limit": 5
}
```

**Lọc trường không mã hóa (assignee, SELECT_ONE_WORKSPACE_USER, eq):**

```json
{
  "paging": "cursor",
  "filtering": {
    "record": {
      "assignee": "806145710083801089"
    }
  },
  "next_id": null,
  "direction": "desc",
  "limit": 5
}
```

**Ví dụ lọc trường `hashEncryptFields` (matrix_quadrant, SELECT_ONE, eq):**

```json
{
  "paging": "cursor",
  "filtering": {
    "record": {
      "matrix_quadrant": "1eb066999cbe576bef681901f200e637ee8a9e3c02b29ebbff3738a59676f52c"
    }
  },
  "next_id": null,
  "direction": "desc",
  "limit": 5
}
```

### **Cấu trúc Phản hồi (Responses)**

#### **Thành công: `200 OK`**

```json
{
  "data": [
    {
      "id": "1234567890",
      "record": {
        "field_name_1": "encrypted_value_1",
        "field_name_2": "hashed_value_2"
      },
      "createdBy": "user_id_1",
      "updatedBy": "user_id_2",
      "createdAt": "2025-10-22 10:00:00",
      "updatedAt": "2025-10-22 10:05:00",
      "valueUpdatedAt": {
        "field_name_1": "2025-10-22 10:01:00"
      },
      "relatedUserIds": ["user_id_3"],
      "assignedUserIds": ["user_id_4"],
      "record_hashes": {
        "field_name_1": "hash_of_encrypted_value_1"
      },
      "hashed_keywords": ["hashed_token_1", "hashed_token_2"],
      "permissions": {
        "access": true,
        "update": true
      }
    }
  ],
  "next_id": null,
  "previous_id": "1234567890"
}
```

- `data`: Mảng chứa các đối tượng bản ghi.
  - Mỗi đối tượng chứa dữ liệu của bản ghi (`id`, `record`, `created_at`...) và thông tin quyền (`permissions`) của người dùng hiện tại trên bản ghi đó.
- `next_id`: ID của bản ghi tiếp theo, dùng cho phân trang cursor. Trả về `null` nếu là trang cuối.
- `previous_id`: ID của bản ghi trước đó, dùng cho phân trang cursor. Trả về `null` nếu là trang đầu.

#### **Lỗi**

- **`400 Bad Request`**: Yêu cầu không hợp lệ, hoặc người dùng không có quyền xem bản ghi trong bảng này.
  ```json
  {
    "message": "Bạn không có quyền xem bản ghi trong bảng này"
  }
  ```
- **`401 Unauthorized`**: Người dùng chưa xác thực.
- **`404 Not Found`**: Không tìm thấy `workspaceId` hoặc `tableId` được cung cấp.
