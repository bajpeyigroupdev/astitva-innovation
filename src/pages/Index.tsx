import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PaymentSolutions from "@/components/PaymentSolutions";
import Services from "@/components/Services";
import ProjectCalculator from "@/components/ProjectCalculator";
import TechStack from "@/components/TechStack";
import Process from "@/components/Process";
import CaseStudies from "@/components/CaseStudies";
import EngagementModels from "@/components/EngagementModels";
import FaqSection from "@/components/FaqSection";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import LegalModals from "@/components/LegalModals";

const Index = () => {
  const [calculatorScope, setCalculatorScope] = useState<string>("");
  const [legalModalType, setLegalModalType] = useState<"privacy" | "terms" | "refund" | null>(null);

  const handleSelectScope = (scopeDetails: string) => {
    setCalculatorScope(scopeDetails);
  };

  const handleOpenLegal = (type: "privacy" | "terms" | "refund") => {
    setLegalModalType(type);
  };

  const handleCloseLegal = () => {
    setLegalModalType(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Top Fixed Header */}
      <Header />

      {/* Main Sections */}
      <main className="flex-grow">
        {/* 1. Hero with Live Metrics & Tech Ticker */}
        <Hero />

        {/* 2. Specialized FinTech & Payment Gateway Engineering */}
        <PaymentSolutions />

        {/* 3. Core Enterprise Software Services */}
        <Services />

        {/* 4. Interactive Project Cost & Timeline Calculator */}
        <ProjectCalculator onSelectScope={handleSelectScope} />

        {/* 5. Battle-Tested Technology Stack Showcase */}
        <TechStack />

        {/* 6. Agile 6-Step Development Process */}
        <Process />

        {/* 7. Client Case Studies & Impact */}
        <CaseStudies />

        {/* 8. Flexible Collaboration & Engagement Models */}
        <EngagementModels />

        {/* 9. About Culture & Guarantees */}
        <About />

        {/* 10. Frequently Asked Questions */}
        <FaqSection />

        {/* 11. Project Inquiry & Contact */}
        <Contact prefilledScope={calculatorScope} />
      </main>

      {/* Corporate Footer with Legal and Domain Info */}
      <Footer onOpenLegal={handleOpenLegal} />

      {/* Legal & Compliance Dialog Modals (Privacy, Terms, Refund) */}
      <LegalModals 
        type={legalModalType} 
        isOpen={legalModalType !== null} 
        onClose={handleCloseLegal} 
      />
    </div>
  );
};

export default Index;