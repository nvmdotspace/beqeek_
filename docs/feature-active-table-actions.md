# Tính năng: Hành động tùy chỉnh trên bản ghi

## Mục tiêu nghiệp vụ
- Cho phép kích hoạt các workflow/hàm tùy chỉnh gắn với bản ghi ngay trong giao diện mà không cần rời khỏi module.
- Tự động hóa các bước xử lý (ví dụ gửi email, cập nhật hệ thống khác) dựa trên dữ liệu record hiện tại.
- Ghi nhận lịch sử thực thi để người dùng nắm kết quả từng thao tác.

## Luồng tính năng và trải nghiệm người dùng
- Danh sách record và các khu vực chi tiết đều hiển thị nút menu hành động gồm `update`, `delete`, `custom`, giúp người dùng thao tác nhanh mà không rời ngữ cảnh.
- Khi chọn hành động tùy chỉnh, hệ thống tạo payload chuẩn hóa với `responseId` sinh trên client và `workflowData` phản ánh trạng thái bản ghi tại thời điểm kích hoạt.
- Giao diện cung cấp thông báo tức thì cho kết quả thành công/thất bại và có thể cập nhật tiến trình dài hạn bằng notification dock.
- Các vị trí kích hoạt khác nhau (danh sách, card, popup) dùng cùng cấu trúc payload để backend xử lý đồng nhất.

## API chính trong `public/swagger-html-module.yaml`
- `POST /api/workspace/{workspaceId}/workflow/post/active_tables/{tableId}/records/{recordId}/action/{actionId}` (tag **Active Table Actions**): nhận `ActionTriggerRequest` gồm `responseId`, `workflowData`, `extraData`. Trả về `StandardResponse`.

## Ghi chú triển khai & kinh nghiệm
- `responseId` sinh từ timestamp + random bytes giúp idempotent; backend nên kiểm tra trùng để tránh chạy lại khi người dùng double click.
- Payload `workflowData` hiện gửi toàn bộ record; với bảng lớn nên lọc field cần thiết để giảm kích thước.
- Lịch sử thực thi chưa hiển thị; nên bổ sung khả năng truy vấn log sau khi trigger để người dùng nắm được kết quả chi tiết.
- Đảm bảo menu hành động tự động đóng khi người dùng click ra ngoài để tránh thao tác nhầm.

## Khuyến nghị kiểm thử
- Tạo một action mẫu (ví dụ gửi webhook) và xác minh payload đúng với schema.
- Nhấn action liên tiếp để đảm bảo hệ thống không thực thi trùng (kiểm tra idempotent).
- Mô phỏng timeout hoặc mất kết nối để đảm bảo thông báo lỗi rõ ràng và hướng dẫn người dùng thử lại.
- Kiểm tra action trên record không tồn tại (xóa record rồi trigger từ tab khác) để chắc chắn backend trả 404 và UI xử lý.
