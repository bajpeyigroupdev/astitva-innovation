import { useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import PaymentSolutions from "../components/PaymentSolutions";
import Services from "../components/Services";
import ProjectCalculator from "../components/ProjectCalculator";
import TechStack from "../components/TechStack";
import Process from "../components/Process";
import CaseStudies from "../components/CaseStudies";
import EngagementModels from "../components/EngagementModels";
import About from "../components/About";
import FaqSection from "../components/FaqSection";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import LegalModals from "../components/LegalModals";

export const HomePage = () => {
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
      {/* Fixed Navigation Header */}
      <Header />

      {/* Main Public Website Sections */}
      <main className="flex-grow">
        <Hero />
        <PaymentSolutions />
        <Services />
        <ProjectCalculator onSelectScope={handleSelectScope} />
        <TechStack />
        <Process />
        <CaseStudies />
        <EngagementModels />
        <About />
        <FaqSection />
        <Contact prefilledScope={calculatorScope} />
      </main>

      {/* Public Footer */}
      <Footer onOpenLegal={handleOpenLegal} />

      {/* Compliance & Policy Modals */}
      <LegalModals 
        type={legalModalType} 
        isOpen={legalModalType !== null} 
        onClose={handleCloseLegal} 
      />
    </div>
  );
};

export default HomePage;
