import { Check } from 'lucide-react';

interface PricingSectionProps {
  onOpenModal: () => void;
}

export function PricingSection({ onOpenModal }: PricingSectionProps) {
  const plans = [
    {
      name: 'Miễn Phí',
      price: '0 VNĐ',
      period: '/tháng',
      buttonText: 'Thử Ngay',
      buttonStyle: 'bg-white/5 hover:bg-white/10',
      borderStyle: 'border-accent-green/50 hover:border-accent-green',
      checkColor: 'text-accent-green',
      features: ['Thử nghiệm 7 ngày', 'Tùy chỉnh cơ bản', 'Bảo mật end-to-end', 'Quản lý 10 nghiệp vụ'],
    },
    {
      name: 'Cơ Bản',
      price: '630.000 VNĐ',
      period: '/tháng',
      buttonText: 'Chọn Gói',
      buttonStyle: 'bg-accent-blue hover:bg-accent-blue/90 shadow-lg shadow-accent-blue/25',
      borderStyle: 'border-white/5 hover:border-white/10',
      checkColor: 'text-blue-400',
      textStyle: 'text-slate-300',
      features: [
        'Tùy chỉnh cơ bản',
        'Bảo mật end-to-end',
        'Quản lý 50 nghiệp vụ',
        '10 người dùng (33k/tháng)',
        '1 wCPU luồng tự động hoá (300k/tháng)',
      ],
    },
    {
      name: 'Nâng cao',
      price: 'Liên Hệ',
      period: '',
      buttonText: 'Liên Hệ',
      buttonStyle: 'bg-white/5 hover:bg-white/10',
      borderStyle: 'border-white/5 hover:border-white/10',
      checkColor: 'text-accent-blue',
      features: [
        'Tùy chỉnh nâng cao',
        'Bảo mật end-to-end',
        'Quản lý toàn diện',
        '10 người dùng (33k/tháng)',
        '1 wCPU luồng tự động hoá (300k/tháng)',
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-[hsl(222_37%_10%)]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Bảng Giá</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {plans.map((plan, index) => (
            <div key={index} className={`glass p-8 rounded-2xl border ${plan.borderStyle} transition-all`}>
              <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold text-white mb-1">
                {plan.price}
                {plan.period && <span className="text-sm font-normal text-slate-500">{plan.period}</span>}
              </div>
              <button
                onClick={onOpenModal}
                className={`block w-full py-2.5 rounded-lg text-white font-medium text-center transition-all my-8 ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </button>
              <ul className={`space-y-3 text-sm ${plan.textStyle || 'text-slate-400'}`}>
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className={`h-4 w-4 ${plan.checkColor} mr-3 flex-shrink-0`} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
