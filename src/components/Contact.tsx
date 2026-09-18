import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  Clock, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2,
  Sparkles,
  ExternalLink
} from "lucide-react";

interface ContactProps {
  prefilledScope?: string;
}

export const Contact = ({ prefilledScope }: ContactProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "FinTech & Payment Gateway",
    budget: "₹1,50,000 - ₹5,00,000",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (prefilledScope) {
      setFormData(prev => ({
        ...prev,
        message: prev.message 
          ? `${prev.message}\n\n[Project Scope Calculator Estimate]:\n${prefilledScope}` 
          : `[Project Scope Calculator Estimate]:\n${prefilledScope}`
      }));
    }
  }, [prefilledScope]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Save inquiry to localStorage for Admin Panel
    const newInquiry = {
      id: "INQ-" + Math.floor(1000 + Math.random() * 9000),
      name: formData.name,
      email: formData.email,
      phone: formData.phone || "Not provided",
      service: formData.service,
      budget: formData.budget,
      message: formData.message,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      status: "New"
    };

    try {
      const existing = JSON.parse(localStorage.getItem("astitva_inquiries") || "[]");
      localStorage.setItem("astitva_inquiries", JSON.stringify([newInquiry, ...existing]));
    } catch (err) {
      console.error("Failed to store inquiry:", err);
    }

    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 900));

    toast({
      title: "Inquiry Received Successfully!",
      description: "Our Technical Director will review your project scope and contact you within 2 business hours.",
    });

    setFormData({
      name: "",
      email: "",
      phone: "",
      service: "FinTech & Payment Gateway",
      budget: "₹1,50,000 - ₹5,00,000",
      message: ""
    });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "General Inquiries",
      detail: "contact@astitvainnovation.in",
      sub: "Average reply time: < 2 hours",
      action: "mailto:contact@astitvainnovation.in"
    },
    {
      icon: Mail,
      title: "Enterprise Sales",
      detail: "sales@astitvainnovation.in",
      sub: "For RFPs, contracts & SOWs",
      action: "mailto:sales@astitvainnovation.in"
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Engineering Desk",
      detail: "+91 98765 43210",
      sub: "Instant technical chat support",
      action: "https://wa.me/919876543210?text=Hi%20Astitva%20Innovation,%20I%20would%20like%20to%20discuss%20a%20software%20project."
    },
    {
      icon: Clock,
      title: "Engineering Hours",
      detail: "Mon - Sat: 9:30 AM - 7:30 PM IST",
      sub: "24/7 SLA for emergency incidents",
      action: "#"
    }
  ];

  return (
    <section id="contact" className="py-24 bg-card/20 relative border-t border-border/40">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="outline" className="px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase border-accent/40 bg-accent/10 text-accent">
            Start Your Project
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Request an Architecture Review & <span className="bg-gradient-primary bg-clip-text text-transparent">Quote</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Connect directly with our senior software architects. Receive a detailed proposal, timeline breakdown, and tech stack consultation within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-start">
          
          {/* Left Column: Direct channels */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-card/60 border border-border/70 backdrop-blur-sm space-y-4">
              <h3 className="text-xl font-bold text-foreground">
                Let's Build Something Exceptional
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Whether you need a full-scale FinTech payment integration, custom SaaS platform, or dedicated engineering squad, we are ready to accelerate your delivery.
              </p>

              <div className="pt-2 space-y-3">
                {contactInfo.map((info, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (info.action && info.action !== "#") {
                        window.open(info.action, "_blank");
                      }
                    }}
                    className="p-3.5 rounded-xl bg-background/50 border border-border/60 hover:border-primary/40 transition-all cursor-pointer group flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                      <info.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {info.title}
                      </div>
                      <div className="text-xs font-mono text-accent mt-0.5">
                        {info.detail}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {info.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guarantees Box */}
            <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 text-xs space-y-2 text-muted-foreground">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Confidentiality Guaranteed</span>
              </div>
              <p className="text-[11px]">
                Your intellectual property is protected by strict Non-Disclosure Agreements. We never share your project specs or business ideas.
              </p>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-md border border-border/70 shadow-2xl rounded-2xl">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Your Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Rahul Sharma"
                      className="bg-background/60 border-border/80 text-xs h-11"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Business Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@company.com"
                      className="bg-background/60 border-border/80 text-xs h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Phone / WhatsApp Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="bg-background/60 border-border/80 text-xs h-11"
                    />
                  </div>

                  <div>
                    <label htmlFor="service" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Primary Service Needed
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className="w-full h-11 px-3 rounded-md bg-background/60 border border-border/80 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="FinTech & Payment Gateway">FinTech & Payment Gateway Integration</option>
                      <option value="Custom Web & SaaS Platform">Custom Web & SaaS Platform</option>
                      <option value="Mobile App (iOS & Android)">Mobile App (iOS & Android)</option>
                      <option value="Cloud DevOps & Microservices">Cloud DevOps & Microservices</option>
                      <option value="AI Agent & LLM Automation">AI Agent & LLM Automation</option>
                      <option value="Dedicated Developer Squad">Dedicated Developer Squad</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="budget" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Estimated Budget Tier
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full h-11 px-3 rounded-md bg-background/60 border border-border/80 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="₹50,000 - ₹1,50,000">₹50,000 - ₹1,50,000 (Rapid MVP / Module)</option>
                    <option value="₹1,50,000 - ₹5,00,000">₹1,50,000 - ₹5,00,000 (Complete Web/Mobile Product)</option>
                    <option value="₹5,00,000 - ₹15,00,000">₹5,00,000 - ₹15,00,000 (Enterprise / FinTech Engine)</option>
                    <option value="₹15,00,000+">₹15,00,000+ (High-Scale Multi-Platform)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Project Overview / Technical Requirements *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Describe your product idea, required features (e.g. payment gateway, user auth), or specific timeline..."
                    className="bg-background/60 border-border/80 text-xs resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full py-6 text-sm font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Dispatching Scope to Solutions Architect...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Project Scope for Review
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> No Obligation
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> Free Architecture Consultation
                  </span>
                </div>

              </form>
            </Card>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Contact;