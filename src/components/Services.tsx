import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Smartphone, 
  Code, 
  Cloud, 
  Database, 
  Palette,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Bot,
  Layers,
  Users
} from "lucide-react";

export const Services = () => {
  const services = [
    {
      icon: CreditCard,
      highlight: "Specialized",
      title: "Payment Gateway & FinTech Engineering",
      description: "End-to-end integration and custom development of payment gateways including Razorpay, Stripe, Cashfree, UPI QR, and automated recurring billing engines.",
      features: ["UPI Intent & Dynamic QR", "PCI-DSS Level 1 Compliance", "Multi-Gateway Auto-Routing", "Split Vendor Marketplace Payouts"],
    },
    {
      icon: Globe,
      highlight: "Core",
      title: "Enterprise Web & SaaS Platforms",
      description: "Scalable, high-velocity cloud web applications and multi-tenant SaaS architectures built with Next.js, React, Node.js, and serverless edge rendering.",
      features: ["Next.js Server Actions & SSR", "Multi-Tenant Architecture", "RBAC User Permissions", "Automated Subscriptions"],
    },
    {
      icon: Smartphone,
      highlight: "Popular",
      title: "Mobile App Development (iOS & Android)",
      description: "60fps native and cross-platform mobile apps using Flutter and React Native, engineered with offline-first synchronization and biometric security.",
      features: ["Flutter & React Native", "App Store & Play Store Launch", "Real-Time Push Notifications", "In-App Purchases & UPI"],
    },
    {
      icon: Cloud,
      highlight: "DevOps",
      title: "Cloud Infrastructure & DevOps",
      description: "Resilient cloud architectures on AWS, GCP, and DigitalOcean. We implement automated CI/CD pipelines, Docker containers, and Kubernetes auto-scaling.",
      features: ["AWS / GCP Architectures", "Docker & Kubernetes Clusters", "Zero-Downtime Rolling Deploys", "Automated Daily Backups"],
    },
    {
      icon: Bot,
      highlight: "AI Tech",
      title: "AI Integrations & Workflow Automation",
      description: "Supercharge your business operations with custom AI agents, OpenAI/Anthropic LLM API integrations, intelligent chatbots, and predictive algorithms.",
      features: ["Custom AI Agent Workflows", "OpenAI / Claude LLM Pipelines", "Intelligent Support Chatbots", "Automated Data Processing"],
    },
    {
      icon: Layers,
      highlight: "APIs",
      title: "Custom API & System Integrations",
      description: "High-throughput REST and GraphQL microservice APIs connecting CRM, ERP, accounting software, SMS/WhatsApp gateways, and banking webhooks.",
      features: ["REST & GraphQL Microservices", "Banking & Accounting Integrations", "Idempotent Webhook Handlers", "Real-time WebSockets"],
    },
    {
      icon: Palette,
      highlight: "Design",
      title: "UI/UX Strategy & Design Systems",
      description: "Data-driven UI/UX design, interactive Figma prototypes, comprehensive design tokens, and user journey optimization engineered to maximize conversions.",
      features: ["Clickable Figma Prototypes", "Custom Design Tokens & Systems", "Conversion Rate Optimization", "WCAG Accessibility Compliant"],
    },
    {
      icon: Users,
      highlight: "Staffing",
      title: "Dedicated IT Staff Augmentation",
      description: "Scale your internal engineering team quickly with senior pre-vetted full-stack developers, mobile engineers, and DevOps architects on flexible retainers.",
      features: ["Pre-Vetted Senior Engineers", "Direct Slack/Teams Integration", "Flexible Month-to-Month Retainers", "Zero Recruitment Friction"],
    },
  ];

  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="services" className="py-24 bg-card/20 relative border-t border-border/40">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="outline" className="px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase border-primary/40 bg-primary/10 text-primary">
            End-to-End Capabilities
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Comprehensive <span className="bg-gradient-primary bg-clip-text text-transparent">Software Solutions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From specialized payment gateway engineering to full-cycle digital transformation, we deliver software built for high throughput and security.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="p-6 bg-card/50 backdrop-blur-sm border-border/70 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 text-primary">
                    <service.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                    {service.highlight}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold mb-2.5 text-foreground group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>

                <div className="space-y-2 mb-6 pt-4 border-t border-border/60">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="text-xs text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                variant="outline" 
                size="sm"
                className="w-full text-xs group-hover:bg-primary/10 group-hover:border-primary/30"
                onClick={scrollToContact}
              >
                Discuss Project
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Button>
            </Card>
          ))}
        </div>

        {/* CTA Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-card/80 via-card/60 to-card/80 backdrop-blur-md border border-primary/30 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div>
              <h3 className="text-2xl font-bold mb-2">Have a custom technical challenge?</h3>
              <p className="text-sm text-muted-foreground">
                Our principal software architects are available for a 30-minute free technical discovery call.
              </p>
            </div>
            <Button 
              variant="hero" 
              size="lg"
              onClick={scrollToContact}
              className="shrink-0 whitespace-nowrap"
            >
              Book Technical Consultation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Services;