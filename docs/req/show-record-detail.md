**Mục Tiêu**

- Mô tả chi tiết luồng và tính năng của trang chi tiết bản ghi hiện tại.
- Chuẩn hóa thành tài liệu kỹ thuật để clone sang React + React Query.
- Xác định API, state, UI layout, hành động và bình luận; kèm blueprint kiến trúc React.
- Hỗ trợ quick edit từng trường (click dup để sửa hoặc bằng cách nào đó trên từng trường tuỳ em)
- Hỗ trợ hiển thị actions theo quyền
- Khung bình luận, các action trong từng bình luận (xoá, sửa) và tạo mới bình luận cũng hiển thị theo quyền

**Tổng Quan Hiện Trạng**

- Lớp `RecordDetailView` kế thừa `CommonStates`, chịu trách nhiệm:
  - Tải cấu hình bảng và bản ghi hiện tại.
  - Hiển thị tiêu đề, phụ đề, nội dung chi tiết theo `recordDetailConfig`.
  - Render menu hành động (update, delete, custom) có điều kiện theo `record.permissions`.
  - Quản lý bình luận: tạo/sửa/xóa, render markdown, phân trang vô hạn.
  - Sử dụng “ripple/skeleton” để hiển thị trạng thái tải.

**Luồng Render**

- Entry: `render(tableId, recordId)`
  - Kiểm tra `tableId` và `recordId`.
  - Gọi `skeleton()` để reset nội dung.
  - `renderEmptyState()` hiển thị ripple cho name/heading/subheading.
  - Lưu `currentRecordId` vào state cục bộ, `States.currentRecordView = 'record-detail'`.
  - Tải bảng: `States.currentTable = TableAPI.fetchTableDetails(tableId)`.
  - Tải meta tham chiếu: `States.currentReferenceTableDetails = RecordView.fetchReferenceTableDetails(fields)`.
  - Ẩn ripple và thay tên bảng vào `record-detail-name`.
  - Gọi `skeletonRecordDetailFields()` dựng khung khối chi tiết.
  - Gọi `renderContent(recordId)` để fill data.

- `renderContent(recordId)`
  - `renderEmptyState(true)` bật ripple phần nội dung chi tiết.
  - Tải bản ghi: `States.currentRecord = TableAPI.fetchRecordById(States.currentTable, recordId)`.
  - Thu thập map tham chiếu:
    - `referenceFieldMap = RecordView.collectReferenceFieldMap(fields, [record])`.
    - `userFieldMap = RecordView.collectReferenceUserFieldMap(fields, [record])`.
  - Tải dữ liệu tham chiếu: `fetchBatchReferenceRecords(referenceFieldMap)` và `fetchReferenceUserRecords(userFieldMap)`.
  - Lấy `detailConfig = States.currentTable.config.recordDetailConfig || { layout: 'head-detail' }`.
  - Render heading bằng `headTitleField` và `RecordBaseView.parseDisplayValue(...)`.
  - Lọc `displayActions` từ `States.currentTable.config.actions` + `record.permissions` và render menu `more_vert` với các `onclick`:
    - Update: `RecordView.openRecordForm('edit', record.id)`.
    - Delete: `RecordView.deleteRecord(record.id)`.
    - Custom: `RecordView.triggerAction(actionId, record.id, tableId)`.
  - Render nội dung theo `layout`:
    - `head-detail`: hiển thị `headSubLineFields` dưới tiêu đề; `rowTailFields` theo từng dòng; riêng `RICH_TEXT` render trong `markdown-body`.
    - `two-column-detail`: tiêu đề + phụ đề + lưới 2 cột (`column1Fields`/`column2Fields`).
  - Thêm khối bình luận nếu `commentsPosition` là `'bottom'` hoặc `'right-panel'` và khởi tạo editor `SimpleMDE`.
  - Gắn sự kiện submit: tạo/sửa bình luận bằng `TableAPI.createComment/updateComment`, sau đó `renderComments(recordId)` và khôi phục nút.
  - Nếu ẩn bình luận, thêm class `comment-hidden` cho `#record-detail-main`.

- `renderComments(recordId)`
  - Gọi `TableAPI.fetchComments(States.currentTable, recordId, {}, null, 'desc', 7)`.
  - Lưu `nextCommentPageId` vào state cục bộ.
  - Mỗi comment:
    - Header: user (`Auth.getAuthUser(createdBy)?.fullName`) + thời gian.
    - Nội dung: `marked.parse(comment.commentContent)`.
    - Nếu là tác giả (so sánh `createdBy === Auth.getAuthUserId()`), hiển thị nút `Sửa` và `Xóa`.
  - Infinite scroll: lắng nghe `scroll` trên `#comment-list`; khi gần cuối và có `nextCommentPageId` thì fetch thêm với `nextId`, append items và cập nhật `nextCommentPageId`.
  - Lưu ý bug: ở batch append kế tiếp, nút `Xóa` đang gọi `RecordDetailView.deleteComment('${comment.id}')` thiếu `recordId` theo chữ ký `deleteComment(recordId, commentId)`.

**Tính Năng Trang RecordDetail**

- Hiển thị tiêu đề/phụ đề và nội dung chi tiết bản ghi theo `recordDetailConfig`.
- Hành động bản ghi theo quyền:
  - `update` mở form sửa.
  - `delete` xác nhận xoá, gọi API, điều hướng về danh sách.
  - `custom` kích hoạt hành động tùy biến theo `actionId`.
- Bình luận:
  - Editor `SimpleMDE` hỗ trợ Markdown.
  - Tạo/sửa/xóa bình luận thông qua API.
  - Render danh sách với Markdown và phân trang vô hạn.
- Trạng thái tải:
  - Ripple/skeleton cho heading, subheading, fields và khối bình luận.
- Xử lý tham chiếu:
  - `parseDisplayValue` sử dụng dữ liệu `referenceRecords`, `States.currentReferenceTableDetails`, `userRecords` để hiển thị đẹp cho các field tham chiếu hoặc user.

**API & Hợp Đồng Dữ Liệu (Suy diễn từ mã)**

- `TableAPI.fetchTableDetails(tableId)` → `Table`:
  - `id`, `name`, `description?`, `config`:
    - `recordDetailConfig`: `{ layout, headTitleField?, headSubLineFields?, rowTailFields?, column1Fields?, column2Fields?, commentsPosition }`.
    - `actions`: `[{ type: 'update'|'delete'|'custom', actionId?, icon?, name }]`.
    - `fields`: danh sách field `{ name, label, type, ... }`.
- `TableAPI.fetchRecordById(table, recordId)` → `Record`:
  - `id`, `permissions`: `{ update?, delete?, custom_<actionId>? }`, các trường dữ liệu của record.
- `RecordView.fetchReferenceTableDetails(fields)` → metadata bảng tham chiếu cho các `REFERENCE` / `USER` fields.
- `RecordView.fetchBatchReferenceRecords(referenceFieldMap)` → bản ghi tham chiếu.
- `RecordView.fetchReferenceUserRecords(userFieldMap)` → thông tin người dùng tham chiếu.
- `RecordBaseView.parseDisplayValue(field, record, referenceRecords, referenceTableDetails, userRecords)` → giá trị hiển thị (bao gồm parse `RICH_TEXT`).
- Comments:
  - `TableAPI.fetchComments(table, recordId, filters, nextId, order, limit)` → `{ data: Comment[], nextId? }`.
  - `TableAPI.createComment(workspaceId, table, recordId, { commentContent })` → `Comment`.
  - `TableAPI.updateComment(workspaceId, table, recordId, commentId, { commentContent })` → `Comment`.
  - `TableAPI.deleteComment(workspaceId, table, recordId, commentId)` → boolean.
  - `TableAPI.fetchCommentById(workspaceId, table, recordId, commentId)` → `Comment`.
- Auth:
  - `Auth.getAuthUser(userId)` → user info `{ fullName?, ... }`.
  - `Auth.getAuthUserId()` → current user id.

**Quản Lý Trạng Thái Hiện Tại**

- Cục bộ lớp:
  - `currentStates = { currentRecordId, currentRecord }`.
  - `editingCommentId`, `simplemde`, `nextCommentPageId`.
- Toàn cục `States`:
  - `currentRecordView`, `currentTable`, `currentReferenceTableDetails`, `currentRecord?`, `popupCallback?`.

**Blueprint Kiến Trúc React + React Query**

- Khung project:
  - `src/api/tableApi.ts`: map các hàm API kể trên.
  - `src/types/`: khai báo `Table`, `Record`, `Field`, `Comment`, `RecordDetailConfig`, `Action`.
  - `src/utils/parseDisplayValue.ts`: tái hiện logic hiển thị (bao gồm `RICH_TEXT`).
  - `src/features/records/pages/RecordDetailPage.tsx`: trang chính, lấy `tableId`/`recordId` từ route.
  - `src/features/records/components/RecordHeading.tsx`: render heading + subheading.
  - `src/features/records/components/RecordActionsMenu.tsx`: menu hành động theo `permissions`.
  - `src/features/records/components/RecordDetailFields.tsx`:
    - Renderer cho `head-detail` và `two-column-detail`.
  - `src/features/comments/components/CommentSection.tsx`: khu vực bình luận, gồm editor + list.
  - `src/features/comments/components/CommentEditor.tsx`: dùng `react-simplemde-editor` hoặc textarea.
  - `src/features/comments/components/CommentList.tsx`: danh sách + infinite scroll.
  - `src/providers/AppProviders.tsx`: `QueryClientProvider`, `AuthProvider`, `ThemeProvider` (tuỳ).
  - `src/hooks/useReferenceMaps.ts`: fetch và memo hoá reference/user records theo fields.
  - `src/hooks/useRecordActions.ts`: mở form, xoá, trigger custom action.

- React Query: Queries và Mutations
  - Queries:
    - `useTableDetails(tableId)` → key: `['table', tableId]`.
    - `useRecord(tableId, recordId)` → `['record', tableId, recordId]`.
    - `useReferenceTables(fields)` → `['referenceTables', hash(fields)]`.
    - `useReferenceRecords(tableId, recordId, fields)` → `['referenceRecords', tableId, recordId]`.
    - `useUserRecords(tableId, recordId, fields)` → `['userRecords', tableId, recordId]`.
    - `useCommentsInfinite(tableId, recordId)` dùng `useInfiniteQuery`:
      - `queryKey`: `['comments', tableId, recordId]`.
      - `queryFn`: `({ pageParam }) => fetchComments(table, recordId, {}, pageParam ?? null, 'desc', 7)`.
      - `getNextPageParam`: `(lastPage) => lastPage.nextId ?? undefined`.
  - Mutations:
    - `useCreateComment(tableId, recordId)` → invalidates `['comments', tableId, recordId]`.
    - `useUpdateComment(tableId, recordId, commentId)` → invalidates hoặc `queryClient.setQueryData`.
    - `useDeleteComment(tableId, recordId, commentId)` → optimistic update, rollback nếu fail.
    - `useDeleteRecord(tableId, recordId)` → điều hướng về danh sách, invalidate `['records', tableId]` nếu có.

- State & Permissions
  - Tránh `States` toàn cục; thay bằng cache của React Query + local component state.
  - Phần `popupCallback`: thay bằng sự kiện hoặc context callback khi modal form đóng → refetch `useRecord`.

- UI & Skeleton
  - Thay `CommonUtils.show/hideRaptorRipple` bằng skeleton components:
    - `HeadingSkeleton`, `SubheadingSkeleton`, `FieldSkeleton`, `CommentSkeleton`.
  - Render dựa trên `isLoading`/`isFetching` từ React Query.

- Markdown
  - Render: `react-markdown` hoặc `marked` + sanitize HTML.
  - Editor: `react-simplemde-editor` hoặc textarea nếu cần đơn giản.

- Điều Hướng & Xử Lý Lỗi
  - `react-router`: lấy `tableId`, `recordId`.
  - Errors: hiển thị toast và điều hướng khi xoá bản ghi thành công hoặc lỗi nghiêm trọng.
  - Dùng `ErrorBoundary` ở cấp trang.

**Thiết Kế Component Chi Tiết**

- `RecordDetailPage`
  - Nhận `tableId`, `recordId`.
  - Queries: bảng, record, referenceTables, referenceRecords, userRecords.
  - State: layout từ `recordDetailConfig`, permissions từ `record`.
  - Render:
    - Heading: `RecordHeading` dùng `headTitleField` và `headSubLineFields`.
    - Actions: `RecordActionsMenu`.
    - Fields: `RecordDetailFields` với `layout` tương ứng.
    - Comments: `CommentSection` nếu `commentsPosition` khác `'hidden'`.
  - Loading:
    - Khi bảng/record chưa sẵn sàng → skeleton placeholders tương ứng.

- `RecordActionsMenu`
  - Props: `actions`, `permissions`, `recordId`, `tableId`.
  - Lọc như `displayActions`.
  - Các handler:
    - `onEdit`: mở modal Edit → khi close, `refetch` record.
    - `onDelete`: confirm → mutation → điều hướng.
    - `onCustom(actionId)`: gọi API custom và phản hồi.

- `RecordDetailFields`
  - Props: `layout`, `fields`, `record`, `referenceRecords`, `referenceTableDetails`, `userRecords`.
  - Logic hiển thị `RICH_TEXT` trong container `markdown-body`.
  - `head-detail`:
    - Subheading từ `headSubLineFields`.
    - Dòng nội dung từ `rowTailFields`.
  - `two-column-detail`:
    - Heading + sublines.
    - Grid 2 cột từ `column1Fields` và `column2Fields`.

- `CommentSection`
  - Layout theo `commentsPosition` (`bottom`/`right-panel`).
  - `CommentEditor`: hiển thị editor, submit tạo/sửa.
    - Trạng thái loading cho nút submit.
    - Khi sửa: fill nội dung và đổi text nút.
  - `CommentList`: render comments từ `useInfiniteQuery`, infinite scroll với `IntersectionObserver` hoặc lắng nghe scroll.
  - Handlers:
    - `onEdit(comment)`: set editing state.
    - `onDelete(commentId)`: confirm + mutation → refetch hoặc optimistic removal.

**Query Keys & Cache Invalidation**

- Dùng khóa chứa `tableId` và `recordId` cho tính đúng đắn cache.
- Sau `create/update/delete` comment:
  - Nếu dùng `useInfiniteQuery`: `queryClient.invalidateQueries(['comments', tableId, recordId])`.
  - Hoặc `setQueryData` để chèn/sửa/xóa phần tử ở page đầu → ít nhấp nháy UI.
- Sau `delete` record:
  - Điều hướng về danh sách: `navigate('/tables/:tableId/records')`.
  - Invalidate danh sách bản ghi: `['records', tableId]` (nếu tồn tại).

**TypeScript Models (gợi ý)**

- `RecordDetailConfig`:
  - `layout: 'head-detail' | 'two-column-detail'`
  - `headTitleField?: string`
  - `headSubLineFields?: string[]`
  - `rowTailFields?: string[]`
  - `column1Fields?: string[]`
  - `column2Fields?: string[]`
  - `commentsPosition?: 'bottom' | 'right-panel' | 'hidden'`
- `Field`: `name`, `label`, `type: 'TEXT' | 'NUMBER' | 'RICH_TEXT' | 'REFERENCE' | 'USER' | ...`.
- `Action`: `type: 'update' | 'delete' | 'custom'`, `name`, `icon?`, `actionId?`.
- `RecordPermissions`: `{ update?: boolean; delete?: boolean; [key: `custom\_${string}`]: boolean }`.
- `Record`: `{ id: string; permissions: RecordPermissions; [key: string]: any }`.
- `Table`: `{ id: string; name: string; description?: string; config: { fields: Field[]; actions?: Action[]; recordDetailConfig?: RecordDetailConfig } }`.
- `Comment`: `{ id: string; createdBy: string; createdAt: string; commentContent: string }`.

**Mapping Chức Năng → React**

- Ripple/skeleton → component Skeleton dựa trên `isLoading`.
- `States.currentTable` → `useTableDetails(tableId)`; chia sẻ via query cache hoặc context.
- `RecordBaseView.parseDisplayValue` → `utils/parseDisplayValue.ts`.
- Hành động `RecordView.openRecordForm('edit', id)` → modal Edit trong React; sau close, `refetch(['record', tableId, recordId])`.
- `RecordView.triggerAction` → mutation tùy biến; hiển thị toast kết quả.
- `CommonUtils.navigateToRecords` → `useNavigate`.
- Markdown:
  - Hiển thị `RICH_TEXT` và comment bằng `react-markdown` + `rehype-sanitize`.
  - Editor `react-simplemde-editor` hoặc textarea + preview.

**Xử Lý Bình Luận Trong React Query**

- `useInfiniteQuery`:
  - `getNextPageParam: (lastPage) => lastPage.nextId ?? undefined`.
  - Render pages: `data.pages.flatMap(p => p.data)`.
- Infinite scroll:
  - `IntersectionObserver` gắn vào sentinel cuối danh sách để gọi `fetchNextPage`.
  - Tránh lắng nghe `scrollTop` thủ công.

**Xử Lý Quyền Hành Động**

- Dựa trên `record.permissions`:
  - `update`: hiển thị nút Edit.
  - `delete`: hiển thị nút Delete.
  - `custom`: mỗi `action` có `actionId`, kiểm `permissions['custom_'+actionId]`.
- UI luôn ẩn các nút không được phép.

**Trạng Thái Nút Submit Bình Luận**

- Khi submit:
  - Disable nút, đổi text “Đang bình luận”.
  - Sau thành công: clear editor, reset editing state, `invalidateQueries`.
  - Bắt lỗi: show toast, khôi phục nút.

**Xử Lý Lỗi & Thông Báo**

- Toast/Alert component:
  - Lỗi tải dữ liệu: hiển thị “Không thể tải chi tiết bản ghi…”.
  - Lỗi bình luận: thông báo. Giữ editor để người dùng sửa.
- Điều hướng:
  - Sau xoá record thành công: navigate về danh sách.

**Bảo Mật & An Toàn**

- Sanitize markdown khi render (`rehype-sanitize`) để tránh XSS.
- Kiểm tra quyền trước khi hiển thị hành động.
- Chống double submit bằng `isLoading` của mutation.

**Hiệu Năng**

- Prefetch:
  - Khi vào trang, prefetch `tableDetails` nếu chưa có.
  - Prefetch `referenceTables` và `referenceRecords` song song với `record`.
- Memo hóa `parseDisplayValue` theo `field.name`, `record.id`.
- Virtualize danh sách bình luận nếu dài (`react-virtual`).

**Ví Dụ Mã (Rút gọn)**

- Query record:
  - `const { data: table } = useQuery(['table', tableId], () => api.fetchTableDetails(tableId));`
  - `const { data: record } = useQuery(['record', tableId, recordId], () => api.fetchRecordById(tableId, recordId), { enabled: !!tableId });`

- Comments infinite:
  - `const commentsQuery = useInfiniteQuery({ queryKey: ['comments', tableId, recordId], queryFn: ({ pageParam }) => api.fetchComments(tableId, recordId, {}, pageParam ?? null, 'desc', 7), getNextPageParam: (last) => last.nextId ?? undefined });`

- Create comment mutation:
  - `const createComment = useMutation({ mutationFn: (content) => api.createComment(workspaceId, tableId, recordId, { commentContent: content }), onSuccess: () => queryClient.invalidateQueries(['comments', tableId, recordId]) });`

**Các Khác Biệt So Với Hiện Trạng**

- Không dùng `States` toàn cục; chuyển sang React Query + props.
- Không dùng `CommonUtils.show/hideRaptorRipple`; thay bằng skeleton.
- Sửa bug thiếu `recordId` khi gọi `deleteComment` ở batch append.
- Tách renderer theo layout thành component riêng, dễ bảo trì.

**Kế Hoạch Clone Từng Bước**

- Thiết lập `QueryClientProvider` và `react-router`.
- Implement `tableApi.ts` bọc REST endpoints tương đương với `TableAPI`/`RecordView` hiện tại.
- Tạo types cho bảng, record, field, permissions, comment.
- Tạo `RecordDetailPage`:
  - Queries: table, record, references, comments infinite.
  - Skeleton khi đang tải.
- Tạo các component con: Heading, ActionsMenu, DetailFields, CommentSection.
- Tạo hooks `useComments`, `useRecordActions`, `useReferenceMaps`.
- Tích hợp editor `react-simplemde-editor` hoặc textarea.
- Viết unit tests cho `parseDisplayValue` và hooks cơ bản.
- Kiểm thử:
  - Quyền hiển thị hành động.
  - Tạo/sửa/xóa bình luận và phân trang vô hạn.
  - Render `RICH_TEXT` và các trường tham chiếu đúng.

**Rủi Ro & Lưu Ý**

- Hợp đồng API thực tế có thể khác; cần đồng bộ schema từ backend.
- `parseDisplayValue` phụ thuộc nhiều vào metadata tham chiếu; cần đảm bảo fetch đầy đủ.
- Đảm bảo i18n cho text mặc định (“Tiêu đề”, “Trường phụ”, …).
- Xử lý lỗi mạng và retry của React Query có thể tạo double-action nếu không cẩn thận.

Nếu bạn muốn, tôi có thể scaffold cấu trúc React + React Query (files, hooks, components) và tạo các stub API tương ứng để bạn điền endpoint thực tế.
