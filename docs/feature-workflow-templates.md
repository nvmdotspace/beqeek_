# Tính năng: Thư viện Workflow Template

## Mục tiêu nghiệp vụ
- Cung cấp kho template quy trình mẫu để người dùng khởi tạo workflow nhanh chóng.
- Cho phép xem trước nội dung, tài liệu hướng dẫn và lựa chọn những phần cấu hình phù hợp.
- Hỗ trợ áp dụng template trực tiếp vào workspace (deploy một phần YAML hoặc toàn bộ).

## Luồng tính năng và trải nghiệm người dùng
- Giao diện thư viện tải danh sách template từ dịch vụ trung tâm, nhóm theo category và hiển thị dưới dạng accordion để dễ duyệt.
- Panel preview cho phép đọc mô tả chi tiết, xem nội dung YAML và cấu trúc workflow trước khi quyết định áp dụng.
- Người dùng chọn những khối YAML cần thiết bằng checkbox để chỉ import phần cấu hình phù hợp với workspace.
- Khi áp dụng template, popup xác nhận thu thập tên workflow mục tiêu và hiển thị kết quả triển khai sau khi gọi API.

## API/liên kết liên quan
- API externals (không nằm trong `swagger-html-module.yaml`):
  - `GET https://app.o1erp.com/api/templates`: trả về danh sách template (có category, mô tả, YAML kèm hướng dẫn).
  - `POST https://app.o1erp.com/api/workspace/{workspaceId}/workflow/template_applies`: áp dụng template, payload gồm `workflowName`, danh sách `files` (YAML).
- Module sử dụng renderer Markdown để hiển thị mô tả template và hướng dẫn triển khai.

## Ghi chú triển khai & kinh nghiệm
- Vì gọi API ngoài domain, cần cấu hình CORS và xử lý lỗi mạng (hiện UI mới log console, nên bổ sung thông báo người dùng).
- Template có thể rất lớn; cân nhắc lazy-load YAML khi người dùng chọn thay vì tải hết.
- Khi áp dụng template, nên cung cấp log chi tiết (file nào thành công/thất bại) để dễ debug.
- Bảo mật: kiểm tra template trước khi áp dụng để tránh chạy script độc hại; có thể hiển thị diff cho người dùng xem.

## Khuyến nghị kiểm thử
- Tải danh sách template ở môi trường offline để chắc chắn UI hiển thị thông báo lỗi mạng.
- Chọn nhiều YAML và áp dụng, kiểm tra backend tạo workflow tương ứng.
- Nhập workflow name bị trùng để xem backend trả lỗi gì và UI truyền đạt ra sao.
- Kiểm tra các category khác nhau, đảm bảo accordion và highlight template hoạt động đúng.
