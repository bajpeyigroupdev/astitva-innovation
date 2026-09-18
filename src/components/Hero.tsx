import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Sparkles, 
  Code2, 
  CreditCard, 
  ShieldCheck, 
  Layers, 
  Zap,
  Server,
  Calculator
} from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

export const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const techMarquee = [
    "Razorpay", "Stripe", "Cashfree", "UPI 2.0", "React", "Next.js 15",
    "Flutter", "Node.js", "Python FastAPI", "AWS Cloud", "Docker", "PostgreSQL",
    "Kubernetes", "Redis", "TypeScript", "Tailwind CSS"
  ];

  return (
    <section id="home" className="relative min-h-[92vh] pt-28 pb-16 flex flex-col justify-center overflow-hidden">
      {/* Background Graphic & Glows */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />

      {/* Cyber ambient glow lights */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute top-40 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[140px] pointer-events-none" style={{ animationDelay: "1.5s" }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center my-auto">
        <div className="max-w-4xl mx-auto">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-card/60 backdrop-blur-md border border-primary/30 rounded-full px-4 py-1.5 mb-8 shadow-glow hover:border-primary/60 transition-all cursor-default">
            <Sparkles className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-xs md:text-sm font-semibold tracking-wide text-foreground">
              Enterprise Software Engineering & FinTech Integrations
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-accent/20 text-accent font-bold">
              ISO Standards
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-[1.15]">
            Architecting <span className="bg-gradient-primary bg-clip-text text-transparent">Enterprise Software</span>
            <br />
            <span className="text-foreground">& Secure </span>
            <span className="text-accent underline decoration-primary/40 decoration-wavy decoration-2">Payment Gateways</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-normal">
            Astitva Innovation empowers high-growth startups and enterprises with custom full-stack web platforms, 
            high-performance mobile apps, and bank-grade payment processing systems engineered for zero downtime.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Button
              variant="hero"
              size="lg"
              onClick={() => scrollToSection("fintech")}
              className="text-sm md:text-base px-8 py-6 h-auto shadow-lg shadow-primary/20 w-full sm:w-auto"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Explore Payment Solutions
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              variant="glass"
              size="lg"
              onClick={() => scrollToSection("calculator")}
              className="text-sm md:text-base px-8 py-6 h-auto border-border/80 hover:border-primary/40 w-full sm:w-auto"
            >
              <Calculator className="w-4 h-4 mr-2 text-accent" />
              Instant Cost Calculator
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => scrollToSection("contact")}
              className="text-sm md:text-base px-6 py-6 h-auto w-full sm:w-auto"
            >
              <Code2 className="w-4 h-4 mr-2 text-primary" />
              Schedule Tech Call
            </Button>
          </div>

          {/* Credibility Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border/60 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-card/40 border border-border/60 backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-extrabold text-foreground mb-1">
                50+
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                Enterprise Deployments
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card/40 border border-border/60 backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-extrabold text-accent mb-1">
                99.99%
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                High-Availability SLA
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card/40 border border-border/60 backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-extrabold text-primary mb-1">
                ₹100M+
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                Secure Transactions
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card/40 border border-border/60 backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-extrabold text-emerald-400 mb-1">
                100%
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                Client Code Ownership
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Tech Ticker / Marquee */}
      <div className="relative w-full mt-12 overflow-hidden py-3 border-y border-border/40 bg-card/20 backdrop-blur-sm">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
          {techMarquee.concat(techMarquee).map((tech, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs font-mono text-muted-foreground/80 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              <span>{tech}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;