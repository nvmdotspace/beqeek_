/**
 * Lexical Image Plugin
 *
 * Week 3: Image upload support for rich text editor
 *
 * Features:
 * - Image upload via file picker
 * - Drag and drop support
 * - Image size validation (max 5MB)
 * - Image type validation (PNG, JPG, GIF, WebP)
 * - Loading states
 * - Error handling
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes } from 'lexical';
import { $createImageNode, ImageNode } from './nodes/image-node.js';
import { useCallback, useEffect } from 'react';

export interface ImagePluginProps {
  /** Function to upload image and return URL */
  onImageUpload?: (file: File) => Promise<string>;
  /** Maximum file size in bytes (default: 5MB) */
  maxSize?: number;
  /** Allowed image types */
  allowedTypes?: string[];
  /** Disabled state */
  disabled?: boolean;
}

export function ImagePlugin({
  onImageUpload,
  maxSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  disabled = false,
}: ImagePluginProps) {
  const [editor] = useLexicalComposerContext();

  // Handle image upload
  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!onImageUpload) {
        throw new Error('Image upload handler not provided');
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          `Invalid file type. Only ${allowedTypes.map((t) => t.replace('image/', '')).join(', ')} are allowed.`,
        );
      }

      // Validate file size
      if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / 1024 / 1024);
        throw new Error(`File too large. Maximum size is ${maxSizeMB}MB.`);
      }

      try {
        const imageUrl = await onImageUpload(file);
        return imageUrl;
      } catch (error) {
        console.error('Image upload failed:', error);
        throw new Error('Failed to upload image. Please try again.');
      }
    },
    [onImageUpload, allowedTypes, maxSize],
  );

  // Insert image into editor
  const insertImage = useCallback(
    async (file: File) => {
      if (disabled) return;

      try {
        // Show loading placeholder
        editor.update(() => {
          const imageNode = $createImageNode({
            src: '',
            altText: 'Uploading...',
            maxWidth: 800,
          });
          $insertNodes([imageNode]);
        });

        // Upload image
        const imageUrl = await handleImageUpload(file);

        // Replace placeholder with actual image
        editor.update(() => {
          const imageNode = $createImageNode({
            src: imageUrl,
            altText: file.name,
            maxWidth: 800,
          });
          $insertNodes([imageNode]);
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        alert(errorMessage);
      }
    },
    [editor, disabled, handleImageUpload],
  );

  // Handle file input
  const handleFileInput = useCallback(() => {
    if (disabled || !onImageUpload) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = allowedTypes.join(',');

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await insertImage(file);
      }
    };

    input.click();
  }, [disabled, onImageUpload, allowedTypes, insertImage]);

  // Register image upload command
  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagePlugin: ImageNode not registered on editor');
    }

    // Custom command for image upload
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      () => {
        handleFileInput();
        return true;
      },
      0, // Priority
    );
  }, [editor, handleFileInput]);

  // Handle drag and drop
  useEffect(() => {
    if (disabled || !onImageUpload) return;

    const handleDrop = async (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const file = event.dataTransfer?.files[0];
      if (file && file.type.startsWith('image/')) {
        await insertImage(file);
      }
    };

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const editorElement = editor.getRootElement();
    if (editorElement) {
      editorElement.addEventListener('drop', handleDrop);
      editorElement.addEventListener('dragover', handleDragOver);

      return () => {
        editorElement.removeEventListener('drop', handleDrop);
        editorElement.removeEventListener('dragover', handleDragOver);
      };
    }
  }, [editor, disabled, onImageUpload, insertImage]);

  return null;
}

// Command type for image insertion
import { createCommand, LexicalCommand } from 'lexical';

export const INSERT_IMAGE_COMMAND: LexicalCommand<void> = createCommand('INSERT_IMAGE_COMMAND');
