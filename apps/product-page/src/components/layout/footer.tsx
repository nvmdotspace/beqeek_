import { Twitter, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[hsl(222_60%_3%)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white font-bold">
              B
            </div>
            <span className="text-xl font-bold text-white">BEQEEK</span>
          </div>
          <div className="text-slate-300 text-sm text-center md:text-left">
            &copy; 2025 BEQEEK. Tất cả quyền được bảo lưu.
            <br />
            Liên hệ: support@beqeek.com
          </div>
          <div className="flex gap-6">
            <a
              href="https://twitter.com/beqeek"
              aria-label="Theo dõi BEQEEK trên Twitter"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Twitter className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="https://github.com/beqeek"
              aria-label="Xem mã nguồn BEQEEK trên GitHub"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Github className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
