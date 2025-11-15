import Embed from '@yoopta/embed';
import Image from '@yoopta/image';
import Video from '@yoopta/video';
import File from '@yoopta/file';

/**
 * Placeholder upload handler for media plugins
 * Creates local object URLs - Replace in Phase 05 with real upload provider
 */
const placeholderUpload = async (file: File) => {
  console.warn(
    '[beqeek-editor] Media upload not configured. Implement upload provider in Phase 05. Using object URL for preview.',
  );
  return {
    src: URL.createObjectURL(file),
    alt: file.name,
    sizes: {
      width: 800,
      height: 600,
    },
  };
};

/**
 * Media plugins with placeholder upload handlers
 * Includes: Embed, Image, Video, File
 *
 * NOTE: Upload handlers use object URLs in this phase.
 * In Phase 05, replace with MediaUploadProvider abstraction.
 */
export function getMediaPlugins() {
  return [
    Embed,
    Image.extend({
      options: {
        onUpload: placeholderUpload,
      },
    }),
    Video.extend({
      options: {
        onUpload: placeholderUpload,
        onUploadPoster: placeholderUpload,
      },
    }),
    File.extend({
      options: {
        onUpload: async (file: File) => {
          console.warn('[beqeek-editor] File upload not configured. Using object URL for preview.');
          const src = URL.createObjectURL(file);
          return {
            src,
            format: file.type.split('/')[1] || 'file',
            name: file.name,
            size: file.size,
          };
        },
      },
    }),
  ];
}
