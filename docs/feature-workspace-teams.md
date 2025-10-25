# Tính năng: Quản lý Team trong Workspace

## Mục tiêu nghiệp vụ
- Phân tách tổ chức trong cùng workspace thành các team, phục vụ phân quyền và phân công nhiệm vụ.
- Cho phép tạo, chỉnh sửa, xóa team để bám sát cơ cấu nhân sự thực tế.
- Làm nền tảng cho việc gán vai trò, thành viên và luồng công việc theo team.

## Luồng tính năng và trải nghiệm người dùng
- Trang workspace hiển thị tab Team với danh sách các nhóm, mô tả, số thành viên và ngày tạo để quản trị tập trung.
- Form tạo/chỉnh sửa cho phép nhập tên, mô tả team và hiển thị dữ liệu hiện có khi chỉnh sửa để tránh thay đổi nhầm lẫn.
- Xóa team luôn đi kèm bước xác nhận và cập nhật danh sách ngay sau khi hoàn tất.
- Người dùng có thể điều hướng tới màn hình chi tiết của từng team để quản trị vai trò, thành viên và quyền hạn riêng.

## API chính trong `public/swagger-html-module.yaml`
- `POST /api/workspace/{workspaceId}/workspace/get/teams` (tag **Workspace Teams**): trả về `WorkspaceTeamListResponse`, hỗ trợ paging và filtering.
- `POST /api/workspace/{workspaceId}/workspace/get/teams/{teamId}`: lấy thông tin chi tiết team để bind vào form chỉnh sửa.
- `POST /api/workspace/{workspaceId}/workspace/post/teams`: tạo team mới dựa trên `TeamMutationRequest` (`data.teamName`, `teamDescription`).
- `POST /api/workspace/{workspaceId}/workspace/patch/teams/{teamId}`: cập nhật team.
- `POST /api/workspace/{workspaceId}/workspace/delete/teams/{teamId}`: xóa team, response được sử dụng để refresh UI.

## Ghi chú triển khai & kinh nghiệm
- Khi xóa team cần xác minh không còn role hoặc thành viên gắn kèm; nếu có phải trả lỗi business rõ ràng để người dùng xử lý.
- Nên chuẩn hóa `teamName` và kiểm tra trùng lặp ngay trên giao diện nhằm giảm số lần gọi API thất bại.
- Các API team sử dụng phương thức POST cho cả thao tác đọc; nếu triển khai caching layer cần cấu hình bỏ qua cache cho các endpoint này.
- Bảo đảm điều hướng nội bộ hỗ trợ lịch sử trình duyệt (back/forward) để người dùng quay lại tab trước dễ dàng.

## Khuyến nghị kiểm thử
- Tạo, chỉnh sửa, xóa team liên tiếp để đảm bảo danh sách refresh đúng và không mất trạng thái selection.
- Kiểm tra khi backend trả lỗi (ví dụ trùng tên) giao diện hiển thị thông báo rõ ràng và giữ nguyên dữ liệu người dùng đã nhập.
- Duyệt sang màn hình team detail qua URL trực tiếp (`/workspaces/:id/teams/:teamId`) để xác nhận route hoạt động.
- Sử dụng nhiều trình duyệt/thiết bị để đảm bảo CSS responsive vẫn đọc được thông tin team.
