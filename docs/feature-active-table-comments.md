# Tính năng: Bình luận trên bản ghi Active Table

## Mục tiêu nghiệp vụ
- Cung cấp kênh trao đổi ngay trong từng bản ghi nhằm giảm phụ thuộc vào công cụ chat bên ngoài.
- Ghi lại lịch sử trao đổi, mention thành viên và gắn file minh họa cho công việc.
- Tích hợp với hệ thống thông báo để người liên quan nhận được cập nhật thời gian thực.

## Luồng tính năng và trải nghiệm người dùng
- Bên cạnh khu vực chi tiết bản ghi hiển thị panel thảo luận thời gian thực, hỗ trợ nhập nội dung dạng Markdown và xem lại lịch sử theo thứ tự thời gian.
- Danh sách bình luận thể hiện avatar, tên người đăng, thời điểm cập nhật và tự động làm mới khi có ý kiến mới.
- Người dùng có thể tạo, chỉnh sửa hoặc xóa bình luận ngay tại từng mục; hệ thống gửi payload Markdown kèm thông tin đính kèm hoặc mention.
- Ảnh và tệp được hiển thị trực tiếp trong nội dung bình luận, đảm bảo tương thích với nhiều kích thước màn hình.
- Trạng thái gửi bình luận được phản hồi bằng thông báo tức thì để người dùng biết kết quả.

## API chính trong `public/swagger-html-module.yaml`
- `POST /api/workspace/{workspaceId}/workflow/active_tables/{tableId}/records/{recordId}/get/comments` (tag **Active Table Comments**): trả về `CommentListResponse` theo phân trang.
- `POST /api/workspace/{workspaceId}/workflow/active_tables/{tableId}/records/{recordId}/get/comments/{commentId}`: lấy chi tiết comment khi chỉnh sửa.
- `POST /api/workspace/{workspaceId}/workflow/active_tables/{tableId}/records/{recordId}/post/comments`: tạo comment mới từ payload `CommentPayload` (có trường `content`, `files`, `mentions`).
- `POST /api/workspace/{workspaceId}/workflow/active_tables/{tableId}/records/{recordId}/patch/comments/{commentId}`: cập nhật comment.
- `POST /api/workspace/{workspaceId}/workflow/active_tables/{tableId}/records/{recordId}/delete/comments/{commentId}`: xóa comment.

## Ghi chú triển khai & kinh nghiệm
- UI chưa có cơ chế hiển thị mention gợi ý; nên bổ sung autocomplete dựa trên danh sách thành viên workspace để tận dụng cấu trúc `mentions`.
- Khi render Markdown cần sanitize nội dung để tránh XSS hoặc script ngoài ý muốn.
- Với lượng comment lớn, nên phân trang hoặc virtual scroll để giữ hiệu năng.
- Hệ thống timezone cần đồng bộ; timestamp hiện ở định dạng ISO nên nên chuyển sang hiển thị local user.

## Khuyến nghị kiểm thử
- Tạo comment với Markdown phức tạp (code block, danh sách) để kiểm tra render.
- Chỉnh sửa và xóa comment kế tiếp để đảm bảo API phản hồi được xử lý đúng và UI cập nhật.
- Kiểm tra lỗi khi comment vượt giới hạn ký tự hoặc backend trả 413.
- Test upload ảnh (nếu backend hỗ trợ) và đảm bảo hình hiển thị responsive.
