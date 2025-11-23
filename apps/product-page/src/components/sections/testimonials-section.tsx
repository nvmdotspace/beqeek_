import { Quote } from 'lucide-react';
import { Container } from '@workspace/ui/components/primitives';
import { Heading, Text } from '@workspace/ui/components/typography';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: 'BEQEEK đã thay đổi cách chúng tôi quản lý doanh nghiệp. Tùy chỉnh dễ dàng và bảo mật tuyệt vời!',
      author: 'Trần Lan',
    },
    {
      quote: 'Bảo mật end-to-end mang lại sự yên tâm cho dữ liệu nhạy cảm của chúng tôi.',
      author: 'Lê Minh Quân',
    },
    {
      quote:
        'Tích hợp API mở đã giúp chúng tôi kết nối nhanh chóng với các hệ thống khác, tiết kiệm hàng tháng phát triển.',
      author: 'Phạm Thị Dung',
    },
  ];

  return (
    <section className="py-24 relative">
      <Container maxWidth="xl" padding="margin">
        <Heading level={2} className="text-3xl md:text-4xl mb-16 text-center text-white">
          Khách Hàng Nói Gì Về BEQEEK
        </Heading>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="glass p-8 rounded-2xl border border-white/5 relative">
              <Quote className="h-10 w-10 text-accent-blue/20 absolute top-6 left-6" />
              <Text as="p" className="text-slate-300 mb-6 relative z-10 pt-8">
                &ldquo;{testimonial.quote}&rdquo;
              </Text>
              <Text as="div" weight="bold" className="text-white">
                - {testimonial.author}
              </Text>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
