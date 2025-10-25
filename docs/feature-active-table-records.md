# Tính năng: Quản lý Bản ghi Active Table

## Mục tiêu nghiệp vụ
- Cho phép người dùng vận hành dữ liệu quy trình ngay trên giao diện web: xem, tạo, chỉnh sửa, xoá bản ghi.
- Đảm bảo dữ liệu nhạy cảm được mã hóa/giải mã phía client theo cấu hình bảng.
- Hỗ trợ các tiện ích nâng cao như timeline, dashboard, chart và trigger workflow actions.

## Luồng tính năng và trải nghiệm người dùng
- Module bản ghi cung cấp nhiều panel: danh sách, chi tiết, timeline, Gantt, ghi chú rich-text và khu vực thông báo tiến trình để theo dõi hoạt động.
- Khi người dùng chọn bảng, hệ thống gọi API lấy dữ liệu và giải mã các trường dựa trên khóa lưu ở phía client trước khi hiển thị.
- Tạo hoặc cập nhật bản ghi yêu cầu mã hóa lại dữ liệu đầu vào và gửi kèm chữ ký toàn vẹn (`record_hashes`) nhằm bảo vệ nội dung nhạy cảm.
- Bộ lọc cho phép kết hợp theo trạng thái, workgroup, tìm kiếm toàn văn, phân trang theo cursor và xuất dữ liệu để xử lý ngoại tuyến.
- Các widget thống kê, bảng điều khiển và biểu đồ hỗ trợ người dùng phân tích nhanh; dock thông báo cho phép theo dõi nhiều bản ghi hoặc tiến trình song song.

## API chính trong `public/swagger-html-module.yaml`
- `POST /api/workspace/{workspaceId}/workflow/get/active_tables/{tableId}/records` (tag **Active Table Records**): trả về danh sách record; payload hỗ trợ `filtering`, `paging`, `direction`, `limit`.
- `POST /api/workspace/{workspaceId}/workflow/post/active_tables/{tableId}/records`: tạo record mới với `ActiveTableRecordCreateRequest` gồm `record`, `record_hashes`, metadata.
- `POST /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}/records/{recordId}`: cập nhật record.
- `POST /api/workspace/{workspaceId}/workflow/delete/active_tables/{tableId}/records/{recordId}`: xoá record, dùng khi người dùng chọn action delete trong UI.

## Ghi chú triển khai & kinh nghiệm
- Giải mã dữ liệu chạy phía client nên phải có cơ chế kiểm tra khóa; nếu khóa thiếu cần yêu cầu nhập lại trước khi hiển thị record.
- Các widget biểu đồ/timeline tiêu tốn tài nguyên; nên chỉ tải khi người dùng mở để tránh ảnh hưởng hiệu năng.
- Cơ chế phân trang theo cursor cần lưu lại tham số lọc để người dùng quay lại danh sách không mất trạng thái.
- Với payload lớn hoặc có file đính kèm, nên cân nhắc gửi bất đồng bộ hoặc chia nhỏ để tránh giới hạn kích thước JSON.

## Khuyến nghị kiểm thử
- Tạo record với nhiều trường mã hóa, xác minh rằng dữ liệu giải mã chính xác và không rò rỉ chuỗi mã hóa ra UI.
- Cập nhật record đồng thời ở hai trình duyệt để kiểm tra xung đột và thông báo lỗi từ backend.
- Sử dụng filter phức tạp (ví dụ kết hợp nhiều điều kiện) và xem payload gửi lên có đúng schema `RecordQueryRequest`.
- Xóa record và quan sát dock thông báo, đảm bảo UI cập nhật danh sách ngay lập tức.
