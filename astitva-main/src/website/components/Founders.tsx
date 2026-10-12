import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  foundersService, 
  FounderProfile, 
  defaultFoundersSeed 
} from "../services/foundersService";
import FounderModal from "./FounderModal";
import { 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpRight, 
  ExternalLink 
} from "lucide-react";

export const Founders = () => {
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

  const handleConnectWithFounder = (founderName: string) => {
    const contactElem = document.getElementById("contact");
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: "smooth" });
      const messageInput = document.getElementById("message") as HTMLTextAreaElement | null;
      if (messageInput) {
        messageInput.value = `Hello, I would like to schedule an executive architectural consultation with ${founderName}.`;
        messageInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  };

  return (
    <section id="founders" className="py-24 bg-card/20 relative border-t border-border/40 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge 
            variant="outline" 
            className="px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase border-accent/40 bg-accent/10 text-accent"
          >
            Executive Leadership &amp; Founders
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            The Visionaries Behind <span className="bg-gradient-primary bg-clip-text text-transparent">Astitva Innovation</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Led by passionate technologists and strategic leaders dedicated to engineering resilient software architectures, high-scale consumer apps, and robust payment platforms.
          </p>
        </div>

        {/* Founders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {founders.map((founder) => (
            <Card
              key={founder.id}
              className="relative overflow-hidden bg-gradient-to-b from-card/90 via-card/60 to-card/95 border-border/70 backdrop-blur-xl shadow-xl hover:border-primary/50 transition-all duration-300 rounded-3xl p-6 sm:p-8 flex flex-col justify-between group"
            >
              <div>
                {/* Top Badge & Status */}
                <div className="flex items-center justify-between gap-3 mb-6">
                  <span className="text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
                    {founder.roleBadge}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Direct Founder Desk
                  </span>
                </div>

                {/* Profile Header */}
                <div className="flex items-center gap-4 sm:gap-5 mb-5">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-lg bg-background/80">
                      <img
                        src={founder.photoUrl}
                        alt={founder.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors">
                      {founder.name}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-accent mt-0.5">
                      {founder.position}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Astitva Innovation
                    </p>
                  </div>
                </div>

                {/* Bio Snippet */}
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                  {founder.bio}
                </p>

                {/* Key Skills */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {founder.keySkills?.slice(0, 4).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-background/60 text-foreground/80 border border-border/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions & Social Links */}
              <div className="pt-5 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                {/* Social Strip */}
                <div className="flex items-center gap-2">
                  {founder.linkedin && (
                    <a
                      href={founder.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-background/80 border border-border/60 hover:border-primary/50 text-muted-foreground hover:text-primary transition-all"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {founder.instagram && (
                    <a
                      href={founder.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-background/80 border border-border/60 hover:border-pink-500/50 text-muted-foreground hover:text-pink-400 transition-all"
                      title="Instagram Profile"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {founder.email && (
                    <a
                      href={`mailto:${founder.email}`}
                      className="p-2 rounded-xl bg-background/80 border border-border/60 hover:border-accent/50 text-muted-foreground hover:text-accent transition-all"
                      title="Corporate Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  <a
                    href={`https://wa.me/917233882089?text=Hello%20${encodeURIComponent(founder.name)},%20I%20would%20like%20to%20discuss%20a%20project%20with%20Astitva%20Innovation.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                    title="WhatsApp"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>

                {/* View Full Portfolio Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenPortfolio(founder)}
                  className="text-xs h-9 border-primary/30 hover:bg-primary/10 hover:border-primary/60 text-foreground font-semibold flex items-center gap-1.5"
                >
                  <span>View Leadership Portfolio</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

      </div>

      {/* Founder Deep-Dive Portfolio Modal */}
      <FounderModal
        founder={selectedFounder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnectWithFounder}
      />
    </section>
  );
};

export default Founders;
