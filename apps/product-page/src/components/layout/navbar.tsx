import { useState, useEffect } from 'react';

interface NavbarProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function Navbar({ onLogin, onSignup }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed w-full top-0 z-50 glass border-b-0 transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple text-white shadow-lg shadow-accent-blue/25">
              <span className="text-lg font-bold">B</span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">BEQEEK</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            <a
              href="#features"
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              Đặc Điểm
            </a>
            <a
              href="#benefits"
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              Lợi Ích
            </a>
            <a
              href="#pricing"
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              Giá
            </a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <button
              onClick={onLogin}
              className="hidden md:inline-flex items-center justify-center px-5 py-2 text-sm font-medium rounded-full text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Đăng Nhập
            </button>
            <button
              onClick={onSignup}
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold rounded-full text-white bg-accent-blue hover:bg-accent-blue/90 shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] transition-all hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.6)]"
            >
              Đăng Ký
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
