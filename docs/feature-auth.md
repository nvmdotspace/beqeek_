# Tính năng: Xác thực người dùng

## Mục tiêu nghiệp vụ
- Cho phép người dùng truy cập module HTML bằng cơ chế đăng nhập và duy trì phiên an toàn.
- Hỗ trợ tự phục vụ đăng ký trong các môi trường dev/demo trước khi được quản trị viên phê duyệt.
- Cung cấp khả năng làm mới access token để luồng HTML luôn gọi được các API bảo vệ bởi Bearer token.

## Luồng tính năng và trải nghiệm người dùng
- Màn hình xác thực cung cấp hai chế độ: đăng nhập dành cho người đã có tài khoản và đăng ký cho người mới, người dùng chuyển đổi linh hoạt giữa hai chế độ.
- Form đăng nhập thu thập `username` và `password`, hiển thị trạng thái xử lý và thông báo lỗi/ thành công rõ ràng.
- Form đăng ký yêu cầu họ tên, email, mật khẩu, xác nhận mật khẩu; thực hiện kiểm tra trùng khớp và định dạng trước khi gửi.
- Người dùng có thể ẩn/hiện trường mật khẩu trực tiếp để tránh nhập sai.
- Sau khi đăng nhập thành công, hệ thống lưu trữ access token và refresh token để duy trì phiên và điều hướng sang trang làm việc chính.

## API chính trong `public/swagger-html-module.yaml`
- `POST /api/auth/post/authenticate` (tag **Auth**): trả về `AuthTokens` gồm accessToken, refreshToken, userId để duy trì phiên người dùng.
- `POST /api/register` (tag **Auth**): tạo tài khoản mới dựa trên `RegisterRequest`.
- `POST /api/auth/post/refresh_token` (tag **Auth**): làm mới access token khi token cũ hết hạn, bảo đảm các module HTML tiếp tục truy cập API.

## Ghi chú triển khai & kinh nghiệm
- Nên cung cấp liên kết rõ ràng cho luồng quên mật khẩu và đăng ký tùy vào chính sách workspace.
- Đảm bảo cấu hình `apiBaseUrl` chính xác cho từng môi trường và luôn sử dụng HTTPS khi triển khai thực tế.
- Token lưu trong cookie cần cài đặt thuộc tính bảo mật (`Secure`, `HttpOnly` nếu phù hợp) và xóa đúng cách khi đăng xuất.
- Bổ sung xử lý lỗi chung để hiển thị thông báo thân thiện khi backend trả thông tin không chuẩn hoặc lỗi hệ thống.

## Khuyến nghị kiểm thử
- Kiểm tra đăng nhập với thông tin hợp lệ và không hợp lệ, xác minh thông báo lỗi hiển thị đúng tiếng Việt.
- Kiểm tra đăng ký với mật khẩu không khớp, thiếu trường bắt buộc và email không hợp lệ.
- Sau đăng nhập đảm bảo trình duyệt điều hướng đúng URL, lưu token và có thể refresh trang mà vẫn giữ phiên.
- Giả lập lỗi mạng và xác thực rằng thông báo "Lỗi khi đăng nhập/đăng ký" xuất hiện, không crash giao diện.
