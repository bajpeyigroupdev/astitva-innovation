import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Code2 } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection("home")}>
            <img src="/logo.png" alt="Astitva Innovation Logo" className="w-10 h-10 object-contain bg-white/10 p-1 rounded-lg border border-white/10 shadow-sm" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Astitva Innovation
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("home")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-foreground hover:text-primary transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* CTA Button - Desktop */}
          <div className="hidden md:block">
            <Button
              variant="hero"
              size="lg"
              onClick={() => scrollToSection("contact")}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("home")}
                className="text-left py-2 text-foreground hover:text-primary transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("services")}
                className="text-left py-2 text-foreground hover:text-primary transition-colors"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-left py-2 text-foreground hover:text-primary transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-left py-2 text-foreground hover:text-primary transition-colors"
              >
                Contact
              </button>
              <Button
                variant="hero"
                size="lg"
                onClick={() => scrollToSection("contact")}
                className="mt-2"
              >
                Get Started
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;