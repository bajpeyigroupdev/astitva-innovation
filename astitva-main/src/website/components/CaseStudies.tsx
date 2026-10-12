import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, TrendingUp, ShieldCheck, Zap } from "lucide-react";

export const CaseStudies = () => {
  const projects = [
    {
      title: "FinPay Aggregator Engine",
      category: "FinTech & Payment Gateway",
      desc: "Architected a multi-gateway intelligent payment routing engine integrating Razorpay, Cashfree, and Stripe. Automatically routes failed bank transactions to secondary nodes.",
      impact: "99.98% Transaction Success Rate",
      metrics: "₹45M+ Monthly GMV Handled",
      tags: ["Razorpay API", "Node.js", "Redis Cache", "PostgreSQL", "UPI 2.0"],
      icon: "💳"
    },
    {
      title: "OmniSaaS Enterprise Management",
      category: "B2B SaaS & Cloud Portal",
      desc: "Built a multi-tenant cloud subscription ERP with automated recurring invoice generation, team role permissions, and granular usage analytics.",
      impact: "4.2x Faster Onboarding",
      metrics: "12,000+ Active Business Users",
      tags: ["Next.js", "TypeScript", "Tailwind CSS", "Docker", "Stripe Billing"],
      icon: "🏢"
    },
    {
      title: "QuickCommerce On-Demand Mobile App",
      category: "iOS & Android Mobile Application",
      desc: "End-to-end mobile commerce ecosystem with real-time delivery GPS tracking, instant UPI 1-click checkout, and automated warehouse inventory sync.",
      impact: "15-Minute Delivery SLA",
      metrics: "50K+ Mobile App Downloads",
      tags: ["Flutter", "Google Maps API", "Firebase", "WebSockets", "PhonePe PG"],
      icon: "📦"
    },
    {
      title: "VocalPulse WebRTC Club & Audio Rooms",
      category: "Real-time Streaming & Audio Engine",
      desc: "High-concurrency live voice club application featuring sub-100ms audio latency, background media player, and automated moderation filters.",
      impact: "Sub-80ms Audio Latency",
      metrics: "5,000+ Concurrent Listeners",
      tags: ["WebRTC", "Socket.io", "FastAPI", "React", "AWS EC2"],
      icon: "🎙️"
    }
  ];

  const scrollToContact = () => {
    const el = document.getElementById("contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="portfolio" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="outline" className="px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase border-primary/40 bg-primary/10 text-primary">
            Proven Track Record
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Featured <span className="bg-gradient-primary bg-clip-text text-transparent">Client Case Studies</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Explore how we engineered scalable platforms, mission-critical payment gateways, and native mobile apps for high-growth enterprises.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {projects.map((item, idx) => (
            <Card 
              key={idx}
              className="p-7 bg-card/40 backdrop-blur-sm border-border/70 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-xs font-mono text-accent font-medium">{item.category}</span>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-xs md:text-sm text-muted-foreground mb-6 leading-relaxed">
                {item.desc}
              </p>

              {/* Impact Highlights */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-background/50 border border-border/60 mb-6">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <TrendingUp className="w-3.5 h-3.5 text-accent" />
                    Key Result
                  </div>
                  <div className="text-xs font-bold text-foreground mt-0.5">{item.impact}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    Scale Achieved
                  </div>
                  <div className="text-xs font-bold text-foreground mt-0.5">{item.metrics}</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag, tIdx) => (
                  <span 
                    key={tIdx}
                    className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-secondary/80 text-muted-foreground border border-border/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={scrollToContact}
            className="hover:border-primary/50"
          >
            Have a Similar Project in Mind? Let's Talk
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

      </div>
    </section>
  );
};

export default CaseStudies;
