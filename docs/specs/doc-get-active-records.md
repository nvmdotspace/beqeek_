### **Mô tả API**

**Endpoint:** `POST /api/workspaces/{workspaceId}/workflow/get/active_tables/{tableId}/records`

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

Hệ thống lọc mạnh mẽ dựa trên thư viện `AlchemistRestfulApi`. Cú pháp chung là `filtering[group][field][operator]=value`.

#### **Các Nhóm Lọc (Filtering Groups)**

| Nhóm                       | Kiểu dữ liệu | Cú pháp ví dụ                                      | Mô tả                                                                                                                                |
| :------------------------- | :----------- | :------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `id`                       | mixed        | `filtering[id][in]=rec_1,rec_2`                    | Lọc theo ID bản ghi. Hỗ trợ toán tử `eq`, `in`.                                                                                      |
| `fulltext`                 | string       | `filtering[fulltext][eq]=search term`              | Tìm kiếm toàn văn bản (full-text search). Hỗ trợ toán tử `eq`.                                                                       |
| `record`                   | mixed        | `filtering[record][status][eq]=active`             | Lọc trên các trường dữ liệu tùy chỉnh của bản ghi. Các toán tử hỗ trợ phụ thuộc vào kiểu dữ liệu của trường (xem chi tiết bên dưới). |
| `valueUpdatedAt`           | datetime     | `filtering[valueUpdatedAt][status][gt]=...`        | Lọc theo thời gian cập nhật của một trường cụ thể. Áp dụng cho các trường kiểu lựa chọn (select, list, checkbox).                    |
| `historicalValueUpdatedAt` | datetime     | `filtering[historicalValueUpdatedAt][...][gt]=...` | Lọc theo thời gian cập nhật giá trị lịch sử của một trường. Áp dụng cho các trường kiểu lựa chọn đơn (select one).                   |
| `historicalValue`          | mixed        | `filtering[historicalValue][eq]=...`               | Lọc theo giá trị lịch sử. Hỗ trợ toán tử `eq`.                                                                                       |

#### **Chi tiết Lọc theo Trường Dữ liệu (nhóm `record`)**

Các toán tử (`operator`) có sẵn cho nhóm `record` phụ thuộc vào kiểu mã hóa của trường trong cấu hình hệ thống.

| Kiểu Mã hóa (tương ứng với `CommonUtils` class) | Toán tử (`operator`) được hỗ trợ                               |
| :---------------------------------------------- | :------------------------------------------------------------- |
| `encryptFields` (AES-256 CBC)                   | `eq`, `ne`                                                     |
| `opeEncryptFields` (OPE)                        | `eq`, `ne`, `lt`, `gt`, `lte`, `gte`, `between`, `not_between` |
| `hashEncryptFields` (HMAC-SHA256)               | `eq`, `ne`, `in`, `not_in`                                     |

#### **Chi tiết Lọc theo Thời gian Cập nhật (nhóm `valueUpdatedAt` & `historicalValueUpdatedAt`)**

- **Toán tử hỗ trợ:** `eq`, `ne`, `lt`, `gt`, `lte`, `gte`, `between`, `not_between`.
- **Giá trị:** Giá trị phải là một timestamp hoặc định dạng ngày giờ hợp lệ (ví dụ: `2025-10-22 12:00:00`).

**4. Nhóm (Grouping):**

| Tên     | Kiểu   | Mô tả                        |
| :------ | :----- | :--------------------------- |
| `group` | string | Tên trường cần nhóm kết quả. |

---

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
