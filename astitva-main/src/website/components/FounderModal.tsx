import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FounderProfile } from "../services/foundersService";
import { 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  Sparkles, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink
} from "lucide-react";

interface FounderModalProps {
  founder: FounderProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (founderName: string) => void;
}

export const FounderModal = ({ founder, isOpen, onClose, onConnect }: FounderModalProps) => {
  if (!founder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-card/95 border-border/80 backdrop-blur-2xl p-6 md:p-8 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{founder.name} — Executive Portfolio</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Top Profile Banner */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-border/60">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-primary/40 shadow-xl bg-background/80">
                <img
                  src={founder.photoUrl}
                  alt={founder.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Badge variant="outline" className="text-xs font-mono border-primary/40 bg-primary/10 text-primary">
                  {founder.roleBadge}
                </Badge>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Verified Founder
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                {founder.name}
              </h3>
              <p className="text-sm font-medium text-muted-foreground">
                {founder.position} • <span className="text-foreground">Astitva Innovation</span>
              </p>

              {/* Social Channels Strip */}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                {founder.linkedin && (
                  <a
                    href={founder.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-background/80 border border-border/60 hover:border-primary/50 text-muted-foreground hover:text-primary transition-all"
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
                    className="p-2 rounded-lg bg-background/80 border border-border/60 hover:border-pink-500/50 text-muted-foreground hover:text-pink-400 transition-all"
                    title="Instagram Profile"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {founder.email && (
                  <a
                    href={`mailto:${founder.email}`}
                    className="p-2 rounded-lg bg-background/80 border border-border/60 hover:border-accent/50 text-muted-foreground hover:text-accent transition-all"
                    title="Corporate Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
                {founder.phone && (
                  <a
                    href={`https://wa.me/${founder.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(founder.name)},%20I%20am%20reaching%20out%20via%20Astitva%20Innovation%20leadership%20portfolio.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                    title="WhatsApp Directly"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Executive Vision / Bio */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Executive Bio & Vision
            </h4>
            <p className="text-sm md:text-base text-foreground/90 leading-relaxed bg-background/40 p-4 rounded-2xl border border-border/50">
              {founder.bio}
            </p>
          </div>

          {/* Leadership & Project Portfolio */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> Technical & Organizational Leadership Portfolio
            </h4>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed bg-card/60 p-4 rounded-2xl border border-border/50">
              {founder.portfolioSummary}
            </p>
          </div>

          {/* Core Competencies */}
          {founder.keySkills && founder.keySkills.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Strategic Competencies & Domains
              </h4>
              <div className="flex flex-wrap gap-2">
                {founder.keySkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Direct CTA */}
          <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              Direct Desk: <span className="font-mono text-foreground font-semibold">+91 7233882089</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs border-border/80 flex-1 sm:flex-initial"
              >
                Close
              </Button>
              <Button
                variant="hero"
                size="sm"
                onClick={() => {
                  onClose();
                  onConnect(founder.name);
                }}
                className="text-xs flex-1 sm:flex-initial"
              >
                Connect with {founder.name.split(" ")[0]}
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FounderModal;
