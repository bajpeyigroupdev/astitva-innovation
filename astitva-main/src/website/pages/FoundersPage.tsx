import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AiAgentWidget from "../components/AiAgentWidget";
import { foundersService, FounderProfile, defaultFoundersSeed } from "../services/foundersService";
import FounderModal from "../components/FounderModal";
import { 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowUpRight, 
  ExternalLink,
  Award,
  Cpu,
  Globe2,
  CheckCircle2,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const FoundersPage = () => {
  const [founders, setFounders] = useState<FounderProfile[]>(defaultFoundersSeed);
  const [selectedFounder, setSelectedFounder] = useState<FounderProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    foundersService.getFounders().then((data) => {
      if (data && data.length > 0) {
        setFounders(data);
      }
    });
  }, []);

  const handleOpenPortfolio = (founder: FounderProfile) => {
    setSelectedFounder(founder);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Homepage
            </Link>
            <Badge variant="outline" className="text-[10px] font-mono border-accent/40 bg-accent/10 text-accent">
              Executive Leadership &amp; Board
            </Badge>
          </div>

          {/* Hero Banner */}
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-card via-card/80 to-background border border-border/80 shadow-2xl relative overflow-hidden mb-12 text-center md:text-left">
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
            
            <Badge 
              variant="outline" 
              className="px-3.5 py-1 mb-4 text-xs font-semibold tracking-wider uppercase border-accent/40 bg-accent/10 text-accent"
            >
              Founders &amp; Technology Architects
            </Badge>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              The Visionaries Behind <span className="bg-gradient-primary bg-clip-text text-transparent">Astitva Innovation</span>
            </h1>

            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              Founded on the principles of engineering excellence, high-concurrency real-time protocols, and zero-compromise architectural integrity. Meet the architects spearheading digital transformation for enterprises worldwide.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6 pt-6 border-t border-border/60 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Cpu className="w-4 h-4 text-primary" />
                <span>WebRTC &amp; High-Throughput Engines</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe2 className="w-4 h-4 text-accent" />
                <span>Global Consumer Platforms</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bank-Grade FinTech Architecture</span>
              </div>
            </div>
          </div>

          {/* Founders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {founders.map((founder) => (
              <Card
                key={founder.id}
                className="group relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/70 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 flex flex-col justify-between"
              >
                <div>
                  {/* Photo & Role Header */}
                  <div className="relative h-72 w-full overflow-hidden bg-background/50">
                    <img
                      src={founder.photoUrl}
                      alt={founder.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-background/90 backdrop-blur-md text-foreground border border-border/60 shadow-lg text-[11px] font-semibold py-1 px-3">
                        <Sparkles className="w-3 h-3 mr-1.5 text-accent animate-pulse" />
                        {founder.roleBadge}
                      </Badge>
                    </div>

                    {/* Direct Contact Overlay Pill */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                      <a
                        href={`https://wa.me/917233882089?text=Hello%20${encodeURIComponent(founder.name)},%20I%20would%20like%20to%20discuss%20a%20project%20with%20Astitva%20Innovation.`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-white shadow-lg backdrop-blur transition-transform hover:scale-110"
                        title="Chat on WhatsApp"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={`mailto:${founder.email}`}
                        className="p-2 rounded-xl bg-primary/90 hover:bg-primary text-white shadow-lg backdrop-blur transition-transform hover:scale-110"
                        title="Direct Email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {founder.name}
                    </h3>
                    <p className="text-xs font-semibold text-accent mb-4">
                      {founder.position}
                    </p>

                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-6">
                      {founder.portfolioSummary || founder.bio}
                    </p>

                    {/* Skills Pills */}
                    {founder.keySkills && founder.keySkills.length > 0 && (
                      <div className="space-y-2 mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Core Architectural Domain
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {founder.keySkills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-background/80 border border-border/70 text-muted-foreground font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-6 pt-0 border-t border-border/40 mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {founder.linkedin && (
                      <a
                        href={founder.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
                        title="LinkedIn Profile"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {founder.instagram && (
                      <a
                        href={founder.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
                        title="Instagram Profile"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenPortfolio(founder)}
                    className="text-xs border-primary/30 hover:bg-primary/10 gap-1.5"
                  >
                    <span>Full Portfolio &amp; Dossier</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Consultation Banner */}
          <div className="mt-16 p-8 rounded-3xl bg-card/60 border border-border/70 backdrop-blur-xl text-center flex flex-col items-center max-w-2xl mx-auto space-y-4">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-mono text-[10px]">
              Direct Executive Access
            </Badge>
            <h3 className="text-xl md:text-2xl font-bold">
              Want to Discuss a Scalable Platform Directly with the Founders?
            </h3>
            <p className="text-xs text-muted-foreground max-w-md">
              Skip intermediate sales layers. Book an architectural discovery call with Shivansh Kamal Bajpeyi (CEO) or Shiv Prakash (COO) directly on WhatsApp or our direct desk.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs gap-2">
                <a 
                  href="https://wa.me/917233882089?text=Hello%20Founders,%20I%20would%20like%20to%20schedule%20an%20executive%20architecture%20call%20with%20Astitva%20Innovation."
                  target="_blank"
                  rel="noreferrer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  WhatsApp Direct Desk (+91 7233882089)
                </a>
              </Button>
              <Button asChild variant="outline" className="text-xs">
                <Link to="/#contact">
                  Send Formal RFP / Inquiry
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
      <AiAgentWidget />

      {/* Portfolio Modal */}
      <FounderModal
        founder={selectedFounder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={(name) => {
          setIsModalOpen(false);
          window.location.href = `https://wa.me/917233882089?text=Hello%20${encodeURIComponent(name)},%20I%20would%20like%20to%20schedule%20an%20executive%20architecture%20consultation.`;
        }}
      />
    </div>
  );
};

export default FoundersPage;
