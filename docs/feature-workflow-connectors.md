# Tính năng: Quản lý Workflow Connector

## Mục tiêu nghiệp vụ
- Định nghĩa các kết nối tới hệ thống bên ngoài (CRM, Email, Webhook...) phục vụ workflow automation.
- Lưu trữ cấu hình OAuth/API key để các workflow unit tái sử dụng.
- Phân loại connector theo loại dịch vụ nhằm hỗ trợ người dùng chọn nhanh khi cấu hình workflow.

## Luồng tính năng và trải nghiệm người dùng
- Màn hình quản lý cung cấp danh sách connector hiện có cùng bộ lọc theo loại dịch vụ (CRM, ERP, Webhook...) để người dùng tìm nhanh.
- Khi tạo mới, người dùng điền tên, mô tả, chọn loại connector rồi chuyển sang bước cấu hình chi tiết.
- Bước cấu hình hiển thị các trường phù hợp với từng loại dịch vụ như API base URL, client ID/secret, token URL hoặc khóa truy cập.
- Với connector hỗ trợ OAuth, giao diện hướng dẫn cách thiết lập redirect URL, cấp quyền và kích hoạt quy trình cấp token.
- Danh sách connector thể hiện trạng thái kết nối, số workflow đang sử dụng, đồng thời cung cấp hành động sao chép thông tin hoặc chỉnh sửa.

## API chính trong `public/swagger-html-module.yaml`
- `POST /api/workspace/{workspaceId}/workflow/get/workflow_connectors` (tag **Workflow Connectors**): trả về danh sách connector.
- `POST /api/workspace/{workspaceId}/workflow/get/workflow_connectors/{connectorId}`: lấy chi tiết cấu hình.
- `POST /api/workspace/{workspaceId}/workflow/post/workflow_connectors`: tạo connector mới với payload `WorkflowConnectorMutationRequest`.
- `POST /api/workspace/{workspaceId}/workflow/patch/workflow_connectors/{connectorId}`: cập nhật thông tin tên/mô tả lẫn config.
- `POST /api/workspace/{workspaceId}/workflow/delete/workflow_connectors/{connectorId}`: xoá connector (cần đảm bảo không còn workflow phụ thuộc).

## Ghi chú triển khai & kinh nghiệm
- Template cấu hình nên được lưu tập trung trên backend để tránh lệch giữa các phiên bản giao diện.
- Thông tin nhạy cảm như client secret cần được mã hóa khi lưu trữ và không trả nguyên giá trị về phía client sau khi tạo.
- Bổ sung khả năng kiểm tra kết nối ngay trong giao diện giúp người dùng xác nhận cấu hình chính xác.
- Phân quyền nên giới hạn tính năng chỉnh sửa/xóa connector cho quản trị viên để bảo vệ các workflow đang hoạt động.

## Khuyến nghị kiểm thử
- Tạo connector với đầy đủ trường, lưu lại rồi mở lại xem dữ liệu chính xác.
- Thử cập nhật thông tin OAuth (ví dụ đổi redirect URI) và đảm bảo UI cập nhật chính xác.
- Xóa connector đang được workflow sử dụng để kiểm tra backend trả lỗi business và UI hiển thị rõ.
- Kiểm tra tìm kiếm (search) và lọc category với danh sách lớn.
