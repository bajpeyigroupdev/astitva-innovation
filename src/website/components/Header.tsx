import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, ArrowRight, ShieldCheck, CreditCard } from "lucide-react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-background/90 backdrop-blur-xl border-b border-border/80 shadow-lg shadow-black/20 py-2.5" 
        : "bg-background/60 backdrop-blur-md border-b border-border/40 py-3.5"
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => scrollToSection("home")}
          >
            <img
              src="/astitva-logo.png"
              alt="Astitva Innovation"
              className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => scrollToSection("home")}
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("products")}
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              Products
            </button>
            <button
              onClick={() => scrollToSection("fintech")}
              className="flex items-center gap-1.5 text-accent hover:text-accent/80 transition-colors font-semibold"
            >
              <CreditCard className="w-3.5 h-3.5" />
              FinTech & Payments
            </button>
            <button
              onClick={() => scrollToSection("calculator")}
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              Calculator
            </button>
            <button
              onClick={() => scrollToSection("tech-stack")}
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              Tech Stack
            </button>
            <button
              onClick={() => scrollToSection("portfolio")}
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              Case Studies
            </button>
            <button
              onClick={() => scrollToSection("process")}
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              Process
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              About
            </button>
          </nav>

          {/* CTAs - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection("calculator")}
              className="text-xs border-primary/30 hover:bg-primary/10"
            >
              Estimate Cost
            </Button>
            <Button
              variant="hero"
              size="sm"
              onClick={() => scrollToSection("contact")}
              className="text-xs px-4"
            >
              Get a Quote
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-border/80 pb-4 bg-background/95 backdrop-blur-2xl rounded-b-2xl animate-in slide-in-from-top-3 duration-200">
            <nav className="flex flex-col gap-2.5 px-2 text-sm font-medium">
              <button
                onClick={() => scrollToSection("home")}
                className="text-left py-2 px-3 rounded-lg hover:bg-card text-foreground"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("services")}
                className="text-left py-2 px-3 rounded-lg hover:bg-card text-foreground"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection("products")}
                className="text-left py-2 px-3 rounded-lg hover:bg-card text-foreground"
              >
                Products (Meethi Chat)
              </button>
              <button
                onClick={() => scrollToSection("fintech")}
                className="text-left py-2 px-3 rounded-lg hover:bg-card text-accent font-semibold flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                FinTech & Payment Gateways
              </button>
              <button
                onClick={() => scrollToSection("calculator")}
                className="text-left py-2 px-3 rounded-lg hover:bg-card text-foreground"
              >
                Project Cost Calculator
              </button>
              <button
                onClick={() => scrollToSection("tech-stack")}
                className="text-left py-2 px-3 rounded-lg hover:bg-card text-foreground"
              >
                Tech Stack
              </button>
              <button
                onClick={() => scrollToSection("portfolio")}
                className="text-left py-2 px-3 rounded-lg hover:bg-card text-foreground"
              >
                Case Studies
              </button>
              <button
                onClick={() => scrollToSection("process")}
                className="text-left py-2 px-3 rounded-lg hover:bg-card text-foreground"
              >
                Agile Process
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-left py-2 px-3 rounded-lg hover:bg-card text-foreground"
              >
                Engagement Models
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="text-left py-2 px-3 rounded-lg hover:bg-card text-foreground"
              >
                FAQ
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-left py-2 px-3 rounded-lg hover:bg-card text-foreground"
              >
                About Us
              </button>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scrollToSection("calculator")}
                  className="text-xs"
                >
                  Estimate Cost
                </Button>
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => scrollToSection("contact")}
                  className="text-xs"
                >
                  Get a Quote
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;