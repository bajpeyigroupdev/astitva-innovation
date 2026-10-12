import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, ArrowRight, ShieldCheck, CreditCard, Phone, Briefcase, Users } from "lucide-react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (sectionId: string, directPath?: string) => {
    setIsMenuOpen(false);
    if (directPath) {
      navigate(directPath);
      return;
    }
    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${sectionId}`);
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
            onClick={() => handleNavClick("home", "/")}
          >
            <img
              src="/astitva-logo.png"
              alt="Astitva Innovation - Technology, Software &amp; Digital Solutions"
              width="180"
              height="48"
              className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
            <button
              onClick={() => handleNavClick("home", "/")}
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick("services")}
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => handleNavClick("products")}
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              Products
            </button>
            <button
              onClick={() => handleNavClick("fintech")}
              className="flex items-center gap-1.5 text-accent hover:text-accent/80 transition-colors font-semibold"
            >
              <CreditCard className="w-3.5 h-3.5" />
              FinTech &amp; Payments
            </button>
            <button
              onClick={() => handleNavClick("portfolio")}
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              Case Studies
            </button>
            <button
              onClick={() => handleNavClick("founders", "/founders")}
              className="text-foreground/80 hover:text-primary transition-colors font-medium flex items-center gap-1"
            >
              Founders
            </button>
            <button
              onClick={() => handleNavClick("careers", "/careers")}
              className="text-foreground/80 hover:text-primary transition-colors font-medium flex items-center gap-1.5"
            >
              <span>Careers</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold animate-pulse">
                Hiring
              </span>
            </button>
            <button
              onClick={() => handleNavClick("calculator")}
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              Estimator
            </button>
          </nav>

          {/* CTAs - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:+917233882089"
              className="hidden xl:inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-emerald-400 px-3 py-1.5 rounded-full bg-background/50 border border-border/60 hover:border-emerald-500/40 transition-colors"
              title="Call Direct Engineering Desk"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              +91 7233882089
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavClick("careers", "/careers")}
              className="text-xs border-primary/30 hover:bg-primary/10"
            >
              <Briefcase className="w-3.5 h-3.5 mr-1 text-primary" />
              Join Squad
            </Button>
            <Button
              variant="hero"
              size="sm"
              onClick={() => handleNavClick("contact")}
              className="text-xs px-4"
            >
              Get a Quote
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <a
              href="tel:+917233882089"
              className="inline-flex p-2 rounded-lg bg-background/60 border border-border/60 text-emerald-400"
              title="Call Direct Desk"
            >
              <Phone className="w-4 h-4" />
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>

        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className="lg:hidden mt-3 pb-4 border-t border-border/60 bg-background/95 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-3">
            <nav className="flex flex-col space-y-2 text-sm">
              <button
                onClick={() => handleNavClick("home", "/")}
                className="text-left py-2 px-3 rounded-lg hover:bg-card text-foreground font-medium"
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick("services")}
                className="text-left py-2 px-3 rounded-lg hover:bg-card text-foreground"
              >
                Services
              </button>
              <button
                onClick={() => handleNavClick("products")}
                className="text-left py-2 px-3 rounded-lg hover:bg-card text-foreground"
              >
                Products (Meethi Chat)
              </button>
              <button
                onClick={() => handleNavClick("fintech")}
                className="text-left py-2 px-3 rounded-lg hover:bg-card text-accent font-semibold flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                FinTech &amp; Payment Gateway
              </button>
              <button
                onClick={() => handleNavClick("founders", "/founders")}
                className="text-left py-2 px-3 rounded-lg hover:bg-card text-foreground font-semibold flex items-center justify-between"
              >
                <span>Founders &amp; Leadership</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Executive</span>
              </button>
              <button
                onClick={() => handleNavClick("careers", "/careers")}
                className="text-left py-2 px-3 rounded-lg hover:bg-card text-foreground font-semibold flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  Engineering Careers
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Hiring</span>
              </button>
              <button
                onClick={() => handleNavClick("portfolio")}
                className="text-left py-2 px-3 rounded-lg hover:bg-card text-foreground"
              >
                Case Studies
              </button>
              <button
                onClick={() => handleNavClick("calculator")}
                className="text-left py-2 px-3 rounded-lg hover:bg-card text-foreground"
              >
                Project Cost Estimator
              </button>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavClick("careers", "/careers")}
                  className="text-xs"
                >
                  Join Team
                </Button>
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => handleNavClick("contact")}
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