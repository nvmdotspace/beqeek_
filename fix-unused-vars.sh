#!/bin/bash
# Script to automatically prefix unused variables with underscore

# Fix comment-item.tsx
sed -i '' 's/currentUserId/_currentUserId/g' apps/web/src/features/active-tables/components/comment-item.tsx

# Fix encryption-key-prompt.tsx  
sed -i '' 's/tableId: string/_tableId: string/g' apps/web/src/features/active-tables/components/encryption-key-prompt.tsx
sed -i '' 's/const isLoading/const _isLoading/g' apps/web/src/features/active-tables/components/encryption-key-prompt.tsx
sed -i '' 's/const error/const _error/g' apps/web/src/features/active-tables/components/encryption-key-prompt.tsx

# Fix rich-comment-editor.tsx
sed -i '' 's/workspaceUsers:/_workspaceUsers:/g' apps/web/src/features/active-tables/components/rich-comment-editor.tsx
sed -i '' 's/onImageUpload/_onImageUpload/g' apps/web/src/features/active-tables/components/rich-comment-editor.tsx
sed -i '' 's/const editorRef/const _editorRef/g' apps/web/src/features/active-tables/components/rich-comment-editor.tsx

# Fix detail-view-settings-section.tsx
sed -i '' 's/COMMENTS_POSITION_BOTTOM/_COMMENTS_POSITION_BOTTOM/g' apps/web/src/features/active-tables/components/settings/views/detail-view-settings-section.tsx

# Fix use-update-record-field.ts
sed -i '' 's/data: any/_data: any/g' apps/web/src/features/active-tables/hooks/use-update-record-field.ts
sed -i '' 's/, fieldConfig/, _fieldConfig/g' apps/web/src/features/active-tables/hooks/use-update-record-field.ts

# Fix use-update-record.ts
sed -i '' 's/, context/, _context/g' apps/web/src/features/active-tables/hooks/use-update-record.ts

# Fix use-update-table-config.ts
sed -i '' 's/type ExtendedRecordDetailConfig/type _ExtendedRecordDetailConfig/g' apps/web/src/features/active-tables/hooks/use-update-table-config.ts

# Fix record-detail-page.tsx
sed -i '' 's/refetchRecord/_refetchRecord/g' apps/web/src/features/active-tables/pages/record-detail-page.tsx

# Fix teams-page.tsx
sed -i '' 's/const totalMembers/const _totalMembers/g' apps/web/src/features/team/pages/teams-page.tsx

# Fix connection-status-badge.tsx
sed -i '' 's/const totalFields/const _totalFields/g' apps/web/src/features/workflow-connectors/components/connection-status-badge.tsx

# Fix connector-config-form.tsx
sed -i '' 's/const schema/const _schema/g' apps/web/src/features/workflow-connectors/components/connector-config-form.tsx

# Fix create-connector-dialog.tsx
sed -i '' 's/const formState/const _formState/g' apps/web/src/features/workflow-connectors/components/create-connector-dialog.tsx

# Fix workflow-forms-list.tsx
sed -i '' 's/const locale = /const _locale = /g' apps/web/src/features/workflow-forms/pages/workflow-forms-list.tsx
sed -i '' 's/const navigate = /const _navigate = /g' apps/web/src/features/workflow-forms/pages/workflow-forms-list.tsx

# Fix dagre-layout.test.ts
sed -i '' 's/const start = /const _start = /g' apps/web/src/features/workflow-units/__tests__/dagre-layout.test.ts

# Fix nested-workflow-integration.test.ts
sed -i '' 's/const edges = /const _edges = /g' apps/web/src/features/workflow-units/__tests__/nested-workflow-integration.test.ts

# Fix yaml-editor.tsx
# No change needed - empty interface warning

# Fix workflow-unit-detail.tsx
sed -i '' 's/const nodes = /const _nodes = /g' apps/web/src/features/workflow-units/pages/workflow-unit-detail.tsx
sed -i '' 's/const edges = /const _edges = /g' apps/web/src/features/workflow-units/pages/workflow-unit-detail.tsx
sed -i '' 's/const children = /const _children = /g' apps/web/src/features/workflow-units/pages/workflow-unit-detail.tsx
sed -i '' 's/const loops = /const _loops = /g' apps/web/src/features/workflow-units/pages/workflow-unit-detail.tsx

# Fix canvas-slice.ts
sed -i '' 's/(set, get)/(set, _get)/g' apps/web/src/features/workflow-units/stores/slices/canvas-slice.ts

# Fix selection-slice.ts
sed -i '' 's/(set, get, api)/(set, _get, api)/g' apps/web/src/features/workflow-units/stores/slices/selection-slice.ts

# Fix branch-layout.ts
sed -i '' 's/const nodeMap/const _nodeMap/g' apps/web/src/features/workflow-units/utils/branch-layout.ts

# Fix ir-to-reactflow.ts (workflow-units)
sed -i '' 's/, total)/, _total)/g' apps/web/src/features/workflow-units/utils/ir-to-reactflow.ts

# Fix reactflow-to-ir.ts (workflow-units)
sed -i '' 's/const isCompoundNode/const _isCompoundNode/g' apps/web/src/features/workflow-units/utils/reactflow-to-ir.ts
sed -i '' 's/, nodes)/, _nodes)/g' apps/web/src/features/workflow-units/utils/reactflow-to-ir.ts

# Fix ir-to-reactflow.ts (workflows)
sed -i '' 's/, total)/, _total)/g' apps/web/src/features/workflows/utils/ir-to-reactflow.ts

# Fix reactflow-to-ir.ts (workflows)
sed -i '' 's/, nodes)/, _nodes)/g' apps/web/src/features/workflows/utils/reactflow-to-ir.ts

# Fix workspace-dashboard.tsx
sed -i '' 's/const subtitle/const _subtitle/g' apps/web/src/features/workspace/pages/workspace-dashboard.tsx

echo "✅ All unused variables have been prefixed with underscore"
