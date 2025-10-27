# Active Tables - User Flow & UI Documentation

## Tổng quan
Tài liệu này mô tả chi tiết user flow và UI implementation cho feature Active Tables trong hệ thống BEQEEK.

## 🎯 Mục tiêu chính
- Quản lý tables với cấu trúc dữ liệu linh hoạt
- CRUD operations cho tables và records
- Hỗ trợ encryption end-to-end (E2EE)
- UI/UX hiện đại với React 19 + TanStack

## 📱 User Flow Chính

### 1. Workspace Selection Flow
```
Landing Page → Workspace Dashboard → Active Tables List
```

**Bước 1: Chọn Workspace**
- User truy cập dashboard
- Chọn workspace từ dropdown
- System load active tables của workspace đó

**UI Components:**
- `WorkspaceSelector` dropdown
- Loading states
- Error handling

### 2. Active Tables Management Flow

#### 2.1 View Tables List
```
Active Tables Page → Table Cards Grid → Filter/Search
```

**Features:**
- ✅ Grid layout với responsive design
- ✅ Search functionality
- ✅ Filter by work groups
- ✅ Table cards với metadata
- ✅ Encryption status indicators

**UI Components:**
- `ActiveTablesPage` - Main container
- `ActiveTableCard` - Individual table display
- `ActiveTablesEmptyState` - Empty state
- Search input với debouncing
- Work group filter buttons

#### 2.2 Create New Table Flow
```
Tables List → "Create Table" Button → Table Management Dialog → Configure Fields → Save
```

**Bước thực hiện:**
1. Click "Create Table" button
2. Mở `TableManagementDialog`
3. Nhập basic information:
   - Table name (required)
   - Description (optional)
   - Work group selection (required)
   - Table type selection
4. Configure security:
   - Enable/disable E2EE
   - Set encryption key (optional)
5. Configure fields:
   - Add fields với dynamic types
   - Set field properties (label, name, type, required)
   - Reorder fields với drag & drop
6. Save table

**UI Components:**
- `TableManagementDialog` - Main dialog
- `FieldEditor` - Field configuration
- Form validation với TanStack Form
- Dynamic field type selection

#### 2.3 Edit Existing Table Flow
```
Table Card → Actions Menu → "Edit Table" → Table Management Dialog → Update → Save
```

**Features:**
- ✅ Pre-populate form với existing data
- ✅ Modify fields configuration
- ✅ Update security settings
- ✅ Validation và error handling

#### 2.4 Delete Table Flow
```
Table Card → Actions Menu → "Delete Table" → Confirmation → Delete
```

**Safety measures:**
- ✅ Confirmation dialog
- ✅ Warning về data loss
- ✅ Prevent accidental deletion

### 3. Table Details & Records Management Flow

#### 3.1 View Table Details
```
Table Card → "View Details" → Table Detail Page → Field Summary
```

**Features:**
- ✅ Table metadata display
- ✅ Field definitions với types
- ✅ Encryption status
- ✅ Field options preview
- ✅ Navigation to records

**UI Components:**
- `ActiveTableDetailPage`
- `FieldSummary` components
- Encryption badges
- Field type indicators

#### 3.2 Records Management Flow
```
Table Details → "Open Records" → Records Page → CRUD Operations
```

**View Records:**
- ✅ Table layout với responsive design
- ✅ Dynamic columns based on fields
- ✅ Pagination support
- ✅ Search functionality (placeholder)
- ✅ Actions menu per record

**Create Record:**
```
Records Page → "Create Record" → Record Management Dialog → Fill Form → Save
```

**Features:**
- ✅ Dynamic form generation based on table fields
- ✅ Field type-specific inputs:
  - Text inputs (SHORT_TEXT, EMAIL, URL, PHONE)
  - Textarea (RICH_TEXT)
  - Number inputs (INTEGER, NUMERIC)
  - Date/DateTime pickers
  - Boolean switches
  - Select dropdowns (SELECT_ONE)
- ✅ Form validation
- ✅ Required field indicators

**Edit Record:**
```
Records Table → Actions Menu → "Edit Record" → Pre-filled Dialog → Update → Save
```

**Delete Record:**
```
Records Table → Actions Menu → "Delete Record" → Confirmation → Delete
```

## 🎨 UI Design System

### Color Scheme
- **Primary**: Blue tones cho actions
- **Secondary**: Gray tones cho metadata
- **Success**: Green cho successful operations
- **Destructive**: Red cho delete actions
- **Warning**: Orange cho encryption warnings

### Typography
- **Headings**: Font weights 600-700
- **Body**: Font weight 400
- **Labels**: Font weight 500
- **Metadata**: Font weight 400, muted colors

### Spacing
- **Base unit**: 8px
- **Component padding**: 16px, 24px
- **Card spacing**: 24px gaps
- **Form spacing**: 16px between fields

### Components Architecture

#### Layout Components
```
ActiveTablesPage
├── Header (title, search, filters)
├── Actions Bar (create button, refresh)
├── Content Grid
│   ├── ActiveTableCard[]
│   └── EmptyState (if no tables)
└── TableManagementDialog (modal)
```

#### Dialog Components
```
TableManagementDialog
├── DialogHeader (title, description)
├── Form Sections
│   ├── Basic Information
│   ├── Security Settings
│   └── Fields Configuration
│       └── FieldEditor[]
└── DialogFooter (cancel, save)
```

#### Record Components
```
ActiveTableRecordsPage
├── Header (breadcrumb, actions)
├── RecordsTable
│   ├── Dynamic Headers
│   ├── Record Rows
│   │   ├── Field Values
│   │   └── Actions Menu
│   └── Pagination
└── RecordManagementDialog (modal)
```

## 🔧 Technical Implementation

### State Management
- **React Query**: Server state caching
- **TanStack Form**: Form state management
- **Local State**: UI state (dialogs, editing)

### API Integration
- **Tables CRUD**: Create, Read, Update, Delete tables
- **Records CRUD**: Create, Read, Update, Delete records
- **Real-time updates**: Query invalidation
- **Error handling**: User-friendly messages

### Validation
- **Client-side**: Form validation với TanStack Form
- **Server-side**: API response validation
- **Type safety**: TypeScript interfaces

### Performance
- **Lazy loading**: Components và data
- **Pagination**: Large datasets
- **Debouncing**: Search inputs
- **Caching**: React Query optimization

## 📊 User Experience Features

### Accessibility
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ ARIA labels
- ✅ Focus management
- ✅ Color contrast compliance

### Responsive Design
- ✅ Mobile-first approach
- ✅ Tablet optimization
- ✅ Desktop full features
- ✅ Touch-friendly interactions

### Loading States
- ✅ Skeleton loaders
- ✅ Button loading states
- ✅ Progressive loading
- ✅ Error boundaries

### Feedback Systems
- ✅ Success notifications
- ✅ Error messages
- ✅ Confirmation dialogs
- ✅ Progress indicators

## 🚀 Advanced Features (Planned)

### Comments System
- Real-time comments on records
- Markdown support
- Mention functionality
- Comment permissions

### Custom Actions
- Workflow triggers
- Bulk operations
- Custom buttons
- Action history

### Advanced Views
- Kanban board view
- Gantt chart view
- Calendar view
- Dashboard widgets

### Data Operations
- Import/Export functionality
- Bulk edit operations
- Advanced filtering
- Data validation rules

## 📈 Metrics & Analytics

### User Engagement
- Table creation rate
- Record operations frequency
- Feature usage patterns
- Error rates

### Performance Metrics
- Page load times
- API response times
- User interaction latency
- Success rates

## 🔒 Security Considerations

### Data Protection
- End-to-end encryption support
- Field-level encryption
- Key management
- Access control

### User Permissions
- Role-based access
- Team permissions
- Record-level security
- Audit logging

## 📝 Development Notes

### Code Organization
```
src/features/active-tables/
├── api/                 # API layer
├── components/          # UI components
├── hooks/              # Custom hooks
├── pages/              # Page components
└── types.ts            # TypeScript types
```

### Testing Strategy
- Unit tests cho components
- Integration tests cho flows
- E2E tests cho critical paths
- Performance testing

### Future Enhancements
- Real-time collaboration
- Advanced search
- Data visualization
- Mobile app support

---

## 🎯 Kết luận

Feature Active Tables đã được triển khai với:
- **85% core functionality** hoàn thành
- **Modern UI/UX** với React 19
- **Type-safe** development
- **Responsive design** cho mọi device
- **Extensible architecture** cho future features

User flow được thiết kế để intuitive và efficient, đảm bảo users có thể dễ dàng quản lý data structures phức tạp mà không cần technical knowledge.
