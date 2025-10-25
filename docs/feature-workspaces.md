# Tính năng: Quản lý Workspace

## Mục tiêu nghiệp vụ
- Cho phép người dùng xem và quản trị danh sách workspace mà họ có quyền truy cập.
- Hỗ trợ tạo mới, chỉnh sửa và xóa workspace để tổ chức quy trình theo từng đơn vị hoặc dự án.
- Cung cấp thông tin tổng quan (logo, namespace, owner) làm nền tảng cho các module khác.

## Luồng tính năng và trải nghiệm người dùng
- Sau khi đăng nhập, danh sách workspace hiển thị dưới dạng thẻ với logo, namespace, owner và các số liệu chính để người dùng chọn nhanh.
- Popup tạo/sửa workspace thu thập `workspaceName`, `namespace`, `description`, logo và cho phép chỉnh sửa inline khi đang xem chi tiết.
- Xóa workspace luôn yêu cầu xác nhận nhằm tránh mất dữ liệu ngoài ý muốn, đồng thời cập nhật danh sách ngay sau thao tác.
- Điều hướng chi tiết dẫn tới trang quản trị bao gồm team, role, user và các cấu hình chuyên sâu khác.

## API chính trong `public/swagger-html-module.yaml`
- `POST /api/user/me/get/workspaces` (tag **Workspaces**): trả về `WorkspaceListResponse`, cho phép truyền `queries.fields` để giảm payload.
- `POST /api/user/me/get/workspaces/{workspaceId}`: lấy chi tiết từng workspace, dùng khi vào màn detail.
- `POST /api/workspace/post/workspaces`: tạo workspace mới dựa trên `WorkspaceMutationRequest` (bao gồm `data.workspaceName`, `namespace`, metadata).
- `POST /api/workspace/patch/workspaces/{workspaceId}`: cập nhật workspace hiện hữu với cùng payload.
- `POST /api/workspace/delete/workspaces/{workspaceId}`: xóa workspace, trả về `StandardResponse` dùng để hiển thị toast.

## Ghi chú triển khai & kinh nghiệm
- Giao diện sử dụng router nội bộ dựa vào history API; cần đồng bộ tiền tố đường dẫn giữa server và client để tránh điều hướng sai.
- Namespace cần duy nhất toàn hệ thống; trước khi gửi API nên bổ sung kiểm tra trùng hoặc thêm slugify để tránh ký tự lạ.
- Khi xóa workspace nên cân nhắc chặn thao tác nếu workspace đang được tham chiếu bởi active tables hoặc workflow units.
- Việc tải danh sách dùng POST với payload tối thiểu; cần đảm bảo gateway cho phép yêu cầu có body rỗng hoặc chỉ chứa filter mặc định.

## Khuyến nghị kiểm thử
- Tạo workspace mới với dữ liệu hợp lệ và thiếu namespace để kiểm tra validate từ backend.
- Cập nhật logo/description và xem lại ở danh sách để đảm bảo dữ liệu được đồng bộ.
- Xóa workspace và xác minh rằng items trong UI bị loại bỏ đồng thời token không bị mất.
- Dùng tài khoản không có workspace để kiểm tra giao diện empty state và xử lý lỗi 404 khi truy cập trực tiếp vào workspace đã bị xóa.
