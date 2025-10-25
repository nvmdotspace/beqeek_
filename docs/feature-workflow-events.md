# Tính năng: Quản lý Workflow Event

## Mục tiêu nghiệp vụ
- Định nghĩa các sự kiện (trigger) gắn với workflow unit như webhook, record change, lịch biểu.
- Cho phép cấu hình tham số nguồn sự kiện và handler để kết nối với Active Table hoặc dịch vụ bên ngoài.
- Hỗ trợ triển khai/hủy kích hoạt hàng loạt sự kiện khi thay đổi phiên bản workflow.

## Luồng tính năng và trải nghiệm người dùng
- Tab sự kiện trong workflow unit hiển thị danh sách trigger hiện có và trạng thái hoạt động của từng sự kiện.
- Khi tạo mới, người dùng chọn loại nguồn (webhook, lịch biểu, connector), nhập tham số cấu hình JSON và mô tả handler xử lý.
- Form nhập cung cấp trình soạn thảo JSON cùng kiểm tra cú pháp cơ bản để tránh gửi dữ liệu lỗi.
- Bộ hành động cho phép triển khai hoặc vô hiệu hóa nhiều sự kiện cùng lúc nhằm đồng bộ với phiên bản workflow.
- Khi chọn một sự kiện, giao diện hiển thị chi tiết payload mẫu, mapping tới Active Table và thông tin trạng thái gần nhất.

## API chính trong `public/swagger-html-module.yaml`
- `POST /api/workspace/{workspaceId}/workflow/get/workflow_events` (tag **Workflow Events**): trả về danh sách sự kiện, hỗ trợ filter theo `workflowUnit`.
- `POST /api/workspace/{workspaceId}/workflow/get/workflow_events/{eventId}`: lấy chi tiết một event.
- `POST /api/workspace/{workspaceId}/workflow/post/workflow_events`: tạo event mới với `WorkflowEventMutationRequest` (bắt buộc `eventName`).
- `POST /api/workspace/{workspaceId}/workflow/patch/workflow_events/{eventId}`: cập nhật event.
- `POST /api/workspace/{workspaceId}/workflow/delete/workflow_events/{eventId}`: xóa event.
- `POST /api/workspace/{workspaceId}/workflow/post/workflow_events/deploy` và `/disable`: triển khai hoặc vô hiệu hóa danh sách event (`WorkflowEventDeployRequest`).

## Ghi chú triển khai & kinh nghiệm
- Mỗi sự kiện nên gắn với version/workflowDefinition cụ thể để hỗ trợ migrate khi phát hành workflow mới.
- Với webhook cần cung cấp URL callback và thông tin xác thực để người dùng sao chép nhanh và thử nghiệm.
- Sự kiện lịch biểu nên có công cụ kiểm tra cron nhằm hạn chế cấu hình sai.
- Log kích hoạt gần nhất giúp người dùng đánh giá sức khỏe trigger, nên lưu lại và hiển thị trong chi tiết.

## Khuyến nghị kiểm thử
- Tạo event webhook và xác minh url/secret hiển thị đúng trong UI.
- Thử deploy một danh sách event lớn để kiểm tra payload `eventIds` và thời gian phản hồi.
- Cập nhật event với payload JSON lỗi cú pháp để đảm bảo UI bắt lỗi trước khi gửi.
- Disable sự kiện và kiểm tra rằng workflow không còn lắng nghe trigger.
