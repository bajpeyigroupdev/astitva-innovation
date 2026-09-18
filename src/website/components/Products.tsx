import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PhoneCall, 
  Users, 
  UserCheck, 
  Gift, 
  Wallet, 
  Shield, 
  ShieldAlert, 
  Sparkles, 
  HeartHandshake,
  ExternalLink,
  Smartphone,
  CheckCircle2
} from "lucide-react";

export const Products = () => {
  const meethiChatFeatures = [
    {
      icon: PhoneCall,
      title: "Real-Time 1-on-1 Voice Calling",
      description: "Ultra-low latency private voice calls optimized for clear communication across 2G, 3G, 4G, and Wi-Fi networks.",
    },
    {
      icon: Sparkles,
      title: "Smart Matchmaking",
      description: "Intelligent interest-based matchmaking algorithm to discover compatible friends and conversation partners.",
    },
    {
      icon: UserCheck,
      title: "Profile Customization",
      description: "Personalized avatars, expressive bios, voice tags, and custom badges to showcase your unique personality.",
    },
    {
      icon: Gift,
      title: "Virtual Gifting",
      description: "Vibrant animated virtual gifts to express appreciation, celebrate milestones, and spark engaging connections.",
    },
    {
      icon: Wallet,
      title: "Wallet & Recharge",
      description: "Secure in-app wallet infrastructure for seamless coin balance tracking, instant recharges, and rewards.",
    },
    {
      icon: Shield,
      title: "Privacy Controls",
      description: "Granular visibility settings, end-to-end user privacy, and caller controls to keep conversations completely safe.",
    },
    {
      icon: ShieldAlert,
      title: "Block & Report",
      description: "Instant one-tap block and rapid incident reporting tools ensuring zero tolerance for harassment.",
    },
    {
      icon: Users,
      title: "Host & User Connections",
      description: "Dynamic creator ecosystem connecting verified talent hosts with engaged audiences in real time.",
    },
    {
      icon: HeartHandshake,
      title: "Safe and Respectful Community",
      description: "24/7 automated safety filters and active community moderation upholding respectful, friendly interactions.",
    },
  ];

  return (
    <section id="products" className="py-24 bg-card/10 relative border-t border-border/40 overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge 
            variant="outline" 
            className="px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase border-primary/40 bg-primary/10 text-primary"
          >
            Our Products
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Proprietary Software Platforms by <span className="bg-gradient-primary bg-clip-text text-transparent">Astitva Innovation</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            In addition to enterprise client engineering, we conceive, build, and publish high-engagement consumer platforms that scale to thousands of simultaneous real-time users.
          </p>
        </div>

        {/* Featured Product: Meethi Chat */}
        <div className="max-w-6xl mx-auto">
          <Card className="relative overflow-hidden bg-gradient-to-b from-card/80 via-card/50 to-card/90 border-border/80 backdrop-blur-xl shadow-2xl p-6 md:p-10 rounded-3xl border">
            
            {/* Top Product Header Banner */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-border/60">
              
              {/* Product Identity */}
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-primary/40 shadow-xl bg-background/80 flex items-center justify-center p-1">
                    <img 
                      src="/meethi-chat-icon.png" 
                      alt="Meethi Chat App Icon - Social Voice & Friendship Platform" 
                      width="96"
                      height="96"
                      className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md" title="Verified App">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-accent/15 text-accent font-semibold border border-accent/30">
                      Official Flagship App
                    </span>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      Social Voice &amp; Friendship Platform
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Official Release
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight">
                    Meethi Chat <span className="text-xl md:text-3xl font-semibold text-muted-foreground">— Social Voice &amp; Friendship Platform</span>
                  </h3>
                  
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Developed &amp; Published by <span className="text-foreground font-semibold">Astitva Innovation</span> • Package: <code className="font-mono text-accent">com.umangchatlive</code>
                  </p>
                </div>
              </div>

              {/* Google Play CTA Button */}
              <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href="https://play.google.com/store/apps/details?id=com.umangchatlive&hl=en_IN"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-3.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-zinc-900 via-neutral-900 to-black text-white border border-neutral-700 hover:border-emerald-500/60 shadow-xl hover:shadow-emerald-500/10 transition-all duration-300"
                  aria-label="Download Meethi Chat on Google Play Store - Social Voice and Friendship Platform"
                >
                  <svg className="w-6 h-6 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none">
                    <path d="M3.609 1.814L13.793 12 3.61 22.186c-.347-.282-.57-.704-.57-1.186V3c0-.482.223-.904.57-1.186z" fill="#00D2FF"/>
                    <path d="M17.18 8.614L13.793 12l3.387 3.386 3.84-2.194c1.093-.625 1.093-1.649 0-2.274l-3.84-2.304z" fill="#FFCE00"/>
                    <path d="M3.609 1.814L13.793 12 17.18 8.614 7.234 2.93C5.97 2.21 4.547 1.8 3.61 1.814z" fill="#00F076"/>
                    <path d="M3.609 22.186L13.793 12l3.387 3.386-9.946 5.684c-.937.535-2.36.396-3.625-.884z" fill="#FF3A44"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] tracking-widest uppercase text-neutral-400 font-mono leading-none">
                      Get it on
                    </div>
                    <div className="text-base font-bold text-white tracking-tight leading-tight">
                      Google Play
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-emerald-400 transition-colors ml-1" />
                </a>
              </div>

            </div>

            {/* Product Overview Summary */}
            <div className="py-8">
              <h4 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold mb-2">
                About the Platform
              </h4>
              <p className="text-base md:text-lg text-foreground/90 leading-relaxed max-w-5xl">
                <strong className="text-foreground font-semibold">Meethi Chat</strong> is a premium social voice platform designed for meaningful one-to-one conversations, friendships, and real-time voice calling. Users can discover people through smart matchmaking, personalize their profiles, send virtual gifts, and manage their wallet while enjoying private and engaging conversations.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" /> Key Capabilities & Architecture
                </h4>
                <span className="text-xs text-muted-foreground">9 Specialized Features</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meethiChatFeatures.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div 
                      key={idx} 
                      className="p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/40 transition-all duration-200 group flex items-start gap-3.5"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {feat.title}
                        </h5>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {feat.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom App Metrics Strip */}
            <div className="mt-8 pt-6 border-t border-border/60 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-foreground font-medium">Real-Time WebRTC Audio Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-foreground font-medium">Verified Host Ecosystem</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-foreground font-medium">Safe Community Guidelines</span>
                </div>
              </div>

              <div>
                <a
                  href="https://play.google.com/store/apps/details?id=com.umangchatlive&hl=en_IN"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:text-accent font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  View on Google Play Store <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </Card>
        </div>

      </div>
    </section>
  );
};

export default Products;
