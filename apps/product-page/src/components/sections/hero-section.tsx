import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onOpenModal: () => void;
}

export function HeroSection({ onOpenModal }: HeroSectionProps) {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content (Left) */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-medium mb-6 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-blue" />
              </span>
              SaaS Tùy Chỉnh Hiện Đại
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-[1.15]">
              Vận Hành Quy Trình Kinh Doanh, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue via-accent-purple to-accent-teal text-glow">
                Tự Động Hoá Mượt Mà
              </span>
            </h1>

            <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-lg">
              Sản phẩm phần mềm tùy chỉnh, tự thiết lập theo nhu cầu, bảo mật cao và quản lý hàng trăm nghiệp vụ doanh
              nghiệp một cách dễ dàng.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onOpenModal}
                className="h-12 px-8 rounded-full bg-accent-blue text-white font-bold text-base flex items-center justify-center hover:bg-accent-blue/90 transition-all shadow-lg shadow-accent-blue/20"
              >
                Đăng ký dùng thử miễn phí
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>

            {/* System Metrics */}
            <div className="mt-10 pt-8 border-t border-white/5">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Uptime SLA</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">E2EE</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Mã Hoá</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Global</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Hạ Tầng</div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Content (Right) */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent-blue to-accent-purple rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000" />
            <div className="relative rounded-2xl bg-[hsl(222_47%_7%)] border border-white/10 shadow-2xl overflow-hidden transform transition-transform duration-700 hover:scale-[1.02]">
              {/* Browser Chrome */}
              <div className="h-8 bg-[hsl(222_37%_10%)] border-b border-white/5 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="ml-4 px-3 py-0.5 rounded bg-black/30 text-[10px] text-slate-500 font-mono border border-white/5 flex-1 text-center">
                  app.beqeek.com/dashboard
                </div>
              </div>
              {/* Dashboard Image */}
              <img
                src="/assets/saas_multiview_dashboard.png"
                alt="BEQEEK Multiview Dashboard"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
