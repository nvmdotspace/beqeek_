# Sidebar User Flows - Chi tiết trải nghiệm từng tương tác

## 🎯 Mục tiêu tài liệu
Ghi lại chi tiết flow trải nghiệm người dùng khi tương tác với từng element trong sidebar.

---

## 📱 MOBILE FLOWS (< 768px)

### Flow 1: Mở Sidebar trên Mobile
```
1. User ở trang chính → Sidebar ẩn hoàn toàn
2. User click hamburger menu (☰) → Sidebar slide in từ trái
3. Backdrop xuất hiện với opacity 0.5
4. Sidebar hiển thị full width với nút đóng (✕) ở góc trên phải
5. User có thể scroll trong sidebar nếu content dài
```

**UX Considerations:**
- Animation: 300ms ease-out
- Z-index: 50 để đè lên content
- Backdrop click → đóng sidebar
- ESC key → đóng sidebar

### Flow 2: Navigation trên Mobile
```
1. User click vào bất kỳ navigation item
2. Sidebar tự động đóng (slide out)
3. Page navigation xảy ra
4. User được đưa đến trang mới
```

**UX Considerations:**
- Auto-close để không block view
- Loading state trong quá trình navigation
- Breadcrumb để user biết vị trí hiện tại

---

## 💻 TABLET FLOWS (768px - 1024px)

### Flow 3: Auto-collapse trên Tablet
```
1. User resize từ desktop → tablet
2. Sidebar tự động collapse
3. Chỉ hiển thị icons, ẩn text labels
4. Width giảm từ 280px → 64px
5. Tooltips xuất hiện khi hover icons
```

**UX Considerations:**
- Smooth transition: 250ms
- Tooltip delay: 500ms
- Icon size: 20px (touch-friendly)

### Flow 4: Hover Interactions trên Tablet
```
1. User hover vào collapsed icon
2. Tooltip xuất hiện với label text
3. Background highlight: hover:bg-accent
4. User click → navigation xảy ra
5. Active state: bg-accent với border-left accent
```

---

## 🖥️ DESKTOP FLOWS (> 1024px)

### Flow 5: Full Sidebar Experience
```
1. Sidebar hiển thị đầy đủ: icons + labels + badges
2. User hover → subtle background change
3. User click → immediate navigation
4. Active state persistent với visual indicator
5. Badges hiển thị notifications count
```

**UX Considerations:**
- No auto-collapse
- Rich visual feedback
- Keyboard navigation support
- Focus management

---

## 🔧 SPECIFIC BUTTON FLOWS

### QUICKACTIONS Section

#### Flow 6: New Table Button
```
User Journey:
1. User click "sidebar.newTable" (+ icon)
2. Modal/drawer mở để tạo table mới
3. Form validation real-time
4. Success → redirect to new table
5. Error → inline error messages

States:
- Default: + icon với "sidebar.newTable" label
- Hover: bg-accent, slight scale transform
- Active: pressed state với darker background
- Loading: spinner replace icon
```

#### Flow 7: Search Button
```
User Journey:
1. User click "sidebar.search" (🔍 icon)
2. Search modal/overlay xuất hiện
3. Auto-focus vào search input
4. Real-time search suggestions
5. Click result → navigate to item

States:
- Default: search icon
- Hover: highlight background
- Active: search modal open
- Focus: keyboard shortcut (Cmd+K)
```

### NAVIGATION Section

#### Flow 8: Dashboard Navigation
```
User Journey:
1. User click "sidebar.dashboard" (🏠 icon)
2. Loading state nếu cần fetch data
3. Dashboard page load với widgets
4. Sidebar active state update

Visual States:
- Default: home icon + label
- Hover: background accent
- Active: bg-accent + border-left-4 accent
- Loading: subtle spinner
```

#### Flow 9: Tables with Badge
```
User Journey:
1. User thấy "sidebar.tables" với badge "12"
2. Badge indicates 12 active tables
3. User click → Tables listing page
4. Badge có thể update real-time

Badge Behavior:
- Count > 99 → "99+"
- Count = 0 → badge ẩn
- New items → badge animation (pulse)
- Color: bg-primary, text-primary-foreground
```

#### Flow 10: Team Navigation
```
User Journey:
1. User click "sidebar.team" (👥 icon)
2. Team management page load
3. Member list, roles, permissions
4. Collaborative features access

States:
- Default: users icon
- Hover: team preview tooltip (optional)
- Active: current team highlighted
- Offline members: grayed out
```

#### Flow 11: Analytics Dashboard
```
User Journey:
1. User click "sidebar.analytics" (📊 icon)
2. Analytics dashboard load
3. Charts, metrics, reports
4. Real-time data updates

Performance:
- Lazy load charts
- Progressive data loading
- Cache frequently accessed data
```

#### Flow 12: Calendar with Events
```
User Journey:
1. User thấy "sidebar.calendar" với badge "3"
2. Badge = 3 upcoming events today
3. User click → Calendar view
4. Today's events highlighted

Badge Logic:
- Today's events count
- Overdue events: red badge
- Upcoming: blue badge
- Update every hour
```

#### Flow 13: Messages with Notifications
```
User Journey:
1. User thấy "sidebar.messages" với badge "5"
2. Badge = 5 unread messages
3. User click → Messages inbox
4. Unread messages highlighted

Real-time Updates:
- WebSocket for new messages
- Badge animation for new items
- Sound notification (optional)
- Desktop notifications
```

### WORKSPACE Section

#### Flow 14: Starred Items
```
User Journey:
1. User click "sidebar.starred" (⭐ icon)
2. Starred/favorited items list
3. Quick access to important content
4. Star/unstar functionality

Features:
- Drag to reorder
- Categories for starred items
- Search within starred
- Export starred list
```

#### Flow 15: Projects with Count
```
User Journey:
1. User thấy "sidebar.projects" với badge "8"
2. Badge = 8 active projects
3. User click → Projects overview
4. Project cards với status

Project States:
- Active: green indicator
- Paused: yellow indicator
- Completed: gray indicator
- Overdue: red indicator
```

#### Flow 16: Archived Items
```
User Journey:
1. User click "sidebar.archived" (📦 icon)
2. Archived content listing
3. Restore/permanently delete options
4. Search archived items

Archive Features:
- Auto-archive old items
- Bulk operations
- Archive reasons tracking
- Restore confirmations
```

#### Flow 17: Settings Navigation
```
User Journey:
1. User click "sidebar.settings" (⚙️ icon)
2. Settings page với tabs
3. Account, preferences, security
4. Real-time save indicators

Settings Categories:
- Profile settings
- Notification preferences
- Security & privacy
- Integrations
- Billing (if applicable)
```

#### Flow 18: Help & Support
```
User Journey:
1. User click "sidebar.help" (❓ icon)
2. Help center/documentation
3. Search help articles
4. Contact support options

Help Features:
- Contextual help
- Video tutorials
- FAQ search
- Live chat support
- Ticket system
```

---

## 🎨 VISUAL FEEDBACK PATTERNS

### Hover States
```css
/* Consistent hover pattern */
.sidebar-item:hover {
  background: var(--accent);
  color: var(--accent-foreground);
  transition: all 200ms ease;
}
```

### Active States
```css
/* Active item indication */
.sidebar-item.active {
  background: var(--accent);
  border-left: 4px solid var(--primary);
  font-weight: 500;
}
```

### Badge Animations
```css
/* New notification pulse */
@keyframes badge-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

---

## 🔄 STATE MANAGEMENT

### Sidebar State
- `isOpen`: Boolean cho mobile sidebar
- `isCollapsed`: Boolean cho tablet/desktop
- `activeItem`: String cho current navigation
- `isMobile`: Boolean cho responsive logic

### Navigation State
- `currentRoute`: Active route tracking
- `breadcrumbs`: Navigation history
- `notifications`: Badge counts
- `userPreferences`: Sidebar customization

---

## 📊 ANALYTICS TRACKING

### Events to Track
1. `sidebar_item_click`: Track navigation usage
2. `sidebar_toggle`: Mobile open/close
3. `sidebar_hover`: Desktop hover interactions
4. `search_open`: Search feature usage
5. `badge_click`: Notification interactions

### Metrics to Monitor
- Most used navigation items
- Mobile vs desktop usage patterns
- Search feature adoption
- Time spent in each section
- User flow drop-off points

---

*Tài liệu này cung cấp blueprint chi tiết cho việc implement và test các user flows trong sidebar component.*