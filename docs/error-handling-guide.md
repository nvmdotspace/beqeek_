# Error Handling Guide

Comprehensive guide for handling and displaying errors in the Beqeek web application.

## Overview

The application implements a robust error handling system that distinguishes between:

- **Controlled Errors (4xx)**: Client errors with specific messages from the backend
- **System Errors (5xx)**: Server errors with generic user-friendly messages
- **Network Errors**: Connection issues and timeouts

## Architecture

### Error Classification

```typescript
type ApiErrorType = 'client' | 'server' | 'network' | 'unknown';
```

**Client Errors (4xx)**:

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Validation Error
- 429 Too Many Requests

**Server Errors (5xx)**:

- 500 Internal Server Error
- 502 Bad Gateway
- 503 Service Unavailable
- 504 Gateway Timeout

**Network Errors**:

- Connection refused
- Timeout
- No internet connection

## Core Components

### 1. ApiError Class

Enhanced error class with automatic classification and user-friendly messages.

```typescript
import { ApiError } from '@/shared/api/api-error';

// Automatically created by HTTP client
const error = new ApiError('You do not have permission to view records in this table.', 403, details);

// Properties
error.status; // 403
error.type; // 'client'
error.title; // 'Access Denied'
error.description; // 'You do not have permission...'
error.message; // Backend message (for 4xx) or generic (for 5xx)

// Methods
error.isClientError(); // true
error.isServerError(); // false
error.isNetworkError(); // false
error.toLogString(); // '[CLIENT] 403: You do not have permission...'
```

### 2. Error Display Components

#### ErrorAlert - Inline Error Display

Use for form validation, section errors, etc.

```typescript
import { ErrorAlert } from '@/components/error-display';

<ErrorAlert
  error={error}
  onRetry={() => refetch()}
  className="mb-4"
/>
```

**Features**:

- Compact inline display
- Conditional retry button (only for server/network errors)
- Color-coded by error type
- Icon based on error type

#### ErrorCard - Full-Page Error Display

Use for page-level errors, route errors, etc.

```typescript
import { ErrorCard } from '@/components/error-display';

<ErrorCard
  error={error}
  onRetry={() => refetch()}
  onBack={() => navigate(-1)}
  showDetails={import.meta.env.DEV}
/>
```

**Features**:

- Large, prominent display
- Retry and back buttons
- Technical details (dev mode only)
- Status code display
- Color-coded by error type

#### ErrorMessage - Minimal Text Display

Use for space-constrained areas.

```typescript
import { ErrorMessage } from '@/components/error-display';

<ErrorMessage error={error} className="text-sm" />
```

### 3. Error Utilities

```typescript
import {
  toApiError,
  getErrorMessage,
  getErrorTitle,
  shouldShowRetry,
  logError,
  formatErrorForToast,
  isForbiddenError,
  isNotFoundError,
  isAuthError,
  isValidationError,
} from '@/shared/utils/error-utils';

// Convert any error to ApiError
const apiError = toApiError(error);

// Get user-friendly message
const message = getErrorMessage(error);

// Check if should show retry
if (shouldShowRetry(error)) {
  // Show retry button
}

// Log error appropriately
logError(error, 'TableDetailPage');

// Format for toast
const { title, description, variant } = formatErrorForToast(error);
toast({ title, description, variant });

// Check specific error types
if (isForbiddenError(error)) {
  // Handle permission error
}

if (isValidationError(error)) {
  // Handle validation error
}
```

### 4. Error Boundary

Catch React component errors.

```typescript
import { ErrorBoundary } from '@/components/error-boundary';

<ErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling
    logError(error, 'ComponentTree');
  }}
>
  <YourComponents />
</ErrorBoundary>
```

### 5. Route Error Component

Automatically handles route-level errors.

```typescript
// Already configured in __root.tsx
export const Route = createRootRoute({
  errorComponent: ({ error }) => <RouteError error={error} />,
});
```

## Usage Patterns

### Pattern 1: React Query Error Handling

```typescript
const { data, error, isLoading, refetch } = useActiveTable(workspaceId, tableId);

if (isLoading) {
  return <LoadingState />;
}

if (error) {
  return (
    <ErrorCard
      error={error}
      onRetry={() => refetch()}
      onBack={() => navigate(-1)}
    />
  );
}

// Render data
return <TableDetail data={data} />;
```

### Pattern 2: Mutation Error Handling

```typescript
const mutation = useMutation({
  mutationFn: updateTable,
  onError: (error) => {
    const { title, description, variant } = formatErrorForToast(error);
    toast({ title, description, variant });

    logError(error, 'UpdateTable');
  },
  onSuccess: () => {
    toast({ title: 'Success', description: 'Table updated' });
  },
});
```

### Pattern 3: Form Validation Errors

```typescript
const handleSubmit = async (data) => {
  try {
    await api.createTable(data);
  } catch (error) {
    if (isValidationError(error)) {
      // Show inline error
      setFormError(error);
    } else {
      // Show toast for other errors
      const { title, description } = formatErrorForToast(error);
      toast({ title, description, variant: 'destructive' });
    }
  }
};

return (
  <form onSubmit={handleSubmit}>
    {/* Form fields */}
    {formError && <ErrorAlert error={formError} />}
    <Button type="submit">Submit</Button>
  </form>
);
```

### Pattern 4: Conditional Actions Based on Error Type

```typescript
if (error) {
  const apiError = toApiError(error);

  if (apiError.isClientError()) {
    // Handle 4xx errors - user action needed
    if (isForbiddenError(error)) {
      return <PermissionDenied />;
    }

    if (isNotFoundError(error)) {
      return <NotFound />;
    }

    // Show error message without retry
    return <ErrorCard error={error} onBack={goBack} />;
  }

  if (apiError.isServerError() || apiError.isNetworkError()) {
    // Handle 5xx/network - show retry
    return <ErrorCard error={error} onRetry={refetch} />;
  }
}
```

## Backend Error Response Format

### Controlled Errors (4xx)

Backend should return errors in this format:

```json
{
  "message": "You do not have permission to view records in this table.",
  "code": "PERMISSION_DENIED",
  "details": {
    "resource": "table",
    "action": "view",
    "tableId": "123"
  }
}
```

The frontend will:

- Extract `message` field
- Display it directly to users
- Use status code for classification
- Store details for debugging

### System Errors (5xx)

For server errors, backend can return any format:

```json
{
  "error": "Internal server error",
  "trace": "...",
  "timestamp": "2025-11-07T..."
}
```

The frontend will:

- **NOT** show the backend message to users
- Display generic user-friendly message:
  > "An unexpected error occurred on our servers. Please try again later or contact support if the problem persists."
- Log full error details for debugging

## Error Messages by Status Code

### Client Errors (4xx)

| Status | Title                   | Message Source        |
| ------ | ----------------------- | --------------------- |
| 400    | Invalid Request         | Backend message field |
| 401    | Authentication Required | Backend message field |
| 403    | Access Denied           | Backend message field |
| 404    | Not Found               | Backend message field |
| 409    | Conflict                | Backend message field |
| 422    | Validation Error        | Backend message field |
| 429    | Too Many Requests       | Backend message field |

### Server Errors (5xx)

| Status | Title        | Message                              |
| ------ | ------------ | ------------------------------------ |
| 500+   | Server Error | Generic friendly message (see above) |

### Network Errors

| Type          | Title            | Message                                  |
| ------------- | ---------------- | ---------------------------------------- |
| Timeout       | Connection Error | Unable to connect to the server...       |
| No connection | Connection Error | Please check your internet connection... |

## Visual Design

### Error Colors

- **Client Errors (4xx)**: Red (`border-destructive`, `text-destructive`)
- **Server Errors (5xx)**: Orange (`border-orange-500`, `text-orange-600`)
- **Network Errors**: Yellow (`border-yellow-500`, `text-yellow-600`)

### Error Icons

- **Client Errors**: `XCircle`
- **Server Errors**: `ServerCrash`
- **Network Errors**: `WifiOff`
- **Generic**: `AlertCircle`

## Testing

### Manual Testing

```typescript
// Simulate different error types
throw new ApiError('Permission denied', 403); // Client error
throw new ApiError('Server error', 500); // Server error
throw new ApiError('Connection error', 0); // Network error
```

### Error Scenarios to Test

1. **403 Forbidden**
   - Navigate to restricted resource
   - Verify: Shows backend message, no retry button

2. **404 Not Found**
   - Access non-existent resource
   - Verify: Shows "Not Found" with back button

3. **500 Server Error**
   - Trigger server error
   - Verify: Shows generic message, retry button appears

4. **Network Timeout**
   - Disable internet, try API call
   - Verify: Shows network error, retry button appears

5. **422 Validation Error**
   - Submit invalid form
   - Verify: Shows validation messages inline

## Best Practices

### DO ✅

- Use `ErrorCard` for page-level errors
- Use `ErrorAlert` for inline/section errors
- Always provide `onRetry` for server/network errors
- Log errors with context: `logError(error, 'ComponentName')`
- Use error utilities for consistent handling
- Show technical details only in development
- Extract message from backend for 4xx errors
- Use generic message for 5xx errors

### DON'T ❌

- Don't show technical error messages to users for 5xx
- Don't show retry button for client errors (4xx)
- Don't log client errors in production
- Don't expose stack traces to users
- Don't use raw error messages without classification
- Don't ignore error types - handle appropriately

## Migration Guide

### Updating Existing Error Handling

**Before:**

```typescript
if (error) {
  return <div className="text-red-500">{error.message}</div>;
}
```

**After:**

```typescript
if (error) {
  return <ErrorAlert error={error} onRetry={refetch} />;
}
```

**Before:**

```typescript
toast.error(error.message);
```

**After:**

```typescript
const { title, description, variant } = formatErrorForToast(error);
toast({ title, description, variant });
```

## Future Enhancements

- [ ] Error tracking service integration (Sentry, LogRocket)
- [ ] Offline error queue and retry
- [ ] Error analytics dashboard
- [ ] Internationalization of error messages
- [ ] Custom error pages per status code
- [ ] Error recovery suggestions
- [ ] Network status indicator

## References

- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [Error Handling Best Practices](https://www.nngroup.com/articles/error-message-guidelines/)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
