import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, FileText, Printer, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { APP_CONFIG } from "../constants/config";

export const ProposalsPage = () => {
  const [clientName, setClientName] = useState("Acme Global Innovations");
  const [clientEmail, setClientEmail] = useState("client@acme.com");
  const [projectTitle, setProjectTitle] = useState("FinTech Multi-Gateway Engine & Web Platform");
  const [totalCost, setTotalCost] = useState("₹2,75,000");
  const [timelineWeeks, setTimelineWeeks] = useState("6");
  const [scopeDetails, setScopeDetails] = useState(
    "1. Multi-Gateway Auto-Routing (Razorpay + Cashfree Failover)\n2. UPI Dynamic QR & Deep-Link Intent Flow\n3. Enterprise SaaS Web Application with Role Permissions\n4. PCI-DSS Level 1 Compliant Card Vaulting\n5. 60-Day Complimentary Post-Launch SLA Warranty"
  );
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const proposalText = `=======================================================
PROPOSAL & STATEMENT OF WORK (SOW)
${APP_CONFIG.brandName.toUpperCase()} | Enterprise Software & FinTech Engineering
Official Domain: ${APP_CONFIG.canonicalUrl} | Contact: ${APP_CONFIG.emails.sales}
=======================================================

CLIENT DETAILS:
Client / Organization: ${clientName}
Email: ${clientEmail}
Issue Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}

PROJECT OVERVIEW:
Engagement Title: ${projectTitle}
Delivery Velocity: ~${timelineWeeks} Weeks from Kickoff
Total Investment: ${totalCost} (+ applicable GST / VAT)

STATEMENT OF WORK & DELIVERABLES:
${scopeDetails}

MILESTONE PAYMENT BREAKDOWN:
• Phase 1 (30% - Architecture Blueprint, DB Schemas & Kickoff)
• Phase 2 (40% - Core Sprint Deliverables on Live Staging URL)
• Phase 3 (30% - Security Audit, QA Sign-off & Production Release)

ENTERPRISE GUARANTEES:
✓ 100% Client Source Code, IP & Git Repository Ownership
✓ Mutual Non-Disclosure Agreement (NDA) Protected
✓ 60 Days Complimentary Post-Launch SLA Support

Authorized Signature:
Principal Architect, ${APP_CONFIG.brandName}
${APP_CONFIG.domain}
=======================================================`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(proposalText);
    } catch {
      // Fallback if browser permission is blocked
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Proposal Copied!",
      description: "Quotation & SOW document copied to clipboard.",
    });
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<pre style="font-family: monospace; font-size: 13px; line-height: 1.6; padding: 24px;">${proposalText}</pre>`);
      w.document.close();
      w.print();
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Enterprise Proposal & SOW Generator
        </h1>
        <p className="text-xs text-muted-foreground">
          Draft official client agreements, milestone schedules, and scope of work documents
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Inputs */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-6 bg-card/60 border-border/70 space-y-4 shadow-lg">
            <h2 className="font-bold text-sm text-foreground">Project Parameters</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
                  Client / Organization Name
                </label>
                <Input 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-background/60 border-border/80 text-xs h-10"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
                  Client Email
                </label>
                <Input 
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="bg-background/60 border-border/80 text-xs h-10"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
                Project Title
              </label>
              <Input 
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="bg-background/60 border-border/80 text-xs h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
                  Total Project Investment
                </label>
                <Input 
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  className="bg-background/60 border-border/80 text-xs h-10 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
                  Timeline (Weeks)
                </label>
                <Input 
                  value={timelineWeeks}
                  onChange={(e) => setTimelineWeeks(e.target.value)}
                  className="bg-background/60 border-border/80 text-xs h-10 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
                Deliverables & SOW Scope
              </label>
              <Textarea 
                rows={5}
                value={scopeDetails}
                onChange={(e) => setScopeDetails(e.target.value)}
                className="bg-background/60 border-border/80 text-xs font-mono resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                variant="hero" 
                className="flex-grow text-xs h-10"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                Copy SOW Document
              </Button>
              <Button 
                variant="outline" 
                className="text-xs h-10"
                onClick={handlePrint}
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print
              </Button>
            </div>
          </Card>
        </div>

        {/* Live Output Preview */}
        <div className="lg:col-span-6">
          <Card className="p-6 bg-card/80 border-border/70 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <span className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Generated Agreement Text
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                Client Ready
              </Badge>
            </div>

            <pre className="p-4 rounded-xl bg-background/80 border border-border/80 text-[11px] font-mono whitespace-pre-wrap text-muted-foreground leading-relaxed max-h-[500px] overflow-y-auto">
              {proposalText}
            </pre>
          </Card>
        </div>

      </div>

    </div>
  );
};

export default ProposalsPage;
