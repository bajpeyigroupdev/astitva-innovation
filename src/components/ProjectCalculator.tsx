import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Check, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Code2, 
  FileText
} from "lucide-react";

interface ProjectCalculatorProps {
  onSelectScope?: (scopeDetails: string) => void;
}

export const ProjectCalculator = ({ onSelectScope }: ProjectCalculatorProps) => {
  const [platform, setPlatform] = useState("web");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "payment",
    "auth",
    "admin"
  ]);
  const [timeline, setTimeline] = useState("standard");

  const platforms = [
    { id: "web", label: "Web Application / SaaS", baseCost: 45000, weeks: 4 },
    { id: "mobile", label: "Mobile App (iOS & Android)", baseCost: 65000, weeks: 5 },
    { id: "both", label: "Cross-Platform (Web + Mobile)", baseCost: 95000, weeks: 7 },
    { id: "fintech", label: "FinTech & Payment Gateway Engine", baseCost: 75000, weeks: 5 },
  ];

  const featureOptions = [
    { id: "payment", label: "Payment Gateway (Razorpay/Stripe/UPI)", cost: 15000, days: 5 },
    { id: "auth", label: "User Auth, Roles & OAuth 2.0", cost: 10000, days: 3 },
    { id: "admin", label: "Admin Analytics & Reporting Dashboard", cost: 18000, days: 6 },
    { id: "ai", label: "AI Integration & Automated Workflows", cost: 25000, days: 7 },
    { id: "realtime", label: "Realtime Chat / Voice / WebSockets", cost: 22000, days: 6 },
    { id: "cloud", label: "Cloud DevOps, CI/CD & Auto-Scaling", cost: 20000, days: 5 },
  ];

  const toggleFeature = (id: string) => {
    if (selectedFeatures.includes(id)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== id));
    } else {
      setSelectedFeatures([...selectedFeatures, id]);
    }
  };

  const currentPlatform = platforms.find(p => p.id === platform) || platforms[0];
  
  const featuresCost = selectedFeatures.reduce((acc, featId) => {
    const feat = featureOptions.find(f => f.id === featId);
    return acc + (feat ? feat.cost : 0);
  }, 0);

  const totalCost = currentPlatform.baseCost + featuresCost;
  const estimatedWeeks = currentPlatform.weeks + Math.ceil(selectedFeatures.length * 0.6);

  const handleBookScope = () => {
    const featureNames = selectedFeatures
      .map(f => featureOptions.find(opt => opt.id === f)?.label)
      .filter(Boolean)
      .join(", ");

    const scopeSummary = `Platform: ${currentPlatform.label} | Estimated Budget: ₹${totalCost.toLocaleString('en-IN')} | Timeline: ~${estimatedWeeks} Weeks | Features: ${featureNames}`;

    if (onSelectScope) {
      onSelectScope(scopeSummary);
    }

    const contactEl = document.getElementById("contact");
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="calculator" className="py-24 bg-card/30 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="outline" className="px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase border-primary/40 bg-primary/10 text-primary">
            Transparent Scoping
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Interactive <span className="bg-gradient-primary bg-clip-text text-transparent">Project Cost Estimator</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Configure your technical requirements to generate an instant timeline and budgetary estimate for your software project.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-8 bg-card/60 border border-border/70 p-6 md:p-8 rounded-2xl backdrop-blur-sm">
            
            {/* Step 1: Select Platform */}
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                1. Select Platform Architecture
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {platforms.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                      platform === p.id 
                        ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/40" 
                        : "border-border/60 bg-background/40 text-muted-foreground hover:bg-card hover:border-border"
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">{p.label}</div>
                    <div className="text-xs text-muted-foreground">From ~{p.weeks} weeks delivery</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Select Features */}
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                2. Key Engineering Features
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {featureOptions.map(feat => {
                  const isChecked = selectedFeatures.includes(feat.id);
                  return (
                    <button
                      key={feat.id}
                      type="button"
                      onClick={() => toggleFeature(feat.id)}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all duration-200 ${
                        isChecked
                          ? "border-accent/60 bg-accent/10 text-foreground"
                          : "border-border/60 bg-background/40 text-muted-foreground hover:bg-card"
                      }`}
                    >
                      <div className="text-xs font-medium pr-2">{feat.label}</div>
                      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                        isChecked ? "bg-accent border-accent text-white" : "border-border"
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Timeline Speed */}
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                3. Delivery Velocity
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "standard", label: "Standard Sprint", desc: "Best value balance" },
                  { id: "accelerated", label: "Fast-Track", desc: "Dual sprint team" },
                  { id: "mvp", label: "Rapid MVP", desc: "Core release first" },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTimeline(item.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      timeline === item.id 
                        ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/40" 
                        : "border-border/60 bg-background/40 text-muted-foreground hover:bg-card"
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Results / Estimate Card */}
          <div className="lg:col-span-5">
            <Card className="p-6 md:p-8 bg-gradient-to-br from-card/90 to-card/50 border border-primary/30 rounded-2xl shadow-xl backdrop-blur-md sticky top-28">
              <div className="flex items-center justify-between pb-6 border-b border-border/70">
                <div>
                  <h3 className="font-bold text-lg">Estimated Scope</h3>
                  <p className="text-xs text-muted-foreground">Fixed-scope preliminary quote</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                  <Calculator className="w-5 h-5" />
                </div>
              </div>

              {/* Price & Time */}
              <div className="py-6 space-y-4">
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Estimated Investment</span>
                  <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-primary mt-1">
                    ₹{totalCost.toLocaleString("en-IN")}
                    <span className="text-xs font-normal text-muted-foreground ml-2">est.</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    (or ~${Math.round(totalCost / 85)} USD for international clients)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-background/60 border border-border/70 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-4 h-4 text-accent" />
                    <span>Estimated Delivery:</span>
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    ~{estimatedWeeks} Weeks
                  </div>
                </div>
              </div>

              {/* What's Included */}
              <div className="space-y-2.5 py-4 border-t border-border/70 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Complete Source Code & IP Ownership</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Non-Disclosure Agreement (NDA) Protected</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>CI/CD Automated Deployment to Your Server</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>60 Days Complimentary Post-Launch Support</span>
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full text-sm font-semibold py-6"
                  onClick={handleBookScope}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Request Official Scope & Architecture Call
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-center text-[11px] text-muted-foreground mt-2.5">
                  No obligation. Includes a free technical architecture consultation.
                </p>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProjectCalculator;
