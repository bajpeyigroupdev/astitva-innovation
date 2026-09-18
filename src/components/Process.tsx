import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Compass, 
  Layers, 
  Code2, 
  ShieldCheck, 
  Rocket, 
  Headphones,
  CheckCircle2
} from "lucide-react";

export const Process = () => {
  const steps = [
    {
      step: "01",
      icon: Compass,
      title: "Discovery & System Architecture",
      desc: "We analyze your business model, define database schemas, choose tech stacks, formulate API contracts, and prepare an ironclad roadmap with guaranteed milestones."
    },
    {
      step: "02",
      icon: Layers,
      title: "UI/UX & Interactive Prototyping",
      desc: "Our design team crafts high-fidelity clickable Figma prototypes, UX wireframes, and design tokens ensuring intuitive customer conversion before a single line of code."
    },
    {
      step: "03",
      icon: Code2,
      title: "Agile Sprints & Weekly Demos",
      desc: "Development proceeds in 1 to 2-week sprints. You receive live staging URLs, automated GitHub progress updates, and transparent sprint demo reviews."
    },
    {
      step: "04",
      icon: ShieldCheck,
      title: "Security Audit & QA Testing",
      desc: "We run automated unit tests, end-to-end integration tests, payment gateway webhook audits, and security vulnerability scans for rock-solid reliability."
    },
    {
      step: "05",
      icon: Rocket,
      title: "Cloud Deployment & Production Launch",
      desc: "Seamless rollout to your AWS / VPS / Cloud cluster with Docker containerization, SSL certification, Nginx load balancing, and Play Store / App Store submissions."
    },
    {
      step: "06",
      icon: Headphones,
      title: "24/7 SLA Support & Scaling",
      desc: "Post-launch warranty with bug resolution, automated server uptime monitoring, database backups, and dedicated engineers ready to build your next version."
    }
  ];

  return (
    <section id="process" className="py-24 bg-card/20 relative border-t border-border/40">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="outline" className="px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase border-accent/40 bg-accent/10 text-accent">
            Proven Agile Methodology
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            How We Build <span className="bg-gradient-primary bg-clip-text text-transparent">Enterprise Software</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From preliminary architecture to production launch, our systematic 6-step engineering framework eliminates risks and delivers on time.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((item, idx) => (
            <Card 
              key={idx}
              className="p-6 bg-card/50 backdrop-blur-sm border-border/70 hover:border-primary/40 transition-all duration-300 relative group overflow-hidden"
            >
              {/* Giant Step Number in background */}
              <div className="absolute top-2 right-4 text-5xl font-black text-foreground/[0.04] group-hover:text-primary/10 transition-colors font-mono pointer-events-none">
                {item.step}
              </div>

              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white mb-6 shadow-md shadow-primary/20 group-hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6" />
              </div>

              <div className="text-xs font-mono font-semibold text-accent mb-2">
                PHASE {item.step}
              </div>

              <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {item.title}
              </h3>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Process;
