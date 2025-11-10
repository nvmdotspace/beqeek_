**Title:** **Refactor the Workspace User Listing Integration Flow**

**Goal:** Optimize API calls for fetching workspace users and ensure proper mapping of assigned users within the system's record management flow.

**Current State & Issues:**

1.  **Record Creation Dialog:** Opening the "Create Record" dialog currently triggers an immediate API call to apps/web/src/features/workspace-users/hooks/use-get-workspace-users.ts. Ref create record apps/web/src/features/active-tables/components/record-form/create-record-dialog.tsx
2.  **Record List Page:** The "List Records" page requires mapping the `assignedUserIds` field (present in each record) to actual user names fetched from the aforementioned workspace user API for display (e.g., showing the "Responsible Person" name). Ref: apps/web/src/features/active-tables/pages/active-table-records-page.tsx

**Integration and Optimization Requirements:**

1.  **Integration:** Integrate the list of workspace users and use it to map/display users based on the `assignedUserIds` list found in each record object.
2.  **Optimization:** **Crucially, optimize the API call for list users inworkspace`**. Ensure this API is **not** called repeatedly every time the "Create Record" dialog is opened. The user list should ideally be fetched once (e.g., when the main "List Records" page loads) and then reused (cached) for subsequent actions, including opening the creation dialog.

---
