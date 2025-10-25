# Tính năng: Quản lý Role trong Team

## Mục tiêu nghiệp vụ
- Định nghĩa quyền hạn chi tiết trong từng team (ví dụ Owner, Manager, Contributor) để điều tiết hành vi người dùng.
- Hỗ trợ tạo role tuỳ biến ngoài các role mặc định nhằm đáp ứng nhu cầu phân quyền linh hoạt.
- Cho phép cập nhật mô tả, trạng thái role nhằm phản ánh thay đổi tổ chức.

## Luồng tính năng và trải nghiệm người dùng
- Trong trang chi tiết team, tab Role hiển thị danh sách vai trò cùng số thành viên hiện đang sử dụng mỗi role.
- Form tạo/sửa role bao gồm trường tên, mô tả, mã định danh và cờ `isDefault`, đảm bảo role được gắn đúng team trong workspace.
- Khi lưu role mới hoặc cập nhật, hệ thống đồng bộ danh sách ngay để người dùng thấy kết quả tức thì.
- Xóa role yêu cầu bước xác nhận và thông báo rõ ràng về ảnh hưởng tới thành viên đang gắn role đó.

## API chính trong `public/swagger-html-module.yaml`
- `POST /api/workspace/{workspaceId}/workspace/get/team_roles` (tag **Workspace Roles**): cho phép truyền `constraints.workspaceTeamId` để lọc.
- `POST /api/workspace/{workspaceId}/workspace/post/team_roles`: tạo role mới với payload `TeamRoleMutationRequest` (chứa `data.roleName`, `roleCode`, `roleDescription`).
- `POST /api/workspace/{workspaceId}/workspace/patch/team_roles/{roleId}`: cập nhật role hiện hữu.
- `POST /api/workspace/{workspaceId}/workspace/delete/team_roles/{roleId}`: xóa role; schema yêu cầu `constraints.workspaceTeamId` nhằm xác nhận ngữ cảnh.

## Ghi chú triển khai & kinh nghiệm
- Role mặc định (`isDefault=true`) nên bị khóa xóa ở UI để tránh mất quyền truy cập; hiện tại logic này chưa được bật.
- Backend cần từ chối xóa nếu role vẫn có user liên kết; UI có thể đọc thông báo lỗi và yêu cầu chuyển thành viên trước.
- Khi cập nhật role, hãy giữ nguyên `roleCode` để không phá hủy tham chiếu ở các workflow khác.
- Nên bổ sung khả năng sắp xếp role (thứ tự hiển thị) nếu team có nhiều vai trò.

## Khuyến nghị kiểm thử
- Tạo nhiều role với cùng tên để đảm bảo backend trả lỗi hợp lý và UI hiển thị thông báo.
- Đổi mô tả role và xác minh danh sách cập nhật ngay mà không reload trang.
- Thử xóa role đang được user sử dụng để kiểm tra dòng lỗi business.
- Kiểm tra tab role khi team không có role nào nhằm đảm bảo empty state hiển thị đúng.
