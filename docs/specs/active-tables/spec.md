# Triển khai feature active table

- Phân tích các feature đang có trong hệ thống (./docs), để hiểu được dự án đang làm gì
- Sau khi hiểu nghiệp vụ, hãy thiết kế ux, ui cho feature active table, đảm bảo thiết kế có sự liên kết với các feature khác.
- Đọc thêm tài liệu để hiểu rõ hơn về active table, bao gồm các tính năng, cơ chế hoạt động, và các ràng buộc.
    - ./docs/technical/doc-get-active-records.md
    - ./docs/technical/active-tables-business-requirements
    - ./docs/technical/hash_step.md
    - ./docs/system-architecture.md
    - @package/active-tables-core
    - @package/active-tables-hooks
    - @package/encryption-core
    - swagger.yaml (tag Active Tables)

## Yêu cầu làm tính năng show active tables đã tạo trước

- Tham khảo cách source code cũ làm (./docs/technical/html-module/)
- Response mẫu cho user hiện tại đang có
    -
https://app.o1erp.com/api/workspace/732878538910205329/workflow/get/active_work_groups
        - ./docs/specs/active-tables/active_work_groups.json
    - https://app.o1erp.com/api/workspace/732878538910205329/workflow/get/active_tables
        - ./docs/specs/active-tables/active_tables.json

