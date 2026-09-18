import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, FileText, Send, Sparkles, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ProposalGenerator = () => {
  const [clientName, setClientName] = useState("Acme Corporation");
  const [clientEmail, setClientEmail] = useState("client@acme.com");
  const [projectTitle, setProjectTitle] = useState("FinTech Payment Gateway & Mobile App");
  const [totalCost, setTotalCost] = useState("₹2,50,000");
  const [timelineWeeks, setTimelineWeeks] = useState("6");
  const [scopeDetails, setScopeDetails] = useState(
    "1. Multi-Gateway Payment Router (Razorpay + Cashfree Failover)\n2. UPI Dynamic QR & Intent Flow for Android & iOS\n3. Full-Stack Next.js Merchant Dashboard\n4. PCI-DSS Compliant Tokenization\n5. 60-Day Post-Launch SLA Warranty"
  );
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generatedProposal = `=======================================================
PROPOSAL & STATEMENT OF WORK (SOW)
ASTITVA INNOVATION | Enterprise Software & FinTech Engineering
Website: https://astitvainnovation.in | Email: sales@astitvainnovation.in
=======================================================

CLIENT DETAILS:
Name: ${clientName}
Email: ${clientEmail}
Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}

PROJECT OVERVIEW:
Title: ${projectTitle}
Estimated Delivery Timeline: ~${timelineWeeks} Weeks
Total Project Investment: ${totalCost} (+ applicable taxes)

SCOPE OF WORK & DELIVERABLES:
${scopeDetails}

MILESTONE PAYMENT SCHEDULE:
• Phase 1 (30% - Kickoff & System Architecture Blueprint)
• Phase 2 (40% - Core Sprint Delivery on Live Staging URL)
• Phase 3 (30% - QA Security Audit, Final Sign-off & Production Deployment)

KEY GUARANTEES & OWNERSHIP:
✓ 100% Client Source Code & Intellectual Property Ownership
✓ Mutual Non-Disclosure Agreement (NDA) Protected
✓ 60 Days Complimentary Post-Launch Technical Support

Prepared By:
Solutions Architecture Team, Astitva Innovation
Official Domain: https://astitvainnovation.in
=======================================================`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedProposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Proposal Copied!",
      description: "Official quotation text copied to clipboard. Ready to paste in email or WhatsApp.",
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<pre style="font-family: monospace; font-size: 13px; line-height: 1.6; padding: 20px;">${generatedProposal}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          Client Proposal & SOW Generator
        </h2>
        <p className="text-xs text-muted-foreground">
          Generate formal enterprise software proposals and milestone agreements in seconds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-6 bg-card/60 border-border/70 space-y-4">
            <h3 className="font-bold text-sm text-foreground">Proposal Parameters</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
                  Client / Company Name
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
                  Agreed Total Budget
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
                Deliverables & Scope Breakdown
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
                onClick={copyToClipboard}
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                Copy SOW Proposal
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

        {/* Live Preview Column */}
        <div className="lg:col-span-6">
          <Card className="p-6 bg-card/80 border-border/70 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <span className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Live Generated Document
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                Ready to Send
              </Badge>
            </div>

            <pre className="p-4 rounded-xl bg-background/80 border border-border/80 text-[11px] font-mono whitespace-pre-wrap text-muted-foreground leading-relaxed max-h-[500px] overflow-y-auto">
              {generatedProposal}
            </pre>
          </Card>
        </div>

      </div>

    </div>
  );
};

export default ProposalGenerator;
