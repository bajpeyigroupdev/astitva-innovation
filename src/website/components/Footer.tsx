import { Mail, Phone, MapPin, ShieldCheck, CreditCard, ArrowUpRight } from "lucide-react";

interface FooterProps {
  onOpenLegal: (type: "privacy" | "terms" | "refund") => void;
}

export const Footer = ({ onOpenLegal }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="py-16 border-t border-border/60 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Company Column */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              className="cursor-pointer inline-block" 
              onClick={() => scrollToSection("home")}
            >
              <img
                src="/astitva-logo.png"
                alt="Astitva Innovation - Technology, Software &amp; Digital Solutions"
                width="180"
                height="48"
                className="h-12 w-auto object-contain"
                loading="lazy"
              />
            </div>
            
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-sm">
              Astitva Innovation is an enterprise software engineering firm delivering resilient web platforms, native mobile apps, and bank-grade payment gateway infrastructures.
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:contact@astitvainnovation.in" className="hover:text-primary transition-colors">
                  contact@astitvainnovation.in
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <a href="mailto:support@astitvainnovation.in" className="hover:text-accent transition-colors">
                  support@astitvainnovation.in
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:+919876543210" className="hover:text-foreground transition-colors">
                  +91 98765 43210 (Engineering Desk)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Global Software Engineering Hub • India & Remote</span>
              </div>
            </div>
          </div>

          {/* Solutions & Services */}
          <div>
            <h4 className="font-bold text-sm text-foreground mb-4">
              Core Engineering
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <button 
                  onClick={() => scrollToSection("fintech")}
                  className="hover:text-primary transition-colors text-left flex items-center gap-1 text-accent font-medium"
                >
                  <CreditCard className="w-3 h-3" />
                  Payment Gateways (UPI/Cards)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("services")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Enterprise SaaS & Web
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("services")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Mobile Apps (Flutter & iOS)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("services")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Cloud DevOps & AWS Clusters
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("services")}
                  className="hover:text-primary transition-colors text-left"
                >
                  AI Agents & Workflow Automations
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("pricing")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Dedicated Developer Squads
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm text-foreground mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <button 
                  onClick={() => scrollToSection("home")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("products")}
                  className="hover:text-primary transition-colors text-left font-medium text-accent"
                >
                  Products (Meethi Chat)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("calculator")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Project Cost Estimator
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("tech-stack")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Technology Stack
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("portfolio")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Case Studies & Portfolio
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("process")}
                  className="hover:text-primary transition-colors text-left"
                >
                  6-Step Agile Process
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("faq")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Enterprise FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Compliance & Legal (Merchant PG requirement) */}
          <div>
            <h4 className="font-bold text-sm text-foreground mb-4">
              Compliance & Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <button 
                  onClick={() => onOpenLegal("privacy")}
                  className="hover:text-primary transition-colors text-left flex items-center gap-1"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenLegal("terms")}
                  className="hover:text-primary transition-colors text-left flex items-center gap-1"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenLegal("refund")}
                  className="hover:text-primary transition-colors text-left flex items-center gap-1"
                >
                  Refund & Cancellation Policy
                </button>
              </li>
              <li className="pt-2 text-[11px] text-muted-foreground/70">
                Official Domain: <a href="https://astitvainnovation.in" className="text-accent underline">astitvainnovation.in</a>
              </li>
            </ul>

            <div className="mt-4 p-3 rounded-lg bg-card/60 border border-border/80 text-[11px] text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>PCI-DSS & SSL Verified Architecture</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>
            © {currentYear} Astitva Innovation (astitvainnovation.in). All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => onOpenLegal("privacy")} className="hover:text-foreground transition-colors">
              Privacy
            </button>
            <button onClick={() => onOpenLegal("terms")} className="hover:text-foreground transition-colors">
              Terms
            </button>
            <button onClick={() => onOpenLegal("refund")} className="hover:text-foreground transition-colors">
              Refunds
            </button>
            <a href="https://b2b.astitvainnovation.in/login" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-accent font-medium">
              B2B Portal
            </a>
            <a href="https://github.com/astitvainnovation" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
              GitHub
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;