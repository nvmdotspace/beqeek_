# Tính năng: Quản lý Workflow Unit

## Mục tiêu nghiệp vụ
- Thiết kế và điều hành các đơn vị tự động hóa (workflow unit) gồm trigger, logic, action.
- Cho phép triển khai (deploy) hoặc tạm dừng (disable) từng unit để kiểm soát pipeline sản xuất.
- Kết nối workflow unit với Active Table, form, connector nhằm tạo quy trình hoàn chỉnh.

## Luồng tính năng và trải nghiệm người dùng
- Danh sách workflow unit hiển thị trạng thái (Draft, Active, Disabled), phiên bản và người chỉnh sửa gần nhất kèm bộ lọc theo status hoặc từ khóa.
- Khi mở chi tiết, người dùng xem metadata của unit, các sự kiện, connector, Active Table liên kết và sơ đồ luồng từ cấu hình JSON.
- Trình tạo/chỉnh sửa unit hướng dẫn từng bước: khai báo thông tin chung, chọn trigger, gán nguồn dữ liệu (Active Table), form đầu vào và cấu hình action.
- Bộ hành động cho phép triển khai hoặc vô hiệu hóa unit, cập nhật trạng thái ngay sau khi gửi yêu cầu.
- Dropdown lựa chọn resource được đồng bộ với danh sách Active Table, Form, Connector hiện tại để giảm lỗi chọn nhầm.

## API chính trong `public/swagger-html-module.yaml`
- `POST /api/workspace/{workspaceId}/workflow/get/workflow_units` (tag **Workflow Units**): liệt kê unit theo paging/filtering.
- `POST /api/workspace/{workspaceId}/workflow/get/workflow_units/{workflowUnitId}`: lấy chi tiết unit (bao gồm cấu hình JSON, mapping).
- `POST /api/workspace/{workspaceId}/workflow/post/workflow_units`: tạo unit mới với `WorkflowUnitMutationRequest` (chứa `unitName`, `config`, liên kết resource).
- `POST /api/workspace/{workspaceId}/workflow/patch/workflow_units/{workflowUnitId}`: cập nhật unit.
- `POST /api/workspace/{workspaceId}/workflow/delete/workflow_units/{workflowUnitId}`: xóa unit.
- `POST /api/workspace/{workspaceId}/workflow/post/workflow_units/{workflowUnitId}/deploy` và `/disable`: thay đổi trạng thái runtime.

## Ghi chú triển khai & kinh nghiệm
- Khi deploy, backend nên khóa version và tạo snapshot để rollback; UI có thể hiển thị danh sách version để người dùng chọn.
- Chức năng delete nên cảnh báo nếu unit đang active hoặc có workflow events gắn kèm.
- Bởi unit liên kết nhiều resource, UI cần xử lý khi một resource bị xóa (ví dụ Active Table bị delete) bằng cách hiển thị cảnh báo "resource missing".
- Với cấu hình JSON phức tạp, nên sử dụng editor có validate schema và highlight thay cho textarea thuần để giảm lỗi nhập liệu.

## Khuyến nghị kiểm thử
- Tạo unit mới liên kết với Active Table và Form, deploy rồi gọi thử event để đảm bảo hoạt động.
- Disable unit và xác minh action không còn chạy, đồng thời trạng thái trên UI cập nhật.
- Cập nhật unit (ví dụ đổi connector) và redeploy, kiểm tra backend lưu version mới.
- Xóa unit và đảm bảo danh sách event liên quan cũng bị cập nhật hoặc thông báo lỗi.
