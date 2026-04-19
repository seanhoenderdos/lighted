import HeroSection from '@/components/landing/HeroSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PricingSection from '@/components/landing/PricingSection';
import FAQSection from '@/components/landing/FAQSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

const LandingPage = () => (
  <main className="flex flex-col">
    <HeroSection />
    <HowItWorksSection />
    <FeaturesSection />
    <PricingSection />
    <FAQSection />
    <CTASection />
    <Footer />
  </main>
);

export default LandingPage;
