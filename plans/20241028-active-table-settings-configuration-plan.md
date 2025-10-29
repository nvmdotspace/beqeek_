# Active Table Settings/Configuration Screen Implementation Plan

## Overview
This document outlines the implementation plan for adding a Settings/Configuration screen to the Active Tables feature in Beqeek. The screen will allow users to view and manage table configuration settings, including encryption, display preferences, and search/sort options.

## Requirements Analysis

### Functional Requirements
1. **Access Point**: Settings button/link from table detail page or table card
2. **View Configuration**: Display all table configuration details
3. **Edit Configuration**: Allow editing of specific configuration fields
4. **Encryption Management**: Secure display and management of encryption keys
5. **Search Configuration**: Configure searchable fields (hashed keyword fields)
6. **Display Settings**: Configure record limits and sort preferences
7. **Validation**: Ensure data integrity and security during configuration updates

### Non-Functional Requirements
- Mobile responsive design
- Secure handling of encryption keys (never transmitted unnecessarily)
- Real-time validation feedback
- Consistent with existing UI patterns
- Support for Vietnamese and English localization

## Architecture Decision

### Component Structure: **Full Page with Tabbed Navigation**

After analyzing the existing codebase patterns and the reference screenshot, I recommend implementing a **full page settings screen** with tabbed navigation for the following reasons:

1. **Consistency**: Matches existing detail page pattern (`ActiveTableDetailPage`)
2. **Scalability**: Allows for future configuration sections to be added
3. **User Experience**: Provides ample space for complex configuration options
4. **Navigation**: Clear hierarchy with breadcrumb navigation back to table list/detail

### Navigation Flow
```
/workspaces/tables
  └── /workspaces/tables/$tableId (Table Detail)
      └── /workspaces/tables/$tableId/settings (NEW - Settings Page)
          ├── General Tab (default)
          ├── Fields Tab
          ├── Security Tab
          └── Advanced Tab
```

### State Management Approach
- **Server State**: React Query for fetching/updating table configuration
- **Local State**: useState for form field values and UI state
- **Global State**: Zustand for encryption key management (already exists)

## UI Component Breakdown

### Page Structure
```tsx
ActiveTableSettingsPage
├── PageHeader
│   ├── Breadcrumb Navigation
│   ├── Table Name & Description
│   └── Action Buttons (Save, Cancel)
├── TabNavigation
│   ├── General
│   ├── Fields
│   ├── Security
│   └── Advanced
└── TabContent (based on active tab)
    ├── GeneralSettingsTab
    ├── FieldsSettingsTab
    ├── SecuritySettingsTab
    └── AdvancedSettingsTab
```

### Component Hierarchy

#### 1. **ActiveTableSettingsPage** (New Page Component)
- Location: `/apps/web/src/features/active-tables/pages/active-table-settings-page.tsx`
- Responsibilities:
  - Fetch table configuration
  - Manage tab navigation state
  - Handle save/cancel actions
  - Coordinate data flow between tabs

#### 2. **Settings Tab Components** (New Components)
- Location: `/apps/web/src/features/active-tables/components/settings/`

##### GeneralSettingsTab
```tsx
// Fields to display/edit:
- Table ID (read-only)
- Table Name
- Description
- Work Group (dropdown)
- Table Type (dropdown)
- Record Limit (number input)
- Default Sort Direction (dropdown: newest/oldest)
```

##### FieldsSettingsTab
```tsx
// Display existing fields configuration
// Future: Add/edit/remove fields functionality
- Field list with type, required status
- Search configuration (hashedKeywordFields)
- Quick filters configuration
```

##### SecuritySettingsTab
```tsx
// Encryption and security settings
- Encryption Status (E2EE enabled/disabled)
- Encryption Key Display (masked by default)
- Encryption Auth Key (read-only, hashed)
- Key Rotation (future feature)
```

##### AdvancedSettingsTab
```tsx
// Advanced configuration options
- Kanban configurations
- Record list layout settings
- Permissions configuration
- Gantt chart settings
```

### Reusable Components

#### From `@workspace/ui`:
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`
- `Input`, `Label`, `Textarea`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Button`
- `Badge`
- `Alert`, `AlertDescription`
- `Switch`
- `Separator`
- `ScrollArea`

#### From existing Active Tables components:
- `EncryptionStatus` component
- Field type badges and icons
- Module icons (`getModuleIcon`, `getModuleColors`)

## Implementation Phases

### Phase 1: Basic Structure and Navigation (2-3 days)
1. Create route for settings page in `router.tsx`
2. Implement `ActiveTableSettingsPage` component
3. Add navigation from table detail page to settings
4. Set up tab navigation structure
5. Implement breadcrumb navigation

**Files to create:**
- `/apps/web/src/features/active-tables/pages/active-table-settings-page.tsx`
- `/apps/web/src/features/active-tables/components/settings/index.ts`

**Files to modify:**
- `/apps/web/src/router.tsx` - Add new route
- `/apps/web/src/features/active-tables/pages/active-table-detail-page.tsx` - Add settings button

### Phase 2: Read-Only Configuration Display (2 days)
1. Implement `GeneralSettingsTab` with read-only data
2. Display all configuration fields
3. Add proper formatting and labels
4. Implement loading and error states

**Files to create:**
- `/apps/web/src/features/active-tables/components/settings/general-settings-tab.tsx`
- `/apps/web/src/features/active-tables/components/settings/fields-settings-tab.tsx`
- `/apps/web/src/features/active-tables/components/settings/security-settings-tab.tsx`
- `/apps/web/src/features/active-tables/components/settings/advanced-settings-tab.tsx`

### Phase 3: Editable Fields Implementation (3 days)
1. Add form management with React Hook Form or TanStack Form
2. Implement field validation
3. Add save/cancel functionality
4. Implement optimistic updates with React Query

**Files to create:**
- `/apps/web/src/features/active-tables/hooks/use-table-settings.ts`
- `/apps/web/src/features/active-tables/components/settings/settings-form-fields.tsx`

**Files to modify:**
- `/apps/web/src/features/active-tables/api/active-tables-api.ts` - Add update configuration endpoint
- `/apps/web/src/features/active-tables/hooks/use-table-management.ts` - Extend with settings update

### Phase 4: Encryption Key Management (2 days)
1. Implement secure encryption key display (masked/unmasked toggle)
2. Add encryption key validation
3. Implement key rotation UI (if applicable)
4. Add security warnings and confirmations

**Files to create:**
- `/apps/web/src/features/active-tables/components/settings/encryption-key-field.tsx`
- `/apps/web/src/features/active-tables/components/settings/encryption-warning-dialog.tsx`

**Integration with existing:**
- Use `@workspace/encryption-core` utilities
- Integrate with `use-encryption-key.ts` hook

## API Integration Points

### Fetch Table Configuration
```typescript
// GET endpoint (via POST method as per API pattern)
POST /api/workspace/{workspaceId}/workflow/get/active_tables/{tableId}
```

### Update Table Configuration
```typescript
// UPDATE endpoint (via POST method)
POST /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}
Body: {
  data: {
    config: {
      tableLimit: number,
      defaultSort: string,
      hashedKeywordFields: string[],
      // Other configuration fields
    }
  }
}
```

### Request/Response Structure
```typescript
interface UpdateTableConfigRequest {
  data: {
    config: Partial<ActiveTableConfig>;
  };
}

interface UpdateTableConfigResponse {
  message: string;
  data?: ActiveTable;
}
```

## File Structure

```
apps/web/src/features/active-tables/
├── pages/
│   ├── active-tables-page.tsx
│   ├── active-table-detail-page.tsx
│   ├── active-table-records-page.tsx
│   └── active-table-settings-page.tsx (NEW)
├── components/
│   ├── settings/ (NEW)
│   │   ├── index.ts
│   │   ├── general-settings-tab.tsx
│   │   ├── fields-settings-tab.tsx
│   │   ├── security-settings-tab.tsx
│   │   ├── advanced-settings-tab.tsx
│   │   ├── settings-form-fields.tsx
│   │   ├── encryption-key-field.tsx
│   │   └── encryption-warning-dialog.tsx
│   └── ... (existing components)
├── hooks/
│   ├── use-table-settings.ts (NEW)
│   └── ... (existing hooks)
└── api/
    └── active-tables-api.ts (MODIFY - add settings endpoints)
```

## Key Implementation Considerations

### Security Concerns
1. **Encryption Key Display**:
   - Never log encryption keys
   - Implement masked display by default
   - Add copy-to-clipboard with security warning
   - Store in localStorage, never transmit unnecessarily

2. **Permissions**:
   - Check user permissions before allowing configuration changes
   - Disable editing for read-only users
   - Validate workspace membership

3. **Data Validation**:
   - Validate record limit (min: 1, max: 10000)
   - Ensure required fields are not removed
   - Validate encryption key format (32 characters)

### Validation Rules
```typescript
const validationRules = {
  name: { required: true, minLength: 1, maxLength: 255 },
  description: { maxLength: 1000 },
  tableLimit: { min: 1, max: 10000, default: 1000 },
  defaultSort: { enum: ['newest', 'oldest', 'asc', 'desc'] },
  encryptionKey: { length: 32, pattern: /^[a-zA-Z0-9]{32}$/ }
};
```

### Error Handling Strategy
1. Display inline validation errors
2. Show toast notifications for API errors
3. Implement retry logic for network failures
4. Provide clear error messages in Vietnamese and English

### Mobile Responsiveness
- Stack tabs vertically on mobile
- Use responsive grid layouts
- Implement touch-friendly controls
- Test on various screen sizes

## Testing Strategy

### Unit Tests
- Test validation logic
- Test encryption key handling
- Test form submission logic

### Integration Tests
- Test API integration
- Test data persistence
- Test navigation flow

### E2E Tests
- Test complete settings update flow
- Test encryption key management
- Test permission restrictions

## Risks and Mitigation

### Risk 1: Encryption Key Exposure
- **Mitigation**: Implement strict key masking, audit logging, and confirmation dialogs

### Risk 2: Configuration Conflicts
- **Mitigation**: Implement optimistic locking, show conflict resolution dialog

### Risk 3: Performance with Large Field Lists
- **Mitigation**: Implement virtual scrolling for fields list, pagination

### Risk 4: Backwards Compatibility
- **Mitigation**: Ensure all changes are backward compatible with existing tables

## TODO Checklist

### Phase 1: Basic Structure
- [ ] Create settings page route in router.tsx
- [ ] Implement ActiveTableSettingsPage component
- [ ] Add settings navigation button to table detail page
- [ ] Set up tab navigation structure
- [ ] Implement breadcrumb navigation
- [ ] Add loading and error states

### Phase 2: Read-Only Display
- [ ] Create GeneralSettingsTab component
- [ ] Create FieldsSettingsTab component
- [ ] Create SecuritySettingsTab component
- [ ] Create AdvancedSettingsTab component
- [ ] Fetch and display table configuration
- [ ] Add proper data formatting

### Phase 3: Edit Functionality
- [ ] Implement form management
- [ ] Add field validation
- [ ] Create save/cancel handlers
- [ ] Implement optimistic updates
- [ ] Add success/error notifications
- [ ] Test update functionality

### Phase 4: Encryption Management
- [ ] Create EncryptionKeyField component
- [ ] Implement key masking/unmasking
- [ ] Add security warnings
- [ ] Test encryption key updates
- [ ] Validate key format
- [ ] Implement key backup reminder

### Phase 5: Polish & Testing
- [ ] Add Vietnamese translations
- [ ] Implement mobile responsive design
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Perform accessibility audit
- [ ] Documentation update

## Success Criteria
1. Users can view all table configuration settings
2. Users can edit allowed configuration fields
3. Encryption keys are handled securely
4. Changes persist correctly to the backend
5. UI is responsive and accessible
6. All error cases are handled gracefully
7. Performance remains optimal with large configurations

## Next Steps
1. Review this plan with the team
2. Get design approval for UI mockups
3. Begin Phase 1 implementation
4. Set up feature flag for gradual rollout

## Notes
- Consider adding an audit log for configuration changes
- Future enhancement: Bulk configuration updates for multiple tables
- Consider adding configuration templates for common table types
- May need to coordinate with backend team for new API endpoints if needed