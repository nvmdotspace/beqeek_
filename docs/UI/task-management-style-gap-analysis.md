# Task Management Style Guide – Đối chiếu với hệ thống Beqeek

## Nguồn tham chiếu

- Tài liệu gốc của template Task Management: `docs/UI/STYLE-GUIDE.md` (ví dụ các mục màu sắc và component tại `docs/UI/STYLE-GUIDE.md:18-704`).
- Thiết lập token & theme hiện hành: `packages/ui/src/styles/globals.css:1-167`.
- Triển khai component thực tế tại ứng dụng: `packages/ui/src/components/button.tsx:1-48`, `packages/ui/src/components/input.tsx:1-22`, `apps/web/src/features/active-tables/components/settings/fields/fields-settings-section.tsx:320-360`, `apps/web/src/features/active-tables/components/settings/filters/quick-filters-section.tsx:89-159`.

## Tóm tắt nhanh

- Template Task Management dùng hệ màu OKLCH có dải tương phản rõ ràng cho light/dark, trong khi hệ thống hiện tại vẫn giữ bảng màu HSL mặc định của shadcn, dẫn tới độ đồng nhất ánh sáng chưa đạt trend mới.
- Ngữ nghĩa trạng thái (status/label/priority) đã được chuẩn hóa trong template, còn ở Beqeek vẫn gán màu thủ công theo từng component nên rất khó đồng bộ.
- Các thành phần cốt lõi (Button, Input, Card) trong template có shadow, chiều cao, bán kính và hành vi focus cụ thể nhưng code hiện tại chưa áp dụng (ví dụ shadow kép của nút mặc định, Input text-base + shadow-xs…).
- Spacing & border radius của template thiên về layout thoáng (`rounded-xl`, `py-6`) nhưng nhiều màn hình hiện tại vẫn dùng `p-4`, `rounded-md`, vì vậy cảm giác khối chưa “airy” như guideline.

## Bảng so sánh chi tiết

| Chủ đề                             | Template Task Management                                                                                                                     | Hệ thống hiện tại                                                                                                                                                                      | Khoảng cách & ảnh hưởng                                                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Mô hình màu & token**            | Dùng OKLCH cho tất cả token (`docs/UI/STYLE-GUIDE.md:18-134`), chart và sidebar có riêng từng màu sắc, đảm bảo nhận thức ánh sáng nhất quán. | Vẫn dùng HSL shadcn gốc và chỉ có một bộ biến (`packages/ui/src/styles/globals.css:14-80`); chart tone khác với template và không có bảng màu phụ cho trạng thái.                      | Không đạt chủ trương “perceptual uniformity”, khó tái tạo gradient & shadow mới của template; chuyển đổi theme nhìn “phẳng” hơn.         |
| **Status / Label / Priority**      | Màu sắc được chuẩn hóa (status: `docs/UI/STYLE-GUIDE.md:136-147`, label & priority: `docs/UI/STYLE-GUIDE.md:149-171`).                       | Các màu được gán trực tiếp ở component, ví dụ badge quick-filter (`apps/web/.../quick-filters-section.tsx:89-105`) và field type (`apps/web/.../fields-settings-section.tsx:322-331`). | Không có token trung tâm ⇒ cùng loại trạng thái nhưng màu khác nhau ở từng màn hình, khó chuyển sang dải màu mới nếu không refactor sâu. |
| **Button**                         | Default button yêu cầu nền `#242424`, shadow kép và focus ring 3px (`docs/UI/STYLE-GUIDE.md:358-416`).                                       | Component Button chỉ dùng `shadow-sm`/`shadow-xs`, không có inset shadow hay màu cố định (`packages/ui/src/components/button.tsx:7-31`).                                               | Giao diện thiếu “depth” như template, icon button cũng chưa có biến thể `icon-sm/icon-lg` như guideline.                                 |
| **Input**                          | Chiều cao `h-9`, text-base, shadow-xs và highlight selection (`docs/UI/STYLE-GUIDE.md:468-480`).                                             | Input hiện tại `h-10`, text-sm, không có `shadow-xs` hay xử lý `selection:bg-primary` (`packages/ui/src/components/input.tsx:5-22`).                                                   | Sự khác biệt kích thước & type scale khiến form nhìn lạc tone (template dùng text-base để cân bằng với card spacing).                    |
| **Card / layout spacing & radius** | Card chuẩn `rounded-xl` + `py-6`, metadata có border-dashed (`docs/UI/STYLE-GUIDE.md:460-510`, `docs/UI/STYLE-GUIDE.md:680-704`).            | Nhiều section vẫn `rounded-md` + `p-4` (ví dụ Fields Settings list, `apps/web/.../fields-settings-section.tsx:344-359`).                                                               | Cảm giác bố cục chưa đạt độ thoáng & hierarchy cao như template; việc thiếu `border-dashed` và `rounded-lg-xl` khiến thẻ bị “square”.    |

## Phân tích chi tiết & khuyến nghị

1. **Chuẩn hóa token sang OKLCH trước khi tinh chỉnh component**
   - Tái định nghĩa `--background`, `--primary`, chart & sidebar theo giá trị trong template để tận dụng độ sáng/độ bão hòa mới (`docs/UI/STYLE-GUIDE.md:18-134`).
   - Giữ tên biến hiện tại để tránh thay đổi lớn về API, chỉ cập nhật giá trị trong `packages/ui/src/styles/globals.css`.

2. **Tạo bảng màu ngữ nghĩa dùng chung**
   - Đưa bảng status/label/priority vào một module (ví dụ `packages/ui/src/tokens/status-colors.ts`) dựa trên màu ở `docs/UI/STYLE-GUIDE.md:136-180`.
   - Refactor các component đang dùng lớp Tailwind thủ công (`apps/web/.../quick-filters-section.tsx:89-105`, `apps/web/.../fields-settings-section.tsx:322-331`) để dùng token mới ⇒ giảm sai khác màu khi đổi theme.

3. **Nâng cấp Button & Input để khớp micro-interaction**
   - Button: bổ sung shadow kép/inset và biến thể `icon-sm`, `icon-lg` theo guideline (`docs/UI/STYLE-GUIDE.md:358-407`) cùng focus ring `[3px]`.
   - Input: điều chỉnh chiều cao xuống `h-9`, text-base, thêm `shadow-xs` & `selection:bg-primary` (`docs/UI/STYLE-GUIDE.md:468-480`) thay vì setup hiện tại (`packages/ui/src/components/input.tsx:5-22`).

4. **Cập nhật spacing & radius mặc định của layout container**
   - Nâng `--radius` lên 10px (~0.625rem) để `rounded-lg`/`rounded-xl` phản ánh đúng scale (`docs/UI/STYLE-GUIDE.md:680-704`).
   - Rà soát các section như Fields Settings/Quick Filters để áp dụng `py-6`, `border-dashed` và `rounded-xl` theo mô tả card (`docs/UI/STYLE-GUIDE.md:460-507`) nhằm tạo cảm giác thoáng.

5. **Thiết lập checklist áp dụng**
   - Khi tạo component mới, bắt buộc so chiếu với bảng tóm tắt trên để bảo đảm token, spacing, shadow và màu trạng thái đều lấy từ nguồn chuẩn.
   - Có thể thêm linter (ví dụ custom ESLint rule) để cảnh báo khi gặp màu “thủ công” (`text-green-600`, `bg-pink-100`, …) nhằm giữ consistency lâu dài.

## Kết luận

Hệ thống Beqeek hiện vẫn dựa trên baseline shadcn nên chưa thể hiện được ngôn ngữ thiết kế đậm chất Task Management (thể hiện qua OKLCH palette, shadow sâu và status palette rõ ràng). Việc chuẩn hóa token và refactor các component cốt lõi theo các khuyến nghị trên sẽ giúp sản phẩm bắt kịp xu hướng thiết kế hiện tại mà không cần đại tu toàn bộ UI lập tức.
