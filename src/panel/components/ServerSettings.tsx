import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Server, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  Terminal,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ServerSettings = () => {
  const { toast } = useToast();

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    toast({
      title: "Command Copied!",
      description: cmd,
    });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          Server Infrastructure & DNS Health
        </h2>
        <p className="text-xs text-muted-foreground">
          Live DNS resolution, Nginx reverse proxy configuration, and deployment pathways
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Domain Health Card */}
        <Card className="p-6 bg-card/60 border-border/70 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Production Domain</h3>
              <p className="text-xs text-accent font-mono">astitvainnovation.in</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs border-t border-border/60 pt-4">
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Canonical URL:</span>
              <span className="font-mono text-foreground font-semibold">https://astitvainnovation.in</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">WWW Alias:</span>
              <span className="font-mono text-foreground">www.astitvainnovation.in</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Public Authoritative IP:</span>
              <span className="font-mono text-emerald-400 font-bold">217.216.58.223</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">DNS Conflict Check:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Resolved (Old 2.57.91.91 removed)
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
              Open Live Domain <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </Card>

        {/* Server Host Card */}
        <Card className="p-6 bg-card/60 border-border/70 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent border border-accent/20 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">VPS Server Node</h3>
              <p className="text-xs text-foreground font-mono">217.216.58.223 (Ubuntu 24.04)</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs border-t border-border/60 pt-4">
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Web Server:</span>
              <span className="font-mono text-foreground">Nginx 1.24.0 (Ubuntu)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Website Directory:</span>
              <span className="font-mono text-foreground">/www/wwwroot/astitvainnovation.in</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">SSL Engine:</span>
              <span className="text-emerald-400 font-semibold font-mono">Let's Encrypt TLS v1.3</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Compression:</span>
              <span className="font-mono text-foreground font-semibold">Gzip Level 6 (Active)</span>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => copyCommand("sudo nginx -t && sudo systemctl reload nginx")}
              className="w-full text-xs h-9"
            >
              <Copy className="w-3 h-3 mr-1.5" />
              Copy Nginx Reload Command
            </Button>
          </div>
        </Card>

      </div>

      {/* Deployment & Guide Info */}
      <Card className="p-6 bg-card/50 border-border/70 backdrop-blur-sm space-y-4">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          <Terminal className="w-4 h-4 text-accent" />
          Server Deployment Instructions
        </h3>

        <div className="space-y-2 text-xs text-muted-foreground font-mono">
          <div className="p-3 rounded-lg bg-background/60 border border-border/60">
            <div className="text-[11px] text-accent mb-1 font-sans font-semibold">1. Deploy via Upload:</div>
            Extract the ready-to-deploy <strong className="text-foreground">astitva-dist.zip</strong> into:
            <div className="text-foreground mt-1">/www/wwwroot/astitvainnovation.in</div>
          </div>

          <div className="p-3 rounded-lg bg-background/60 border border-border/60">
            <div className="text-[11px] text-accent mb-1 font-sans font-semibold">2. Apply Nginx Configuration:</div>
            Place configuration from <strong className="text-foreground">nginx_astitvainnovation.conf</strong> into:
            <div className="text-foreground mt-1">/etc/nginx/sites-available/astitvainnovation.in (or in aaPanel Vhost)</div>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default ServerSettings;
