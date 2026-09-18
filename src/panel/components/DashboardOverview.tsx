import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  Server, 
  TrendingUp, 
  ArrowUpRight, 
  MessageSquare, 
  Mail, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Zap,
  Layers,
  ArrowRight
} from "lucide-react";
import { Inquiry, PaymentLog } from "../types";

interface DashboardOverviewProps {
  inquiries: Inquiry[];
  transactions: PaymentLog[];
  onNavigate: (tab: "inquiries" | "fintech" | "proposals" | "services" | "settings") => void;
  onOpenAddLead: () => void;
}

export const DashboardOverview = ({
  inquiries,
  transactions,
  onNavigate,
  onOpenAddLead,
}: DashboardOverviewProps) => {
  const newLeadsCount = inquiries.filter((i) => i.status === "New").length;
  const fintechLeadsCount = inquiries.filter((i) => i.service.includes("FinTech")).length;

  return (
    <div className="space-y-8">
      
      {/* Top Banner / Welcome Bar */}
      <div className="bg-gradient-to-r from-card/90 via-card/60 to-card/90 border border-border/80 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
              Live Operations Dashboard
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Astitva Innovation Command Center
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Production Host: <span className="text-foreground font-mono font-medium">astitvainnovation.in</span> • Server: <span className="text-foreground font-mono font-medium">217.216.58.223</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onNavigate("proposals")}
            className="text-xs h-10 border-border/80 hover:border-primary/40"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5 text-accent" />
            Create Proposal
          </Button>
          <Button 
            variant="hero" 
            size="sm" 
            onClick={onOpenAddLead}
            className="text-xs h-10 px-4"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Manual Lead
          </Button>
        </div>
      </div>

      {/* Top Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Inquiries */}
        <Card className="p-5 bg-card/60 border-border/70 backdrop-blur-sm hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Total Client Leads</span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground">{inquiries.length}</div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{newLeadsCount} Pending Review</span>
          </div>
        </Card>

        {/* Pipeline Value */}
        <Card className="p-5 bg-card/60 border-border/70 backdrop-blur-sm hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Estimated Pipeline</span>
            <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground">₹28,50,000</div>
          <div className="text-xs text-muted-foreground mt-2">
            Based on submitted budget tiers
          </div>
        </Card>

        {/* FinTech & Payment Gateways */}
        <Card className="p-5 bg-card/60 border-border/70 backdrop-blur-sm hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Payment Gateway Deals</span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground">{fintechLeadsCount}</div>
          <div className="text-xs text-accent mt-2 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Highest conversion rate (42%)</span>
          </div>
        </Card>

        {/* Server & Uptime */}
        <Card className="p-5 bg-card/60 border-border/70 backdrop-blur-sm hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Nginx Server Health</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">99.99% Uptime</div>
          <div className="text-xs text-muted-foreground mt-2 font-mono">
            SSL: Let's Encrypt (Active)
          </div>
        </Card>

      </div>

      {/* Main Grid: Recent Inquiries + Quick Actions + Service Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Recent Leads (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 bg-card/60 border-border/70 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-base text-foreground">Recent Inbound Project Inquiries</h3>
                <p className="text-xs text-muted-foreground">Prospective clients awaiting technical proposal</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onNavigate("inquiries")}
                className="text-xs h-8"
              >
                View All Leads ({inquiries.length})
                <ArrowRight className="w-3 h-3 ml-1" />
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
                      title="Open WhatsApp Chat"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={`mailto:${inq.email}?subject=Astitva%20Innovation%20-%20Project%20Scope%20and%20Architecture`}
                      className="p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-colors"
                      title="Send Official Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* FinTech Live Stream Card */}
          <Card className="p-6 bg-card/60 border-border/70 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-foreground">Latest Payment Gateway Sandbox Events</h3>
                <p className="text-xs text-muted-foreground">Webhook dispatches and authorization logs</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onNavigate("fintech")}
                className="text-xs h-8"
              >
                All FinTech Logs
              </Button>
            </div>

            <div className="space-y-2">
              {transactions.slice(0, 3).map((tx) => (
                <div key={tx.id} className="p-3 rounded-lg bg-background/50 border border-border/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-accent font-semibold">{tx.ref}</span>
                    <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                      {tx.gateway}
                    </Badge>
                    <span className="text-muted-foreground">{tx.method}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-foreground">{tx.amount}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Controls & Pipeline Breakdown (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Nav Card */}
          <Card className="p-6 bg-card/60 border-border/70 space-y-4">
            <h3 className="font-bold text-base text-foreground">Management Modules</h3>

            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-between text-xs h-11"
                onClick={() => onNavigate("inquiries")}
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  All Inquiries & Leads
                </span>
                <Badge variant="outline" className="text-[10px]">{inquiries.length}</Badge>
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-between text-xs h-11"
                onClick={() => onNavigate("fintech")}
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-accent" />
                  Payment Gateway Logs
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Live</span>
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-between text-xs h-11"
                onClick={() => onNavigate("proposals")}
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Proposal Generator
                </span>
                <span className="text-[10px] text-muted-foreground">Fast SOW</span>
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-between text-xs h-11"
                onClick={() => onNavigate("services")}
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-accent" />
                  Services & Pricing Tiers
                </span>
                <span className="text-[10px] text-muted-foreground">8 Active</span>
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-between text-xs h-11"
                onClick={() => onNavigate("settings")}
              >
                <span className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  Server & DNS Health
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">217.216.58.223</span>
              </Button>
            </div>
          </Card>

          {/* Service Demand Progress Bars */}
          <Card className="p-6 bg-card/60 border-border/70 space-y-4">
            <h3 className="font-bold text-sm text-foreground">Service Demand Distribution</h3>

            <div className="space-y-3 text-xs">
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

    </div>
  );
};

export default DashboardOverview;
