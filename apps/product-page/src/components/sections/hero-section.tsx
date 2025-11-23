import { ArrowRight } from 'lucide-react';
import { Container } from '@workspace/ui/components/primitives';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Button } from '@workspace/ui/components/button';

interface HeroSectionProps {
  onSignup: () => void;
}

export function HeroSection({ onSignup }: HeroSectionProps) {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden">
      <Container maxWidth="xl" padding="margin" className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content (Left) */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-medium mb-6 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-blue" />
              </span>
              SaaS Tùy Chỉnh Hiện Đại
            </div>

            {/* Hero Heading */}
            <Heading level={1} className="text-4xl md:text-6xl tracking-tight mb-6 leading-[1.15] text-white">
              Vận Hành Quy Trình Kinh Doanh, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue via-accent-purple to-accent-teal text-glow">
                Tự Động Hoá Mượt Mà
              </span>
            </Heading>

            {/* Hero Description */}
            <Text size="large" color="muted" className="mb-8 leading-relaxed max-w-lg">
              Sản phẩm phần mềm tùy chỉnh, tự thiết lập theo nhu cầu, bảo mật cao và quản lý hàng trăm nghiệp vụ doanh
              nghiệp một cách dễ dàng.
            </Text>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={onSignup}
                size="lg"
                className="h-12 px-8 rounded-full bg-accent-blue text-white font-bold hover:bg-accent-blue/90 shadow-lg shadow-accent-blue/20"
              >
                Đăng ký dùng thử miễn phí
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* System Metrics */}
            <div className="mt-10 pt-8 border-t border-white/5">
              <div className="grid grid-cols-3 gap-4">
                <MetricItem value="99.9%" label="Uptime SLA" />
                <MetricItem value="E2EE" label="Mã Hoá" />
                <MetricItem value="Global" label="Hạ Tầng" />
              </div>
            </div>
          </div>

          {/* Image Content (Right) */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent-blue to-accent-purple rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000" />
            <div className="relative rounded-2xl bg-background border border-white/10 shadow-2xl overflow-hidden transform transition-transform duration-700 hover:scale-[1.02]">
              {/* Browser Chrome */}
              <div className="h-8 bg-card border-b border-white/5 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="ml-4 px-3 py-0.5 rounded bg-black/30 text-[10px] text-muted-foreground font-mono border border-white/5 flex-1 text-center">
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
      </Container>
    </section>
  );
}

function MetricItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <Text as="div" size="large" weight="bold" className="text-2xl text-white">
        {value}
      </Text>
      <Text as="div" size="small" color="muted" className="uppercase tracking-wide">
        {label}
      </Text>
    </div>
  );
}
