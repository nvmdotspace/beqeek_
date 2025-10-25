# Tính năng: Nhóm công việc (Workflow Workgroup)

## Mục tiêu nghiệp vụ
- Tổ chức các Active Table, workflow unit và biểu mẫu theo nhóm nghiệp vụ để dễ quản lý.
- Cung cấp lớp metadata (name, code, description) dùng cho phân quyền và báo cáo.
- Làm nguồn dữ liệu cho UI hiển thị phân nhóm, filter và cấu hình mặc định.

## Luồng tính năng và trải nghiệm người dùng
- Danh sách Active Table và workflow được gom nhóm theo workgroup để người dùng dễ nhận diện phạm vi dữ liệu.
- Sidebar hoặc bộ lọc dựa trên workgroup giúp chuyển nhanh giữa các nhóm nghiệp vụ khác nhau.
- Khi tạo hoặc chỉnh sửa Active Table, người dùng chọn workgroup để bảng xuất hiện đúng ngữ cảnh và áp dụng phân quyền phù hợp.
- Các bộ lọc khác trong giao diện (ví dụ lọc record) dựa trên workgroup nhằm đồng bộ trải nghiệm giữa module dữ liệu và workflow.

## API chính trong `public/swagger-html-module.yaml`
- `POST /api/workspace/{workspaceId}/workflow/get/active_work_groups` (tag **Workflow Workgroups**): trả về `ActiveWorkGroupListResponse` với thuộc tính `id`, `name`, `code`, `description`.
- (Các API tạo/sửa/xóa workgroup chưa được mô tả trong spec; hiện module chỉ đọc danh sách.)

## Ghi chú triển khai & kinh nghiệm
- Nếu cần quản trị workgroup, nên bổ sung UI riêng và API mutation (create/patch/delete) để tránh thao tác trực tiếp trên database.
- Workgroup thường gắn với phân quyền; đảm bảo backend kiểm tra người dùng chỉ thấy nhóm mà họ được phép.
- Khi không có workgroup, UI đang fallback thành "Unnamed WorkGroup"; có thể cải thiện bằng empty state giải thích cho người dùng.
- Để hỗ trợ báo cáo, nên lưu thêm metadata như biểu tượng, màu sắc để UI hiển thị trực quan hơn.

## Khuyến nghị kiểm thử
- Kiểm tra load danh sách workgroup với workspace lớn, đảm bảo API trả về đủ dữ liệu và UI nhóm đúng.
- Thử tình huống API trả rỗng/404 và xem UI fallback có hiển thị cảnh báo phù hợp.
- Đổi workgroup trong cấu hình bảng rồi kiểm tra danh sách record phản ánh thay đổi.
