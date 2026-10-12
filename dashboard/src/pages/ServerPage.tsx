import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Server, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  Terminal,
  ShieldCheck,
  Layers
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { APP_CONFIG } from "../constants/config";

export const ServerPage = () => {
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: text,
    });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Production Infrastructure & Architecture Status
        </h1>
        <p className="text-xs text-muted-foreground">
          Dual-application architecture, domain routing, and web server parameters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Corporate Website Routing */}
        <Card className="p-6 bg-card/60 border-border/70 backdrop-blur-sm space-y-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground">Corporate Website</h2>
              <p className="text-xs text-accent font-mono">astitvainnovation.in</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs border-t border-border/60 pt-4">
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Production URL:</span>
              <span className="font-mono text-foreground font-semibold">https://astitvainnovation.in</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">WWW Alias:</span>
              <span className="font-mono text-foreground">www.astitvainnovation.in</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Document Root:</span>
              <span className="font-mono text-foreground">/www/wwwroot/astitvainnovation.in</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Routing Mode:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Standalone React SPA
              </span>
            </div>
          </div>

          <div className="pt-2">
            <a 
              href="https://astitvainnovation.in" 
              target="_blank" 
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-semibold transition-all"
            >
              Open Corporate Website <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </Card>

        {/* B2B Dashboard Routing */}
        <Card className="p-6 bg-card/60 border-border/70 backdrop-blur-sm space-y-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent border border-accent/20 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground">B2B Dashboard</h2>
              <p className="text-xs text-accent font-mono">b2b.astitvainnovation.in</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs border-t border-border/60 pt-4">
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Production URL:</span>
              <span className="font-mono text-foreground font-semibold">https://b2b.astitvainnovation.in</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Document Root:</span>
              <span className="font-mono text-foreground">/www/wwwroot/b2b.astitvainnovation.in</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Search Indexing:</span>
              <span className="font-mono text-amber-400 font-semibold">noindex, nofollow</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Authentication:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Server-Side Bcrypt / JWT
              </span>
            </div>
          </div>

          <div className="pt-2">
            <a 
              href="https://b2b.astitvainnovation.in" 
              target="_blank" 
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 text-xs font-semibold transition-all"
            >
              Authoritative B2B Host <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </Card>

      </div>

      {/* VPS Node & DNS Routing Summary */}
      <Card className="p-6 bg-card/60 border-border/70 backdrop-blur-sm space-y-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-foreground">VPS Server Node</h2>
            <p className="text-xs text-foreground font-mono">217.216.58.223 (Ubuntu Linux)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border/60 pt-4 text-xs">
          <div className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-1">
            <div className="text-muted-foreground font-medium">Domain DNS Resolution</div>
            <div className="font-mono text-emerald-400 font-bold">@ → 217.216.58.223</div>
            <div className="text-[11px] text-muted-foreground">Google DNS 8.8.8.8 Verified</div>
          </div>

          <div className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-1">
            <div className="text-muted-foreground font-medium">B2B Subdomain DNS</div>
            <div className="font-mono text-emerald-400 font-bold">b2b → 217.216.58.223</div>
            <div className="text-[11px] text-muted-foreground">A-Record Active & Synced</div>
          </div>

          <div className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-1">
            <div className="text-muted-foreground font-medium">API Reverse Proxy</div>
            <div className="font-mono text-blue-400 font-bold">/api/ → 127.0.0.1:5000</div>
            <div className="text-[11px] text-muted-foreground">Node.js Express / PM2</div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => handleCopy("sudo nginx -t && sudo systemctl reload nginx")}
            className="text-xs h-9 flex-1"
          >
            <Copy className="w-3 h-3 mr-1.5" />
            Copy Nginx Reload Command
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => handleCopy("pm2 restart astitva-api")}
            className="text-xs h-9 flex-1"
          >
            <Copy className="w-3 h-3 mr-1.5" />
            Copy API Restart Command
          </Button>
        </div>
      </Card>

      {/* Deployment & Non-sensitive Guide Info */}
      <Card className="p-6 bg-card/50 border-border/70 backdrop-blur-sm space-y-4">
        <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
          <Terminal className="w-4 h-4 text-accent" />
          Production Deployment Guidelines (Independent Roots)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-background/60 border border-border/60">
            <div className="text-[11px] text-primary mb-1 font-sans font-semibold">1. Corporate Website Root:</div>
            Extract <code className="text-foreground">astitva-website-dist.zip</code> into:
            <div className="text-foreground mt-1 font-bold">/www/wwwroot/astitvainnovation.in</div>
          </div>

          <div className="p-3 rounded-lg bg-background/60 border border-border/60">
            <div className="text-[11px] text-accent mb-1 font-sans font-semibold">2. B2B Dashboard Root:</div>
            Extract <code className="text-foreground">astitva-b2b-dashboard-dist.zip</code> into:
            <div className="text-foreground mt-1 font-bold">/www/wwwroot/b2b.astitvainnovation.in</div>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default ServerPage;
