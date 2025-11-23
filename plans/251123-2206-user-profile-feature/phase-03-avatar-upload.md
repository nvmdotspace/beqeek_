# Phase 3: Avatar Upload

## Context

- [swagger.yaml](/docs/swagger.yaml) - `/api/file/post/temp-files` endpoint (line 2048-2085)
- [swagger.yaml](/docs/swagger.yaml) - `/api/user/patch/me` with `avatarUpload` field (line 872-914)
- [user-profile-page.tsx](/apps/web/src/features/workspace-users/pages/user-profile-page.tsx) - From Phase 2

## Overview

| Field    | Value       |
| -------- | ----------- |
| Date     | 2025-11-23  |
| Priority | Medium      |
| Status   | ✅ Complete |
| Effort   | 3 hours     |

Implement avatar upload using temp files API, then update user profile.

## Key Insights

1. **Two-step upload**:
   - Step 1: Upload file to `/api/file/post/temp-files` → returns `data.paths[]`
   - Step 2: Update profile with `avatarUpload: paths[0]` via `/api/user/patch/me`
2. **FormData format**: `data[files][]` as multipart/form-data
3. **Response schema**: `TempFilesUploadResponse = { httpCode, status, data: { paths: string[] } }`
4. **Backend processing**: Backend moves temp file to permanent storage and generates thumbnail

## Requirements

### Functional

- [ ] Click avatar to trigger file picker
- [ ] Preview selected image before upload
- [ ] Upload to temp files API
- [ ] Update profile with temp path
- [ ] Show upload progress
- [ ] Handle errors gracefully

### Non-Functional

- [ ] Accept image types: JPG, PNG, GIF, WebP
- [ ] Max file size: 5MB (frontend validation)
- [ ] Compress/resize before upload if >2MB
- [ ] Accessible: keyboard navigable

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Avatar Upload Flow                        │
├─────────────────────────────────────────────────────────────┤
│  1. User clicks avatar                                      │
│     ↓                                                       │
│  2. File picker opens (accept="image/*")                   │
│     ↓                                                       │
│  3. Preview modal shows selected image                      │
│     ↓                                                       │
│  4. User confirms → upload to temp files                    │
│     POST /api/file/post/temp-files                         │
│     Body: FormData { 'data[files][]': File }               │
│     Response: { data: { paths: ['temp/abc123'] } }         │
│     ↓                                                       │
│  5. Update profile with avatarUpload path                   │
│     POST /api/user/patch/me                                │
│     Body: { data: { avatarUpload: 'temp/abc123' } }        │
│     ↓                                                       │
│  6. Invalidate cache → avatar updates                       │
└─────────────────────────────────────────────────────────────┘
```

## Related Code Files

| File                                                            | Purpose               |
| --------------------------------------------------------------- | --------------------- |
| `apps/web/src/shared/api/http-client.ts`                        | HTTP client with auth |
| `apps/web/src/features/workspace-users/api/user-profile-api.ts` | From Phase 2          |
| `packages/ui/src/components/avatar.tsx`                         | Avatar component      |
| `packages/ui/src/components/dialog.tsx`                         | Dialog for preview    |

## Implementation Steps

### Step 1: Create temp files API

```typescript
// apps/web/src/features/workspace-users/api/temp-files-api.ts
import { apiRequest } from '@/shared/api/http-client';

interface TempFilesUploadResponse {
  httpCode: number;
  status: string;
  data: {
    paths: string[];
  };
}

export const uploadTempFiles = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('data[files][]', file);
  });

  const response = await apiRequest<TempFilesUploadResponse>({
    url: '/api/file/post/temp-files',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.paths;
};
```

### Step 2: Create upload avatar hook

```typescript
// apps/web/src/features/workspace-users/hooks/use-upload-avatar.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadTempFiles } from '../api/temp-files-api';
import { updateUserProfile } from '../api/user-profile-api';
import { toast } from '@workspace/ui/components/sonner';

interface UploadAvatarOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useUploadAvatar(options?: UploadAvatarOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Upload to temp storage
      const paths = await uploadTempFiles([file]);
      if (!paths.length) {
        throw new Error('Failed to upload file');
      }

      // Step 2: Update profile with temp path
      await updateUserProfile({ avatarUpload: paths[0] });

      return paths[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
      toast.success('Avatar updated successfully');
      options?.onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload avatar');
      options?.onError?.(error);
    },
  });
}
```

### Step 3: Create avatar upload component

```typescript
// apps/web/src/features/workspace-users/components/avatar-upload.tsx
import { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@workspace/ui/components/dialog';
import { Camera, Loader2 } from 'lucide-react';
import { useUploadAvatar } from '../hooks/use-upload-avatar';
import { getUserInitials } from '../utils/user-initials';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  fullName?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function AvatarUpload({ currentAvatar, fullName, size = 'lg' }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { mutate: uploadAvatar, isPending } = useUploadAvatar({
    onSuccess: () => {
      setDialogOpen(false);
      setPreview(null);
      setSelectedFile(null);
    },
  });

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Please select a valid image file (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setSelectedFile(file);
      setDialogOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadAvatar(selectedFile);
    }
  };

  return (
    <>
      <div className="relative group cursor-pointer" onClick={() => inputRef.current?.click()}>
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={currentAvatar || undefined} />
          <AvatarFallback className="text-xl">
            {getUserInitials(fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="h-6 w-6 text-white" />
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="sr-only"
          aria-label="Upload avatar"
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Avatar</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Step 4: Integrate with profile page

```tsx
// Update user-profile-page.tsx Profile Header
import { AvatarUpload } from '../components/avatar-upload';

// Replace static Avatar with:
<AvatarUpload currentAvatar={user.thumbnailAvatar || user.avatar} fullName={user.fullName} size="lg" />;
```

### Step 5: Export from index

```typescript
// apps/web/src/features/workspace-users/index.ts
export { AvatarUpload } from './components/avatar-upload';
export { useUploadAvatar } from './hooks/use-upload-avatar';
```

## Todo List

- [ ] Create `temp-files-api.ts` with upload function
- [ ] Create `use-upload-avatar.ts` hook
- [ ] Create `avatar-upload.tsx` component
- [ ] Integrate component with profile page
- [ ] Add file type validation
- [ ] Add file size validation
- [ ] Add loading state UI
- [ ] Add error handling
- [ ] Export from feature index
- [ ] Test upload flow end-to-end

## Success Criteria

- [ ] User can click avatar to open file picker
- [ ] Preview shows before upload
- [ ] Upload succeeds and avatar updates
- [ ] Invalid file types rejected with message
- [ ] Large files rejected with message
- [ ] Loading spinner shows during upload
- [ ] Error toast shows on failure
- [ ] Cache invalidated after success

## Risk Assessment

| Risk                                    | Likelihood | Impact | Mitigation                |
| --------------------------------------- | ---------- | ------ | ------------------------- |
| Large file upload timeout               | Medium     | Medium | Add frontend compression  |
| Temp file expires before profile update | Low        | Medium | Chain requests atomically |
| CORS issues with multipart              | Low        | High   | Verify backend config     |
| Memory leak from preview URL            | Medium     | Low    | Revoke URL on cleanup     |

## Security Considerations

- File type validation both frontend and backend
- Max file size enforced
- No direct file path exposure to user
- Temp files auto-expire (backend handles)

## Future Enhancements (Out of Scope)

- Image cropping/resizing tool
- Drag-and-drop upload
- Webcam capture
- Remove avatar option

## Next Steps

→ Feature complete - proceed to testing and QA
