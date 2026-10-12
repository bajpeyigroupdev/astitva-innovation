import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Target, 
  Award, 
  Lightbulb,
  ArrowRight,
  Code2, 
  Rocket, 
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap,
  Globe2
} from "lucide-react";

export const About = () => {
  const guarantees = [
    {
      icon: Lock,
      title: "100% Source Code Ownership",
      desc: "All source code, design systems, database schemas, and cloud deployment scripts are transferred exclusively to your organization."
    },
    {
      icon: ShieldCheck,
      title: "Strict Mutual NDA Protection",
      desc: "We sign non-disclosure agreements before discussing any proprietary technical architecture or business logic."
    },
    {
      icon: Zap,
      title: "Agile Sprints & Live Demos",
      desc: "No black boxes. You get live staging URLs, weekly sprint demos, and direct access to developers via Slack or Teams."
    },
    {
      icon: Award,
      title: "60-Day Post-Launch Warranty",
      desc: "Every release includes complimentary warranty support ensuring any unexpected bugs or anomalies are resolved immediately."
    }
  ];

  const stats = [
    { number: "5+", label: "Years Engineering Experience" },
    { number: "50+", label: "Enterprise Projects Shipped" },
    { number: "₹100M+", label: "FinTech Volume Processed" },
    { number: "24/7", label: "Production SLA Support" }
  ];

  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="outline" className="px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase border-primary/40 bg-primary/10 text-primary">
            Engineering Culture & Values
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            About <span className="bg-gradient-primary bg-clip-text text-transparent">Astitva Innovation</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A software engineering powerhouse committed to crafting resilient web systems, mobile applications, and payment infrastructures for ambitious enterprises.
          </p>
        </div>

        {/* Story & Value Proposition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              We Don't Just Write Code — We Engineer Business Outcomes
            </h3>
            
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Founded on the principles of technical excellence and transparency, <strong className="text-foreground">Astitva Innovation</strong> bridges the gap between complex software engineering and high-velocity commercial growth.
            </p>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Whether you are an established enterprise modernizing legacy architecture or an emerging startup seeking a secure FinTech payment gateway integration, our team brings senior-level engineering rigor to every sprint.
            </p>

            <div className="pt-2">
              <Button 
                variant="hero" 
                size="lg"
                onClick={scrollToContact}
                className="text-xs md:text-sm font-semibold"
              >
                Work With Our Engineering Team
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Right Stats Grid */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, idx) => (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl bg-card/50 border border-border/70 backdrop-blur-sm hover:border-primary/40 transition-all text-center"
                >
                  <div className="text-3xl md:text-4xl font-black bg-gradient-primary bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* The 4 Guarantees */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-2">The Astitva Engineering Guarantees</h3>
            <p className="text-xs text-muted-foreground">What every client receives on every engagement</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {guarantees.map((item, index) => (
              <Card 
                key={index}
                className="p-6 bg-card/40 backdrop-blur-sm border-border/70 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group"
              >
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base mb-2 text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;