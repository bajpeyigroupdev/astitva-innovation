import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  Server, 
  TrendingUp, 
  ArrowRight, 
  MessageSquare, 
  Mail, 
  Plus, 
  Zap,
  Layers
} from "lucide-react";
import { inquiryService } from "../services/inquiryService";
import { Inquiry } from "../types";
import { AddLeadModal } from "../components/AddLeadModal";
import { APP_CONFIG } from "../constants/config";

export const OverviewPage = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setInquiries(inquiryService.getInquiries());
    inquiryService.fetchInquiries().then((data) => {
      if (data && data.length > 0) setInquiries(data);
    });
  }, []);

  const handleAddLead = (leadData: Omit<Inquiry, "id" | "date" | "status">) => {
    const created = inquiryService.addManualLead(leadData);
    setInquiries([created, ...inquiries]);
  };

  const newCount = inquiries.filter((i) => i.status === "New").length;
  const fintechCount = inquiries.filter((i) => i.service.includes("FinTech")).length;

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-card/90 via-card/60 to-card/90 border border-border/80 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
              Live Operations Overview
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
            {APP_CONFIG.brandName} Dashboard
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Production Host: <span className="text-foreground font-mono font-medium">{APP_CONFIG.domain}</span> • Server: <span className="text-foreground font-mono font-medium">{APP_CONFIG.serverIp}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="text-xs h-10 border-border/80">
            <Link to="/proposals">
              <Zap className="w-3.5 h-3.5 mr-1.5 text-accent" />
              Create Proposal
            </Link>
          </Button>
          <Button 
            variant="hero" 
            size="sm" 
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs h-10 px-4"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Register Lead
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 bg-card/60 border-border/70 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Total Client Leads</span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground">{inquiries.length}</div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{newCount} Pending Review</span>
          </div>
        </Card>

        <Card className="p-5 bg-card/60 border-border/70 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Pipeline Value</span>
            <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground">₹28,50,000</div>
          <div className="text-xs text-muted-foreground mt-2">
            Estimated from client scopes
          </div>
        </Card>

        <Card className="p-5 bg-card/60 border-border/70 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Payment Gateway Deals</span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground">{fintechCount}</div>
          <div className="text-xs text-accent mt-2 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Highest demand (42%)</span>
          </div>
        </Card>

        <Card className="p-5 bg-card/60 border-border/70 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Nginx Server Health</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">99.99% Uptime</div>
          <div className="text-xs text-muted-foreground mt-2 font-mono">
            IP: {APP_CONFIG.serverIp}
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Recent Inquiries (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 bg-card/60 border-border/70 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-base text-foreground">Recent Inbound Client Inquiries</h2>
                <p className="text-xs text-muted-foreground">Direct submissions from public contact form and calculator</p>
              </div>
              <Button asChild variant="outline" size="sm" className="text-xs h-8">
                <Link to="/inquiries">
                  View All ({inquiries.length})
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>

            <div className="space-y-3">
              {inquiries.slice(0, 4).map((inq) => (
                <div 
                  key={inq.id}
                  className="p-4 rounded-xl bg-background/50 border border-border/60 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {inq.name}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${
                          inq.status === "New" 
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" 
                            : "border-primary/30 bg-primary/10 text-primary"
                        }`}
                      >
                        {inq.status}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <span className="text-accent font-medium">{inq.service}</span> • <span className="font-mono">{inq.budget}</span>
                    </div>

                    <p className="text-[11px] text-muted-foreground/80 line-clamp-1 max-w-lg">
                      {inq.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(inq.name)},%20I%20am%20reaching%20out%20from%20Astitva%20Innovation%20regarding%20your%20project%20inquiry.`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                      title="WhatsApp Client"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={`mailto:${inq.email}?subject=Astitva%20Innovation%20-%20Project%20Scope%20and%20Architecture`}
                      className="p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-colors"
                      title="Email Client"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Service Demand Breakdown (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 bg-card/60 border-border/70 space-y-4">
            <h2 className="font-bold text-sm text-foreground">Service Demand Distribution</h2>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">FinTech & Payment Gateways</span>
                  <span className="font-bold text-accent">45%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="bg-accent h-full rounded-full" style={{ width: "45%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Enterprise Web & SaaS</span>
                  <span className="font-bold text-primary">30%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: "30%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Mobile Apps (Flutter/React Native)</span>
                  <span className="font-bold text-emerald-400">15%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: "15%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Cloud DevOps & AI Agents</span>
                  <span className="font-bold text-foreground">10%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="bg-foreground h-full rounded-full" style={{ width: "10%" }} />
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>

      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddLead}
      />
    </div>
  );
};

export default OverviewPage;
