import { TrendingUp, PiggyBank, Network } from 'lucide-react';
import { Container } from '@workspace/ui/components/primitives';
import { Heading, Text } from '@workspace/ui/components/typography';

export function BenefitsSection() {
  const benefits = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      iconColor: 'text-accent-green',
      iconBg: 'bg-accent-green/10',
      title: 'Tăng Hiệu Quả Kinh Doanh',
      description: 'Tối ưu hóa quy trình làm việc, giảm thời gian xử lý và tăng năng suất cho đội ngũ của bạn.',
    },
    {
      icon: <PiggyBank className="h-5 w-5" />,
      iconColor: 'text-accent-blue',
      iconBg: 'bg-accent-blue/10',
      title: 'Tiết Kiệm Chi Phí',
      description:
        'Không cần đầu tư vào phần mềm tùy chỉnh đắt đỏ, BEQEEK mang đến giải pháp linh hoạt với chi phí hợp lý.',
    },
    {
      icon: <Network className="h-5 w-5" />,
      iconColor: 'text-accent-purple',
      iconBg: 'bg-accent-purple/10',
      title: 'Quản Lý Hàng Trăm Nghiệp Vụ',
      description:
        'Tự tạo ra các ứng dụng cho hàng trăm quy trình kinh doanh khác nhau, từ bán hàng đến nhân sự và hơn thế nữa.',
    },
  ];

  return (
    <section id="benefits" className="py-24 bg-card/30 border-y border-white/5">
      <Container maxWidth="xl" padding="margin">
        <div className="text-center mb-16">
          <Heading level={2} className="text-3xl md:text-4xl mb-4 text-white">
            Lợi Ích Khi Sử Dụng BEQEEK
          </Heading>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="glass p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-all"
            >
              <div
                className={`w-12 h-12 rounded-lg ${benefit.iconBg} flex items-center justify-center ${benefit.iconColor} mb-6`}
              >
                {benefit.icon}
              </div>
              <Heading level={4} className="text-xl mb-3 text-white">
                {benefit.title}
              </Heading>
              <Text color="muted">{benefit.description}</Text>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
