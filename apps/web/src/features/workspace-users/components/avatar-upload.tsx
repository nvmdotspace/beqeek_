import { useRef, useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@workspace/ui/components/dialog';
import { Box, Inline } from '@workspace/ui/components/primitives';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useUploadAvatar } from '../hooks/use-upload-avatar';
import { getUserInitials } from '../utils/user-initials';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

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

  // Cleanup preview URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

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
      toast.error(m.userProfile_avatar_invalidType());
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(m.userProfile_avatar_fileTooLarge());
      return;
    }

    // Create preview using object URL (more efficient than FileReader)
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setSelectedFile(file);
    setDialogOpen(true);

    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadAvatar(selectedFile);
    }
  };

  const handleClose = () => {
    if (!isPending) {
      setDialogOpen(false);
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(null);
      setSelectedFile(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <>
      <Box
        className="relative group cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={m.userProfile_avatar_changeAvatar()}
      >
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={currentAvatar || undefined} alt={fullName || m.userProfile_avatar_userAvatar()} />
          <AvatarFallback className="text-xl">{getUserInitials(fullName)}</AvatarFallback>
        </Avatar>
        <Box className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="h-6 w-6 text-white" />
        </Box>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="sr-only"
          aria-label={m.userProfile_avatar_uploadImage()}
        />
      </Box>

      <Dialog open={dialogOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{m.userProfile_avatar_updateTitle()}</DialogTitle>
          </DialogHeader>
          <Inline justify="center" className="py-[var(--space-300)]">
            {preview && (
              <img
                src={preview}
                alt={m.userProfile_avatar_preview()}
                className="w-40 h-40 rounded-full object-cover border-4 border-muted"
              />
            )}
          </Inline>
          <DialogFooter>
            <Inline space="space-100" justify="end">
              <Button variant="outline" onClick={handleClose} disabled={isPending}>
                {m.userProfile_avatar_cancel()}
              </Button>
              <Button onClick={handleUpload} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? m.userProfile_avatar_uploading() : m.userProfile_avatar_upload()}
              </Button>
            </Inline>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
