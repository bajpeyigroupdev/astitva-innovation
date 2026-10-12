import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Briefcase, ArrowRight, Laptop, Zap, DollarSign, Award, Users, CheckCircle2 } from "lucide-react";

export const CareersSection = () => {
  return (
    <section id="careers" className="py-24 bg-card/30 relative border-t border-border/40 overflow-hidden">
      <div className="absolute top-1/4 -right-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge 
            variant="outline" 
            className="px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          >
            Engineering Careers &amp; Squad Expansion
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Build Future-Defining Systems at <span className="bg-gradient-primary bg-clip-text text-transparent">Astitva Innovation</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            We are actively hiring passionate software engineers, WebRTC audio architects, mobile developers, and cloud infrastructure specialists to scale our platforms.
          </p>
        </div>

        {/* Culture / Perks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          <Card className="p-6 bg-card/60 backdrop-blur-xl border-border/70 hover:border-primary/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">100% Remote-First Culture</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Work from anywhere with asynchronous workflows, clear documentation, and autonomous ownership over your features.
            </p>
          </Card>

          <Card className="p-6 bg-card/60 backdrop-blur-xl border-border/70 hover:border-accent/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Top-Tier Market Compensation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Transparent salary brackets, timely milestone appraisals, performance bonuses, and direct equity opportunities for lead engineers.
            </p>
          </Card>

          <Card className="p-6 bg-card/60 backdrop-blur-xl border-border/70 hover:border-emerald-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">High-Concurrency Architectures</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tackle real-world challenges in low-latency WebRTC audio streaming, bank-grade payment reconciliation, and microservices at scale.
            </p>
          </Card>
        </div>

        {/* Open Roles Preview Box */}
        <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-gradient-to-r from-card via-background to-card border border-border/80 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">Actively Hiring</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground">
              Explore Open Engineering Positions
            </h3>
            <p className="text-xs text-muted-foreground max-w-lg">
              Openings available in Full-Stack (Node/React), React Native (WebRTC), DevOps Cloud Architecture, and Product UI/UX Design.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white text-xs px-6 shadow-xl shadow-primary/20">
              <Link to="/careers">
                <Briefcase className="w-4 h-4 mr-2" />
                View Open Positions &amp; Apply
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CareersSection;
