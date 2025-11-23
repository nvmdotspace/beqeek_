import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FORM_URL = 'https://app.o1erp.com/platform/forms/732878538910205325/019952f6-f3f5-57-7a-a6c362a6933141a3';
const WEBHOOK_URL =
  'https://app.o1erp.com/api/workspace/732878538910205325/webhook/post/workflows/01995753-6941-93-70-be12f8844a6a01a1';

export function SignupModal({ isOpen, onClose }: SignupModalProps) {
  // Track modal open event
  useEffect(() => {
    if (isOpen) {
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'open_signup_modal',
          client: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      }).catch(console.error);
    }
  }, [isOpen]);

  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-[hsl(222_37%_10%)] rounded-2xl border border-white/10 w-full max-w-2xl shadow-2xl transform transition-all overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/5">
            <h3 id="modal-title" className="text-lg font-semibold text-white">
              Đăng Ký / Chọn Gói
            </h3>
            <button type="button" className="text-slate-400 hover:text-white transition-colors" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form iframe */}
          <div className="h-[600px] bg-[hsl(222_47%_7%)]">
            <iframe src={FORM_URL} className="w-full h-full border-0" title="Signup Form" />
          </div>
        </div>
      </div>
    </div>
  );
}
