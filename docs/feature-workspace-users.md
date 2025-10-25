# Tính năng: Quản lý Thành viên Workspace

## Mục tiêu nghiệp vụ
- Quản trị thành viên nội bộ và người được mời tham gia workspace, đảm bảo đúng quyền truy cập.
- Hỗ trợ tạo user cục bộ (cấp tài khoản mới) hoặc mời user hệ thống sẵn có vào team.
- Theo dõi trạng thái tham gia (đã chấp nhận, đang chờ) nhằm điều phối nguồn lực.

## Luồng tính năng và trải nghiệm người dùng
- Tab Thành viên hiển thị danh sách user với avatar, username, team-role và trạng thái tham gia để quản trị tổng quan.
- Nút "Thêm thành viên" mở wizard hai bước: tra cứu người dùng hiện có, sau đó mời tham gia hoặc chuyển sang tạo tài khoản cục bộ mới.
- Form tạo user yêu cầu `username`, `password`, `email`, `fullName`; nút submit bị khóa trong quá trình gửi để tránh thao tác trùng.
- Người quản trị chỉ định team và role ngay trong popup thông qua dropdown đồng bộ với dữ liệu workspace.
- Luồng mời hàng loạt cho phép nhập danh sách email/username để gửi lời mời đồng thời, hữu ích cho onboarding quy mô lớn.

## API chính trong `public/swagger-html-module.yaml`
- `POST /api/workspace/{workspaceId}/workspace/get/users` (tag **Workspace Users**): trả về `WorkspaceUserListResponse` với các trường membership.
- `POST /api/workspace/{workspaceId}/workspace/post/users`: tạo user cục bộ và gán vào team/role thông qua `constraints.workspaceTeamId` và `constraints.workspaceTeamRoleId`.
- `POST /api/workspace/{workspaceId}/workspace/post/invitations/bulk`: gửi lời mời đến user đã tồn tại, payload là `InvitationBulkRequest`.
- `POST /api/user/get/users/via-username/{username}`: tra cứu thông tin user trước khi mời nhằm tránh mời nhầm.

## Ghi chú triển khai & kinh nghiệm
- Khi tạo user cục bộ, nếu `data.password` trống backend sẽ báo lỗi; UI nên bắt buộc nhập và có chỉ báo độ mạnh mật khẩu.
- Payload mời bulk nên xử lý các trường hợp trùng lặp email và hiển thị kết quả chi tiết (thành công/thất bại) để người dùng nắm.
- Danh sách user có thể lớn; cân nhắc bổ sung phân trang hoặc tìm kiếm phía client dựa trên username hoặc email.
- Sau khi mời, UI chỉ hiển thị message chung; nên cập nhật danh sách để thể hiện trạng thái "Đang mời".

## Khuyến nghị kiểm thử
- Kiểm thử luồng tạo user mới vs. mời user đã tồn tại, đảm bảo backend trả đúng mã trạng thái và UI xử lý thông điệp.
- Nhập username không tồn tại để xác nhận hệ thống đưa ra thông báo "Không tìm thấy user".
- Thực hiện nhiều lời mời trong một request (bulk) và kiểm tra backend xử lý phần tử lỗi.
- Test trên tài khoản không có quyền quản trị workspace để đảm bảo API trả lỗi 403 và UI thông báo phù hợp.
