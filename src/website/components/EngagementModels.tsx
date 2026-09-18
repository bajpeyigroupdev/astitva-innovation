import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export const EngagementModels = () => {
  const models = [
    {
      name: "Fixed-Scope Project",
      tagline: "Ideal for well-defined MVPs & software releases",
      badge: "Guaranteed Milestone",
      features: [
        "Fixed price & locked-in delivery timeline",
        "Clear scope of work (SOW) & architecture blueprint",
        "Milestone-based staged payments",
        "Dedicated project manager & weekly demos",
        "Full source code ownership upon sign-off",
        "60-day complimentary post-launch warranty"
      ],
      cta: "Get Fixed Quote",
      popular: false
    },
    {
      name: "Dedicated Engineering Squad",
      tagline: "Senior developers embedded directly with your team",
      badge: "Most Popular",
      features: [
        "Full-time Senior Full-Stack / Mobile Engineers",
        "Direct Slack / Teams communication & daily standups",
        "Agile sprint delivery with flexible backlog priorities",
        "Seamless scale up or scale down (14-day notice)",
        "Zero hiring overhead, payroll, or equipment costs",
        "Pre-vetted in React, Node, Flutter & Cloud DevOps"
      ],
      cta: "Hire Dedicated Team",
      popular: true
    },
    {
      name: "Enterprise SLA & DevOps Retainer",
      tagline: "Continuous 24/7 uptime, security & feature iteration",
      badge: "Mission Critical",
      features: [
        "Guaranteed 15-minute emergency incident response",
        "Cloud cost optimization & multi-region backups",
        "Continuous penetration testing & security patches",
        "Payment gateway uptime monitoring & reconcile",
        "Scheduled monthly feature sprints & enhancements",
        "Dedicated Solutions Architect & DevOps Lead"
      ],
      cta: "Explore Retainer",
      popular: false
    }
  ];

  const scrollToContact = () => {
    const el = document.getElementById("contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pricing" className="py-24 bg-card/20 relative border-t border-border/40">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="outline" className="px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase border-primary/40 bg-primary/10 text-primary">
            Transparent Collaboration
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Flexible <span className="bg-gradient-primary bg-clip-text text-transparent">Engagement Models</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Whether you need a complete turn-key product build or senior engineering bandwidth, we have a collaboration model tailored to your requirements.
          </p>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {models.map((model, idx) => (
            <Card 
              key={idx}
              className={`p-7 rounded-2xl flex flex-col justify-between transition-all duration-300 relative ${
                model.popular 
                  ? "bg-card/90 border-primary/50 shadow-xl shadow-primary/10 scale-100 lg:-translate-y-2 ring-1 ring-primary/30" 
                  : "bg-card/40 border-border/70 hover:border-border"
              }`}
            >
              {model.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-primary text-white text-[11px] font-bold tracking-wider uppercase rounded-full shadow-md">
                  {model.badge}
                </div>
              )}

              <div>
                {!model.popular && (
                  <Badge variant="outline" className="text-[10px] font-mono mb-3 border-border/80 text-muted-foreground">
                    {model.badge}
                  </Badge>
                )}
                
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {model.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                  {model.tagline}
                </p>

                <div className="space-y-3 mb-8 pt-4 border-t border-border/60">
                  {model.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Button 
                  variant={model.popular ? "hero" : "outline"} 
                  className="w-full py-5 text-xs font-semibold"
                  onClick={scrollToContact}
                >
                  {model.cta}
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};

export default EngagementModels;
