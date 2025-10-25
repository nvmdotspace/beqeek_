# Tính năng: Quản lý Workflow Form

## Mục tiêu nghiệp vụ
- Xây dựng và quản trị các biểu mẫu thu thập dữ liệu trong quy trình workflow.
- Cho phép chỉnh sửa cấu trúc form (fields, validation, layout) và tái sử dụng trong nhiều unit.
- Hỗ trợ preview form và quản lý phiên bản để đảm bảo trải nghiệm người dùng cuối.

## Luồng tính năng và trải nghiệm người dùng
- Giao diện danh sách hiển thị toàn bộ form cùng trạng thái triển khai, lần chỉnh sửa cuối và bộ lọc tìm kiếm.
- Người dùng mở chi tiết để xem cấu hình JSON (schema) hoặc xem trước giao diện hiển thị thực tế trước khi phát hành.
- Form tạo/chỉnh sửa cung cấp trình soạn thảo cấu trúc (`layout`, `fields`, `validation`) kèm kiểm tra cú pháp JSON và hỗ trợ nhân bản form có sẵn.
- Trạng thái publish/deploy có thể thay đổi trực tiếp từ danh sách; khi phát hành sẽ gửi yêu cầu triển khai và cập nhật badge trạng thái.
- Danh sách workflow unit đang sử dụng form được hiển thị để cảnh báo rủi ro khi chỉnh sửa.

## API chính trong `public/swagger-html-module.yaml`
- `POST /api/workspace/{workspaceId}/workflow/get/workflow_forms` (tag **Workflow Forms**): trả về `WorkflowFormListResponse`.
- `POST /api/workspace/{workspaceId}/workflow/get/workflow_forms/{formId}`: lấy chi tiết, thường được bind vào editor.
- `POST /api/workspace/{workspaceId}/workflow/post/workflow_forms`: tạo form mới với payload `WorkflowFormMutationRequest` gồm `data` (schema), metadata.
- `POST /api/workspace/{workspaceId}/workflow/patch/workflow_forms/{formId}`: cập nhật form.
- `POST /api/workspace/{workspaceId}/workflow/delete/workflow_forms/{formId}`: xóa form.

## Ghi chú triển khai & kinh nghiệm
- Khi chỉnh sửa schema nên duy trì versioning để workflow chạy cũ không bị ảnh hưởng; có thể thêm trường `version` trong payload.
- Lưu ý đồng bộ `formSlug`/`code` để workflow unit tham chiếu ổn định.
- Preview form nên validate schema trước khi render để tránh crash và phải hiển thị lỗi rõ ràng nếu cấu trúc không hợp lệ.
- Nên có quyền phân biệt: người thiết kế form vs. người sử dụng form (đọc-only).

## Khuyến nghị kiểm thử
- Tạo form mới với nhiều trường và kiểm tra preview hiển thị đúng thứ tự/validate.
- Chỉnh sửa schema (ví dụ đổi label) và đảm bảo danh sách cập nhật ngay; đồng thời verify workflow unit vẫn truy cập form.
- Xóa form đang được workflow sử dụng để xem backend phản hồi; UI nên thông báo rõ ràng.
- Kiểm tra performance khi form có nhiều trường (50+) và đảm bảo editor không lag.
