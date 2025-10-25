# Tính năng: Cấu hình Active Table

## Mục tiêu nghiệp vụ
- Cho phép định nghĩa bảng workflow (Active Table) làm nguồn dữ liệu trung tâm cho quy trình tự động hóa.
- Hỗ trợ tạo/sửa cấu trúc bảng, bao gồm metadata, schema trường, cài đặt mã hóa (E2EE) và liên kết workflow.
- Cung cấp công cụ quản trị (v1 và v2) để người dùng phi kỹ thuật vẫn cấu hình được bảng phức tạp.

## Luồng tính năng và trải nghiệm người dùng
- Giao diện cấu hình thể hiện danh sách Active Table của workspace kèm trạng thái triển khai, workgroup liên kết, số bản ghi và mô tả tóm tắt.
- Form tạo hoặc chỉnh sửa cho phép thiết lập thông tin chung (`tableName`, `tableCode`, `description`), phân nhóm và các tùy chọn hiển thị.
- Người dùng định nghĩa schema trường với kiểu dữ liệu, ràng buộc, cờ mã hóa và có thể sắp xếp lại thứ tự bằng thao tác kéo thả.
- Khi bật mã hóa đầu cuối, khóa được lưu cục bộ và không truyền lên máy chủ; cần hướng dẫn người dùng sao lưu để tránh mất dữ liệu.
- Bảng metadata hỗ trợ cấu hình cột hiển thị, thứ tự và loại trình bày phục vụ module quản lý bản ghi; danh sách cũng có quick action như triển khai hoặc mở record view.

## API chính trong `public/swagger-html-module.yaml`
- `POST /api/workspace/{workspaceId}/workflow/get/active_tables` (tag **Active Tables**): trả về danh sách bảng với hỗ trợ filter/paging.
- `POST /api/workspace/{workspaceId}/workflow/get/active_tables/{tableId}`: lấy chi tiết cấu hình bảng, bao gồm schema và config.
- `POST /api/workspace/{workspaceId}/workflow/post/active_tables`: tạo bảng mới với `ActiveTableMutationRequest` (chứa `config`, `metadata`, `workGroupId`).
- `POST /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}`: cập nhật bảng, UI đảm bảo không gửi `encryptionKey` khi E2EE bật.
- `POST /api/workspace/{workspaceId}/workflow/delete/active_tables/{tableId}`: xóa bảng.

## Ghi chú triển khai & kinh nghiệm
- Khả năng mã hóa đầu cuối đòi hỏi đồng bộ khóa giữa giao diện cấu hình và module bản ghi; nên cung cấp luồng backup/restore đầy đủ.
- Các field phức tạp (tiền tệ, tệp đính kèm, quan hệ) cần mapping rõ ràng với backend; nên duy trì bộ constants và validator chung.
- Giao diện quản trị dùng nhiều thành phần tương tác; khi đóng gói production cần tối ưu tải tài nguyên và caching để cải thiện hiệu năng.
- Trong môi trường sandbox, nếu gọi API thất bại nên hiển thị thông báo thay vì khóa toàn bộ giao diện để người dùng xử lý lại.

## Khuyến nghị kiểm thử
- Tạo bảng mới với nhiều kiểu field (text, number, date, select) và xác minh config phản ánh đúng khi mở lại form.
- Bật tắt mã hóa E2EE, nhập key tùy chỉnh rồi reload trang để chắc chắn key lấy từ localStorage.
- Cập nhật bảng đã có record và theo dõi backend phản hồi (đặc biệt khi thay đổi schema) xem UI hiển thị cảnh báo tương ứng.
- Thử xóa bảng đang được workflow unit sử dụng để kiểm tra backend trả lỗi và UI không bị treo.
