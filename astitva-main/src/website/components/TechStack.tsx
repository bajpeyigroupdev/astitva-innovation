import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Code2, 
  Layers, 
  Smartphone, 
  Database, 
  Cloud, 
  CreditCard, 
  Cpu, 
  Server,
  Zap,
  Globe
} from "lucide-react";

export const TechStack = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Technologies" },
    { id: "frontend", label: "Frontend & UI" },
    { id: "backend", label: "Backend & Microservices" },
    { id: "mobile", label: "Mobile Apps" },
    { id: "fintech", label: "FinTech & Payments" },
    { id: "cloud", label: "Cloud & DevOps" },
    { id: "database", label: "Databases & Storage" },
  ];

  const technologies = [
    // Frontend
    { name: "React 18 / 19", category: "frontend", level: "Production Standard", desc: "Interactive enterprise web apps & state machines", icon: "⚛️" },
    { name: "Next.js", category: "frontend", level: "Full-Stack Web", desc: "Server-side rendering, SEO-optimized portals & edge rendering", icon: "▲" },
    { name: "TypeScript", category: "frontend", level: "Type Safety", desc: "Static type verification for enterprise stability", icon: "📘" },
    { name: "Tailwind CSS", category: "frontend", level: "Modern Styling", desc: "Pixel-perfect responsive design systems & animations", icon: "🎨" },

    // Backend
    { name: "Node.js / Express", category: "backend", level: "High Throughput", desc: "Event-driven asynchronous microservices & real-time APIs", icon: "🟢" },
    { name: "Python / FastAPI", category: "backend", level: "AI & High Speed", desc: "Asynchronous APIs, ML model serving & enterprise data engines", icon: "🐍" },
    { name: "Go (Golang)", category: "backend", level: "Ultra-Low Latency", desc: "Concurrent networking services, WebSockets & gateways", icon: "🐹" },
    { name: "REST & GraphQL", category: "backend", level: "API Protocols", desc: "Type-safe schemas, webhook pipelines & third-party integrations", icon: "⚡" },

    // Mobile
    { name: "Flutter", category: "mobile", level: "Cross-Platform", desc: "60fps native compiled apps for iOS and Android from single codebase", icon: "📱" },
    { name: "React Native", category: "mobile", level: "Native Bridge", desc: "High-performance JavaScript powered native mobile experiences", icon: "📲" },
    { name: "Native iOS (Swift)", category: "mobile", level: "Apple Ecosystem", desc: "Deep Apple hardware integration, CoreML & Apple Pay", icon: "🍏" },
    { name: "Native Android (Kotlin)", category: "mobile", level: "Google Play", desc: "Jetpack Compose, Android biometric auth & background workers", icon: "🤖" },

    // FinTech & Payments
    { name: "Razorpay PG & Route", category: "fintech", level: "India Tier-1", desc: "UPI intent, card tokenization, subscriptions & smart routing", icon: "💳" },
    { name: "Stripe Connect & Billing", category: "fintech", level: "Global Standard", desc: "Cross-border payments, SaaS metered billing & card payouts", icon: "🌐" },
    { name: "Cashfree Payments", category: "fintech", level: "Disbursements", desc: "Auto-collect, instant marketplace vendor settlement & UPI links", icon: "⚡" },
    { name: "UPI 2.0 & QR Engine", category: "fintech", level: "Real-Time Rail", desc: "Direct deep-linking with PhonePe, GPay, Paytm & bank mandates", icon: "🔗" },

    // Cloud & DevOps
    { name: "AWS (Amazon Web Services)", category: "cloud", level: "Global Cloud", desc: "EC2, S3, RDS, Lambda, CloudFront & CloudWatch monitoring", icon: "☁️" },
    { name: "Docker & Kubernetes", category: "cloud", level: "Containerization", desc: "Isolated microservice orchestration & zero-downtime rolling deploys", icon: "🐳" },
    { name: "Nginx & Load Balancing", category: "cloud", level: "Reverse Proxy", desc: "SSL termination, HTTP/2 multiplexing, caching & rate limiting", icon: "🛡️" },
    { name: "GitHub Actions CI/CD", category: "cloud", level: "Automation", desc: "Automated linting, testing, Docker build & automated production release", icon: "⚙️" },

    // Databases
    { name: "PostgreSQL", category: "database", level: "Relational ACID", desc: "Enterprise relational database with JSONB and transaction safety", icon: "🐘" },
    { name: "MongoDB", category: "database", level: "Document Store", desc: "Dynamic document schemas for high-speed document indexing", icon: "🍃" },
    { name: "Redis", category: "database", level: "In-Memory Cache", desc: "Microsecond caching, pub/sub queues & user session storage", icon: "🔴" },
    { name: "Supabase", category: "database", level: "Realtime Database", desc: "Postgres-backed realtime subscriptions, auth & row-level security", icon: "⚡" },
  ];

  const filteredTech = activeCategory === "all" 
    ? technologies 
    : technologies.filter(t => t.category === activeCategory);

  return (
    <section id="tech-stack" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="outline" className="px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase border-primary/40 bg-primary/10 text-primary">
            Battle-Tested Architecture
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Our Enterprise <span className="bg-gradient-primary bg-clip-text text-transparent">Technology Stack</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We leverage cutting-edge, proven frameworks, cloud platforms, and security standards to guarantee speed, reliability, and infinite scale.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-primary text-white shadow-glow"
                  : "bg-card/60 text-muted-foreground hover:text-foreground hover:bg-card border border-border/60"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Technologies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredTech.map((tech, idx) => (
            <Card 
              key={idx}
              className="p-5 bg-card/40 backdrop-blur-sm border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">{tech.icon}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {tech.level}
                </span>
              </div>
              <h3 className="font-bold text-base text-foreground mb-1 group-hover:text-primary transition-colors">
                {tech.name}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tech.desc}
              </p>
            </Card>
          ))}
        </div>

        {/* Architecture Guarantee */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 px-6 py-3 rounded-full bg-card/60 border border-border/80 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Zap className="w-4 h-4 text-accent" /> Zero Vendor Lock-in
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Server className="w-4 h-4 text-accent" /> 99.99% Availability SLA
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Cpu className="w-4 h-4 text-accent" /> Clean Architecture & Microservices
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TechStack;
