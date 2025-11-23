import { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { BackgroundEffects } from '@/components/layout/background-effects';
import { HeroSection } from '@/components/sections/hero-section';
import { FeaturesSection } from '@/components/sections/features-section';
import { BenefitsSection } from '@/components/sections/benefits-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { PricingSection } from '@/components/sections/pricing-section';
import { SignupModal } from '@/components/modal/signup-modal';

// Environment URL for login redirect
const LOGIN_URL = import.meta.env.VITE_LOGIN_URL || 'https://app.beqeek.com/vi/login';

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogin = () => {
    window.location.href = LOGIN_URL;
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen bg-[hsl(222_47%_7%)] text-white antialiased selection:bg-accent-blue/30 selection:text-blue-200">
      <BackgroundEffects />
      <Navbar onLogin={handleLogin} onSignup={openModal} />

      <main>
        <HeroSection onSignup={openModal} />
        <FeaturesSection />
        <BenefitsSection />
        <TestimonialsSection />
        <PricingSection onSignup={openModal} />
      </main>

      <Footer />
      <SignupModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
