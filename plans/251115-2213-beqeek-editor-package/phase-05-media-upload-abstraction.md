# Phase 05: Media Upload Abstraction Layer

**Parent Plan:** [plan.md](./plan.md)
**Phase:** 05/07
**Dependencies:** Phase 04 (Tools & Marks complete)

## Context

Replace hardcoded Cloudinary upload handlers with abstracted media upload provider interface. Enable apps/web to inject custom upload logic (Cloudinary, S3, local storage, etc.) without modifying package code.

**Reference Files:**

- `/docs/yoopta-editor/large_document_code.md` (lines 108-155) - Cloudinary upload pattern

## Overview

**Date:** 2025-11-15
**Description:** Abstract media upload handlers for Image, Video, File plugins
**Priority:** P1 - Extensibility requirement
**Implementation Status:** Not Started
**Review Status:** Pending

## Key Insights

1. **Plugin Upload Options:** Image, Video, File plugins accept `onUpload`, `onUploadPoster` callbacks
2. **Return Value Contracts:** Each plugin expects specific return shape (src, alt, sizes, format, etc.)
3. **Provider Interface:** Define upload provider interface that apps implement (not package)
4. **Default Fallback:** Provide no-op or blob URL handler when no provider configured
5. **Type Safety:** Upload handlers must match plugin type expectations
6. **Async Upload:** All handlers are async (support network requests)

## Requirements

### Functional Requirements

- [x] MediaUploadProvider interface definition
- [x] ImageUploadHandler, VideoUploadHandler, FileUploadHandler types
- [x] getMediaPlugins() accepts optional upload provider
- [x] Default no-op upload handler (blob URLs for preview)
- [x] Provider injection via BeqeekEditor props or plugin config
- [x] TypeScript contracts for upload return values

### Non-Functional Requirements

- Type-safe upload handler signatures
- Zero package dependency on Cloudinary or other providers
- Support multiple providers (S3, Cloudinary, local, etc.)
- Error handling for upload failures
- Progress callbacks (optional - for future enhancement)

## Architecture

### Upload Provider Interface

```typescript
// types/media.ts
export interface ImageUploadResult {
  src: string;
  alt?: string;
  sizes?: {
    width: number;
    height: number;
  };
}

export interface VideoUploadResult {
  src: string;
  alt?: string;
  sizes?: {
    width: number;
    height: number;
  };
}

export interface VideoPosterUploadResult {
  src: string;
}

export interface FileUploadResult {
  src: string;
  format: string;
  name: string;
  size: number;
}

export interface MediaUploadProvider {
  uploadImage?: (file: File) => Promise<ImageUploadResult>;
  uploadVideo?: (file: File) => Promise<VideoUploadResult>;
  uploadVideoPoster?: (file: File) => Promise<VideoPosterUploadResult>;
  uploadFile?: (file: File) => Promise<FileUploadResult>;
}
```

### Default Provider (Blob URLs)

```typescript
// utils/default-upload-provider.ts
import type { MediaUploadProvider } from '../types/media.js';

/**
 * Default upload provider using blob URLs (client-side only, no persistence).
 * Replace with actual upload provider in production.
 */
export const defaultMediaUploadProvider: MediaUploadProvider = {
  uploadImage: async (file: File) => {
    console.warn('Using default blob URL provider. Configure MediaUploadProvider for production.');
    return {
      src: URL.createObjectURL(file),
      alt: file.name,
      sizes: {
        width: 800,
        height: 600,
      },
    };
  },

  uploadVideo: async (file: File) => {
    console.warn('Using default blob URL provider. Configure MediaUploadProvider for production.');
    return {
      src: URL.createObjectURL(file),
      alt: file.name,
      sizes: {
        width: 1280,
        height: 720,
      },
    };
  },

  uploadVideoPoster: async (file: File) => {
    console.warn('Using default blob URL provider. Configure MediaUploadProvider for production.');
    return {
      src: URL.createObjectURL(file),
    };
  },

  uploadFile: async (file: File) => {
    console.warn('Using default blob URL provider. Configure MediaUploadProvider for production.');
    return {
      src: URL.createObjectURL(file),
      format: file.type.split('/')[1] || 'file',
      name: file.name,
      size: file.size,
    };
  },
};
```

### Media Plugins with Provider Injection

```typescript
// plugins/media.ts (update from Phase 03)
import Embed from '@yoopta/embed';
import Image from '@yoopta/image';
import Video from '@yoopta/video';
import File from '@yoopta/file';
import type { MediaUploadProvider } from '../types/media.js';
import { defaultMediaUploadProvider } from '../utils/default-upload-provider.js';

export function getMediaPlugins(uploadProvider: MediaUploadProvider = defaultMediaUploadProvider) {
  return [
    Embed,
    Image.extend({
      options: {
        onUpload: uploadProvider.uploadImage || defaultMediaUploadProvider.uploadImage!,
      },
    }),
    Video.extend({
      options: {
        onUpload: uploadProvider.uploadVideo || defaultMediaUploadProvider.uploadVideo!,
        onUploadPoster: uploadProvider.uploadVideoPoster || defaultMediaUploadProvider.uploadVideoPoster!,
      },
    }),
    File.extend({
      options: {
        onUpload: uploadProvider.uploadFile || defaultMediaUploadProvider.uploadFile!,
      },
    }),
  ];
}
```

### Updated Default Config with Provider Support

```typescript
// plugins/default.ts (update)
import { getTypographyPlugins } from './typography.js';
import { getListPlugins } from './lists.js';
import { getStructuralPlugins } from './structural.js';
import { getMediaPlugins } from './media.js';
import { getCodePlugin } from './code.js';
import { getDefaultTools } from '../tools/index.js';
import { getDefaultMarks } from '../marks/index.js';
import type { EditorConfig } from '../types/editor.js';
import type { MediaUploadProvider } from '../types/media.js';

export function getDefaultEditorConfig(mediaUploadProvider?: MediaUploadProvider): EditorConfig {
  return {
    plugins: [
      ...getTypographyPlugins(),
      ...getListPlugins(),
      ...getStructuralPlugins(),
      getCodePlugin(),
      ...getMediaPlugins(mediaUploadProvider),
    ],
    tools: getDefaultTools(),
    marks: getDefaultMarks(),
  };
}
```

### Example: Cloudinary Provider Implementation (in apps/web)

```typescript
// apps/web/src/utils/cloudinary-upload-provider.ts
import type { MediaUploadProvider } from '@workspace/beqeek-editor/types';
import { uploadToCloudinary } from './cloudinary'; // Existing utility

export const cloudinaryUploadProvider: MediaUploadProvider = {
  uploadImage: async (file: File) => {
    const data = await uploadToCloudinary(file, 'image');
    return {
      src: data.secure_url,
      alt: file.name,
      sizes: {
        width: data.width,
        height: data.height,
      },
    };
  },

  uploadVideo: async (file: File) => {
    const data = await uploadToCloudinary(file, 'video');
    return {
      src: data.secure_url,
      alt: file.name,
      sizes: {
        width: data.width,
        height: data.height,
      },
    };
  },

  uploadVideoPoster: async (file: File) => {
    const data = await uploadToCloudinary(file, 'image');
    return {
      src: data.secure_url,
    };
  },

  uploadFile: async (file: File) => {
    const data = await uploadToCloudinary(file, 'auto');
    return {
      src: data.secure_url,
      format: data.format,
      name: file.name,
      size: data.bytes,
    };
  },
};
```

### Usage in apps/web

```typescript
// apps/web/src/features/documents/pages/editor.tsx
import { BeqeekEditor, createBeqeekEditor, getDefaultEditorConfig } from '@workspace/beqeek-editor';
import { cloudinaryUploadProvider } from '@/utils/cloudinary-upload-provider';
import { useMemo } from 'react';

export function DocumentEditor() {
  const editor = useMemo(() => createBeqeekEditor(), []);
  const config = useMemo(
    () => getDefaultEditorConfig(cloudinaryUploadProvider),
    []
  );

  return (
    <BeqeekEditor
      editor={editor}
      plugins={config.plugins}
      tools={config.tools}
      marks={config.marks}
    />
  );
}
```

## Related Code Files

**New Files (Create):**

- `/packages/beqeek-editor/src/types/media.ts`
- `/packages/beqeek-editor/src/utils/default-upload-provider.ts`

**Update Files:**

- `/packages/beqeek-editor/src/plugins/media.ts` - Add uploadProvider parameter
- `/packages/beqeek-editor/src/plugins/default.ts` - Add mediaUploadProvider parameter
- `/packages/beqeek-editor/src/types/index.ts` - Export media types
- `/packages/beqeek-editor/src/utils/index.ts` - Export default provider

**Example Files (Create in apps/web):**

- `/apps/web/src/utils/cloudinary-upload-provider.ts` - Cloudinary implementation

**Reference Files:**

- `/docs/yoopta-editor/large_document_code.md`
- `/apps/web/src/utils/cloudinary.ts` (if exists)

## Implementation Steps

### Step 1: Define Media Upload Types

```typescript
// types/media.ts
export interface ImageUploadResult {
  src: string;
  alt?: string;
  sizes?: {
    width: number;
    height: number;
  };
}

export interface VideoUploadResult {
  src: string;
  alt?: string;
  sizes?: {
    width: number;
    height: number;
  };
}

export interface VideoPosterUploadResult {
  src: string;
}

export interface FileUploadResult {
  src: string;
  format: string;
  name: string;
  size: number;
}

export interface MediaUploadProvider {
  uploadImage?: (file: File) => Promise<ImageUploadResult>;
  uploadVideo?: (file: File) => Promise<VideoUploadResult>;
  uploadVideoPoster?: (file: File) => Promise<VideoPosterUploadResult>;
  uploadFile?: (file: File) => Promise<FileUploadResult>;
}

export type ImageUploadHandler = (file: File) => Promise<ImageUploadResult>;
export type VideoUploadHandler = (file: File) => Promise<VideoUploadResult>;
export type FileUploadHandler = (file: File) => Promise<FileUploadResult>;
```

### Step 2: Implement Default Upload Provider

Create `utils/default-upload-provider.ts` with blob URL fallbacks (see Architecture section above).

### Step 3: Update getMediaPlugins()

Modify `plugins/media.ts` to accept `MediaUploadProvider` parameter:

```typescript
export function getMediaPlugins(uploadProvider: MediaUploadProvider = defaultMediaUploadProvider) {
  // Implementation as shown in Architecture section
}
```

### Step 4: Update getDefaultEditorConfig()

Modify `plugins/default.ts` to accept optional `mediaUploadProvider`:

```typescript
export function getDefaultEditorConfig(mediaUploadProvider?: MediaUploadProvider): EditorConfig {
  // Implementation as shown in Architecture section
}
```

### Step 5: Update Type Exports

```typescript
// types/index.ts
export type { EditorValue, BeqeekEditorProps, EditorConfig } from './editor.js';
export type { ToolsConfig, MarksArray } from './tools.js';
export type {
  MediaUploadProvider,
  ImageUploadResult,
  VideoUploadResult,
  VideoPosterUploadResult,
  FileUploadResult,
  ImageUploadHandler,
  VideoUploadHandler,
  FileUploadHandler,
} from './media.js';
```

### Step 6: Update Utility Exports

```typescript
// utils/index.ts
export { defaultMediaUploadProvider } from './default-upload-provider.js';
```

### Step 7: Update README with Provider Examples

```markdown
## Media Upload Configuration

### Using Default Provider (Blob URLs - Development Only)

const config = getDefaultEditorConfig(); // No provider = blob URLs

### Using Custom Provider (Production)

import { getDefaultEditorConfig } from '@workspace/beqeek-editor';
import type { MediaUploadProvider } from '@workspace/beqeek-editor/types';

const myUploadProvider: MediaUploadProvider = {
uploadImage: async (file) => {
const url = await uploadToS3(file);
return { src: url, alt: file.name, sizes: { width: 800, height: 600 } };
},
uploadVideo: async (file) => {
const url = await uploadToS3(file);
return { src: url, alt: file.name, sizes: { width: 1280, height: 720 } };
},
uploadVideoPoster: async (file) => {
const url = await uploadToS3(file);
return { src: url };
},
uploadFile: async (file) => {
const url = await uploadToS3(file);
return { src: url, format: 'pdf', name: file.name, size: file.size };
},
};

const config = getDefaultEditorConfig(myUploadProvider);

### Cloudinary Example

See `/apps/web/src/utils/cloudinary-upload-provider.ts` for Cloudinary implementation.
```

### Step 8: Create Cloudinary Provider in apps/web

```typescript
// apps/web/src/utils/cloudinary-upload-provider.ts
// Full implementation as shown in Architecture section
```

### Step 9: Test Upload Abstraction

In apps/web test page:

```tsx
import { BeqeekEditor, createBeqeekEditor, getDefaultEditorConfig } from '@workspace/beqeek-editor';
import { cloudinaryUploadProvider } from '@/utils/cloudinary-upload-provider';
import { useMemo } from 'react';

export function TestMediaUpload() {
  const editor = useMemo(() => createBeqeekEditor(), []);
  const config = useMemo(() => getDefaultEditorConfig(cloudinaryUploadProvider), []);

  return (
    <div className="p-8">
      <h1>Media Upload Test</h1>
      <BeqeekEditor editor={editor} plugins={config.plugins} tools={config.tools} marks={config.marks} />
    </div>
  );
}
```

**Test Checklist:**

- [ ] Upload image → Cloudinary URL returned, image displays
- [ ] Upload video → Cloudinary URL returned, video plays
- [ ] Upload video poster → Poster image displays
- [ ] Upload file → File link functional
- [ ] Test without provider → Blob URLs work (console warning shown)
- [ ] Test upload failure → Error handled gracefully

### Step 10: Validate Build

```bash
pnpm --filter @workspace/beqeek-editor build
pnpm --filter @workspace/beqeek-editor check-types
pnpm --filter web build # Verify apps/web uses provider correctly
```

## Todo

- [ ] Define MediaUploadProvider interface and result types
- [ ] Implement defaultMediaUploadProvider with blob URLs
- [ ] Update getMediaPlugins() to accept uploadProvider parameter
- [ ] Update getDefaultEditorConfig() to accept mediaUploadProvider parameter
- [ ] Update type exports (media.ts types)
- [ ] Update utility exports (default provider)
- [ ] Add provider usage examples to README
- [ ] Create cloudinaryUploadProvider in apps/web
- [ ] Test image upload with Cloudinary
- [ ] Test video upload with Cloudinary
- [ ] Test file upload with Cloudinary
- [ ] Test default provider fallback (blob URLs)
- [ ] Validate build and type-check

## Success Criteria

- [x] MediaUploadProvider interface fully typed
- [x] Default provider works with blob URLs (dev/testing)
- [x] getMediaPlugins() accepts custom provider
- [x] Cloudinary provider implemented in apps/web
- [x] Image, Video, File uploads functional with Cloudinary
- [x] Upload failures handled gracefully
- [x] Zero hardcoded upload logic in package
- [x] Documentation includes provider examples
- [x] TypeScript strict mode with zero errors

## Risk Assessment

**Low Risk: Upload Interface Design**

- Upload return types match Yoopta plugin expectations
- **Mitigation:** Use exact types from reference implementation

**Medium Risk: Upload Error Handling**

- Network failures, file size limits, format validation
- **Mitigation:** Wrap upload calls in try/catch, return default values on error

**Low Risk: Blob URL Cleanup**

- Blob URLs need revoking to prevent memory leaks
- **Mitigation:** Document in README that blob URLs are dev-only, production providers should persist

**Negligible Risk: Provider Optional Handlers**

- Some providers may only implement uploadImage, not video/file
- **Mitigation:** Fallback to defaultMediaUploadProvider for missing handlers

## Security Considerations

- **File Type Validation:** Upload provider should validate MIME types (app responsibility)
- **File Size Limits:** Provider should enforce max file size (app responsibility)
- **URL Sanitization:** Ensure returned URLs are safe (use trusted CDN URLs)
- **Authentication:** Upload providers may require API keys (stored in app env vars, not package)
- **CORS:** Ensure upload endpoints allow browser uploads

## Unresolved Questions

1. Should we provide S3 upload provider example in addition to Cloudinary? (Document pattern, not implement)
2. Do we need upload progress callbacks? (Defer to future enhancement - add to interface later)
3. Should upload errors show toast notifications? (App responsibility, not package)

## Next Steps

1. Complete all implementation steps
2. Test upload abstraction with Cloudinary in apps/web
3. Validate default provider fallback
4. Commit with message: `feat(beqeek-editor): abstract media upload with provider interface`
5. Proceed to **Phase 06: TypeScript Types & Exports** for final type polish
