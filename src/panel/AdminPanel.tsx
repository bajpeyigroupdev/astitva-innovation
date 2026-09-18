import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  CreditCard, 
  Server, 
  Zap, 
  Layers, 
  FileText, 
  LogOut, 
  ExternalLink,
  Plus,
  LayoutDashboard
} from "lucide-react";

import { Inquiry, PaymentLog } from "./types";
import { DEFAULT_INQUIRIES, DEFAULT_TRANSACTIONS } from "./mockData";
import { AdminLogin } from "./components/AdminLogin";
import { DashboardOverview } from "./components/DashboardOverview";
import { InquiriesManager } from "./components/InquiriesManager";
import { FinTechLogs } from "./components/FinTechLogs";
import { ProposalGenerator } from "./components/ProposalGenerator";
import { ServicesManager } from "./components/ServicesManager";
import { ServerSettings } from "./components/ServerSettings";

export const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "inquiries" | "fintech" | "proposals" | "services" | "settings">("overview");
  
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [transactions, setTransactions] = useState<PaymentLog[]>(DEFAULT_TRANSACTIONS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    service: "FinTech & Payment Gateway",
    budget: "₹1,50,000 - ₹5,00,000",
    message: ""
  });

  const { toast } = useToast();

  useEffect(() => {
    const session = sessionStorage.getItem("astitva_admin_session");
    if (session === "active") {
      setIsAuthenticated(true);
    }

    const saved = localStorage.getItem("astitva_inquiries");
    if (saved) {
      try {
        setInquiries(JSON.parse(saved));
      } catch (e) {
        setInquiries(DEFAULT_INQUIRIES);
      }
    } else {
      setInquiries(DEFAULT_INQUIRIES);
      localStorage.setItem("astitva_inquiries", JSON.stringify(DEFAULT_INQUIRIES));
    }
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("astitva_admin_session");
    toast({
      title: "Logged Out",
      description: "Admin session ended securely.",
    });
  };

  const handleUpdateStatus = (id: string, status: Inquiry["status"]) => {
    const updated = inquiries.map((inq) =>
      inq.id === id ? { ...inq, status } : inq
    );
    setInquiries(updated);
    localStorage.setItem("astitva_inquiries", JSON.stringify(updated));
    toast({
      title: "Status Updated",
      description: `Inquiry ${id} set to ${status}.`,
    });
  };

  const handleDeleteInquiry = (id: string) => {
    const updated = inquiries.filter((inq) => inq.id !== id);
    setInquiries(updated);
    localStorage.setItem("astitva_inquiries", JSON.stringify(updated));
    toast({
      title: "Lead Removed",
      description: "Inquiry deleted from database.",
    });
  };

  const handleAddManualLead = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Inquiry = {
      id: "INQ-" + Math.floor(1000 + Math.random() * 9000),
      name: newLead.name,
      email: newLead.email,
      phone: newLead.phone || "Not provided",
      service: newLead.service,
      budget: newLead.budget,
      message: newLead.message,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      status: "New"
    };

    const updated = [created, ...inquiries];
    setInquiries(updated);
    localStorage.setItem("astitva_inquiries", JSON.stringify(updated));
    setIsAddModalOpen(false);
    setNewLead({
      name: "",
      email: "",
      phone: "",
      service: "FinTech & Payment Gateway",
      budget: "₹1,50,000 - ₹5,00,000",
      message: ""
    });

    toast({
      title: "Manual Lead Created",
      description: `Inquiry registered for ${created.name}.`,
    });
  };

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  const navItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "inquiries", label: "Client Inquiries", icon: Users, count: inquiries.length },
    { id: "fintech", label: "FinTech Operations", icon: CreditCard },
    { id: "proposals", label: "Proposal Generator", icon: Zap },
    { id: "services", label: "Services & Pricing", icon: Layers },
    { id: "settings", label: "Server & DNS", icon: Server },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      
      {/* Top Navigation Header */}
      <header className="bg-card/85 backdrop-blur-xl border-b border-border/70 sticky top-0 z-40 px-4 py-3 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/astitva-logo.png" alt="Astitva Innovation" className="h-8 w-auto object-contain transition-transform group-hover:scale-105" />
              <Badge variant="outline" className="text-[10px] font-mono border-primary/40 bg-primary/10 text-primary">
                DASHBOARD PANEL
              </Badge>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === item.id
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-card"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.count !== undefined && (
                    <span className="w-4 h-4 rounded-full bg-accent/20 text-accent text-[10px] flex items-center justify-center font-bold">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              target="_blank" 
              className="text-xs text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1 py-1.5 px-3 rounded-lg border border-border/60 hover:bg-card"
            >
              <span>Main Website</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="text-xs h-9 border-border/80 hover:border-destructive/40 hover:text-destructive"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </Button>
          </div>

        </div>

        {/* Mobile Navigation Scrollbar */}
        <div className="lg:hidden flex items-center gap-1 mt-2.5 pt-2 border-t border-border/60 overflow-x-auto pb-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 flex items-center gap-1 ${
                activeTab === item.id
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-card"
              }`}
            >
              <item.icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {activeTab === "overview" && (
          <DashboardOverview
            inquiries={inquiries}
            transactions={transactions}
            onNavigate={(t) => setActiveTab(t)}
            onOpenAddLead={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === "inquiries" && (
          <InquiriesManager
            inquiries={inquiries}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteInquiry}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === "fintech" && (
          <FinTechLogs transactions={transactions} />
        )}

        {activeTab === "proposals" && (
          <ProposalGenerator />
        )}

        {activeTab === "services" && (
          <ServicesManager />
        )}

        {activeTab === "settings" && (
          <ServerSettings />
        )}
      </main>

      {/* Add Manual Lead Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md bg-card border-border/80 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Register Client Lead</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddManualLead} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Client Name *</label>
              <Input
                required
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                placeholder="e.g. Ramesh Verma"
                className="bg-background/60 text-xs h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Email *</label>
                <Input
                  required
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  placeholder="ramesh@company.com"
                  className="bg-background/60 text-xs h-10"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Phone</label>
                <Input
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="bg-background/60 text-xs h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Service</label>
                <select
                  value={newLead.service}
                  onChange={(e) => setNewLead({ ...newLead, service: e.target.value })}
                  className="w-full h-10 px-2 rounded-md bg-background/60 border border-border text-xs text-foreground"
                >
                  <option value="FinTech & Payment Gateway">FinTech & Payment Gateway</option>
                  <option value="Enterprise Web & SaaS">Enterprise Web & SaaS</option>
                  <option value="Mobile App (iOS & Android)">Mobile App (iOS & Android)</option>
                  <option value="Cloud Infrastructure & DevOps">Cloud Infrastructure & DevOps</option>
                  <option value="AI Agents & Automation">AI Agents & Automation</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Budget</label>
                <select
                  value={newLead.budget}
                  onChange={(e) => setNewLead({ ...newLead, budget: e.target.value })}
                  className="w-full h-10 px-2 rounded-md bg-background/60 border border-border text-xs text-foreground"
                >
                  <option value="₹50,000 - ₹1,50,000">₹50,000 - ₹1,50,000</option>
                  <option value="₹1,50,000 - ₹5,00,000">₹1,50,000 - ₹5,00,000</option>
                  <option value="₹5,00,000 - ₹15,00,000">₹5,00,000 - ₹15,00,000</option>
                  <option value="₹15,00,000+">₹15,00,000+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Project Scope / Notes *</label>
              <Textarea
                required
                rows={3}
                value={newLead.message}
                onChange={(e) => setNewLead({ ...newLead, message: e.target.value })}
                placeholder="Details discussed with client..."
                className="bg-background/60 text-xs resize-none"
              />
            </div>

            <Button type="submit" variant="hero" className="w-full text-xs h-10">
              Save Lead to Database
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminPanel;
