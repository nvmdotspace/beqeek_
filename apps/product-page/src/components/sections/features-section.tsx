import { Wrench, Lock, Plug, Mail, Table, MessageCircle, Store } from 'lucide-react';
import { Container } from '@workspace/ui/components/primitives';
import { Heading, Text } from '@workspace/ui/components/typography';

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <Container maxWidth="xl" padding="margin">
        {/* Section Header */}
        <div className="text-center mb-20">
          <Heading level={2} className="text-3xl md:text-4xl mb-4 text-white">
            Đặc Điểm Nổi Bật
          </Heading>
          <Text size="large" color="muted" className="max-w-2xl mx-auto">
            Giải pháp toàn diện cho doanh nghiệp của bạn.
          </Text>
        </div>

        {/* Feature 1: Tùy Chỉnh */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div className="order-2 md:order-1 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-accent-red/10 to-accent-orange/10 rounded-3xl blur-xl" />
            <div className="glass p-6 rounded-2xl border border-white/10 relative">
              {/* Visual: Kanban as example of custom setup */}
              <div className="flex gap-4 overflow-hidden">
                <div className="w-1/2 bg-secondary rounded-lg p-3 border border-white/5">
                  <div className="h-1 w-full bg-accent-red rounded-full mb-3" />
                  <Text as="div" size="small" weight="bold" className="mb-3 text-white">
                    Quan trọng &amp; Khẩn cấp
                  </Text>
                  <div className="bg-background p-3 rounded border border-white/5 mb-2">
                    <div className="h-2 w-3/4 bg-slate-700 rounded mb-2" />
                  </div>
                </div>
                <div className="w-1/2 bg-secondary rounded-lg p-3 border border-white/5 opacity-50">
                  <div className="h-1 w-full bg-accent-green rounded-full mb-3" />
                  <Text as="div" size="small" weight="bold" className="mb-3 text-white">
                    Quan trọng &amp; Không gấp
                  </Text>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <FeatureIcon icon={<Wrench className="h-5 w-5" />} color="accent-red" />
            <Heading level={3} className="text-2xl mb-4 text-white">
              Tùy Chỉnh Tự Thiết Lập
            </Heading>
            <Text color="muted" className="mb-6 leading-relaxed">
              Thiết kế và cấu hình phần mềm theo nhu cầu cụ thể của doanh nghiệp bạn mà không cần lập trình viên chuyên
              nghiệp.
            </Text>
          </div>
        </div>

        {/* Feature 2: Bảo Mật */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <FeatureIcon icon={<Lock className="h-5 w-5" />} color="accent-blue" />
            <Heading level={3} className="text-2xl mb-4 text-white">
              Bảo Mật Mã Hóa Đầu Cuối
            </Heading>
            <Text color="muted" className="mb-6 leading-relaxed">
              Dữ liệu của bạn được bảo vệ tối đa với công nghệ mã hóa end-to-end, đảm bảo an toàn và riêng tư.
            </Text>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-accent-blue/10 to-accent-teal/10 rounded-3xl blur-xl" />
            <div className="glass p-6 rounded-2xl border border-white/10 relative flex items-center justify-center h-48">
              <Lock className="h-16 w-16 text-accent-blue/50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Text as="div" size="large" weight="bold" className="text-2xl text-white">
                  E2EE
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: API */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-accent-purple/10 to-pink-500/10 rounded-3xl blur-xl" />
            <div className="glass p-6 rounded-2xl border border-white/10 relative">
              {/* Marquee for API */}
              <div className="marquee-container relative overflow-hidden h-24 flex items-center">
                <div className="flex gap-8 animate-scroll whitespace-nowrap items-center">
                  <MarqueeItem icon={<Mail className="h-4 w-4 text-accent-orange" />} label="SMTP" />
                  <MarqueeItem icon={<Table className="h-4 w-4 text-accent-green" />} label="Google Sheets" />
                  <MarqueeItem icon={<MessageCircle className="h-4 w-4 text-accent-blue" />} label="Zalo OA" />
                  <MarqueeItem icon={<Store className="h-4 w-4 text-blue-400" />} label="KiotViet" />
                  {/* Duplicate for seamless loop */}
                  <MarqueeItem icon={<Mail className="h-4 w-4 text-accent-orange" />} label="SMTP" />
                  <MarqueeItem icon={<Table className="h-4 w-4 text-accent-green" />} label="Google Sheets" />
                  <MarqueeItem icon={<MessageCircle className="h-4 w-4 text-accent-blue" />} label="Zalo OA" />
                  <MarqueeItem icon={<Store className="h-4 w-4 text-blue-400" />} label="KiotViet" />
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <FeatureIcon icon={<Plug className="h-5 w-5" />} color="accent-purple" />
            <Heading level={3} className="text-2xl mb-4 text-white">
              Kết Nối API Mở
            </Heading>
            <Text color="muted" className="mb-6 leading-relaxed">
              BEQEEK có thể kết nối đến các đối tác và hệ thống phần mềm khác thông qua API mở, giúp tích hợp mượt mà và
              mở rộng hệ sinh thái.
            </Text>
          </div>
        </div>
      </Container>
    </section>
  );
}

function FeatureIcon({ icon, color }: { icon: React.ReactNode; color: string }) {
  return (
    <div className={`w-12 h-12 rounded-xl bg-${color}/10 flex items-center justify-center text-${color} mb-6`}>
      {icon}
    </div>
  );
}

function MarqueeItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground font-semibold">
      {icon}
      <span>{label}</span>
    </div>
  );
}
