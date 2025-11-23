import { TrendingUp, PiggyBank, Network } from 'lucide-react';

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
    <section id="benefits" className="py-24 bg-[hsl(222_37%_10%)]/30 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Lợi Ích Khi Sử Dụng BEQEEK</h2>
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
              <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
              <p className="text-slate-400">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
