import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  CreditCard,
  TrendingUp,
  DollarSign,
  MessageSquare,
  ShieldCheck,
  Server,
  Globe,
  Lock,
  LogOut,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
  ArrowLeft,
  RefreshCw,
  Phone,
  Mail,
  Zap,
  Clock,
  Layers,
  FileText
} from "lucide-react";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  message: string;
  date: string;
  status: "New" | "Contacted" | "In Review" | "Closed";
}

interface PaymentLog {
  id: string;
  gateway: string;
  method: string;
  amount: string;
  status: "Captured" | "Pending";
  date: string;
  ref: string;
}

const DEFAULT_INQUIRIES: Inquiry[] = [
  {
    id: "INQ-101",
    name: "Vikram Malhotra",
    email: "vikram@malhotrafin.com",
    phone: "+91 98234 56789",
    service: "FinTech & Payment Gateway",
    budget: "₹5,00,000 - ₹15,00,000",
    message: "Need custom multi-gateway router (Razorpay + Cashfree fallback) with automated merchant split payout APIs.",
    date: "2026-09-18 19:45",
    status: "New"
  },
  {
    id: "INQ-102",
    name: "Aman Gupta",
    email: "aman@ecombrands.in",
    phone: "+91 99112 33445",
    service: "Mobile App (iOS & Android)",
    budget: "₹1,50,000 - ₹5,00,000",
    message: "Flutter mobile commerce application with UPI 1-click checkout and real-time tracking.",
    date: "2026-09-18 17:12",
    status: "Contacted"
  },
  {
    id: "INQ-103",
    name: "Elena Rostova",
    email: "elena@globaltech.co",
    phone: "+1 415 890 2314",
    service: "Custom Web & SaaS Platform",
    budget: "₹15,00,000+",
    message: "Enterprise multi-tenant subscription SaaS portal with international Stripe billing and AWS auto-scaling.",
    date: "2026-09-17 14:30",
    status: "In Review"
  }
];

const DEFAULT_TRANSACTIONS: PaymentLog[] = [
  { id: "TX-901", gateway: "Razorpay", method: "UPI 2.0 (GPay)", amount: "₹2,499", status: "Captured", date: "2026-09-18 20:30", ref: "TXN_78291038" },
  { id: "TX-902", gateway: "Stripe", method: "Visa Card •••• 4242", amount: "₹4,999", status: "Captured", date: "2026-09-18 18:15", ref: "TXN_45892110" },
  { id: "TX-903", gateway: "Cashfree", method: "Instant QR Intent", amount: "₹1,499", status: "Captured", date: "2026-09-18 16:40", ref: "TXN_99182341" },
  { id: "TX-904", gateway: "PhonePe PG", method: "UPI DeepLink", amount: "₹3,200", status: "Captured", date: "2026-09-17 21:05", ref: "TXN_33109482" },
];

export const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "inquiries" | "fintech" | "settings">("overview");
  
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [transactions, setTransactions] = useState<PaymentLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const authSession = sessionStorage.getItem("astitva_admin_session");
    if (authSession === "active") {
      setIsAuthenticated(true);
    }

    // Load inquiries from localStorage or defaults
    const savedInquiries = localStorage.getItem("astitva_inquiries");
    if (savedInquiries) {
      try {
        setInquiries(JSON.parse(savedInquiries));
      } catch (e) {
        setInquiries(DEFAULT_INQUIRIES);
      }
    } else {
      setInquiries(DEFAULT_INQUIRIES);
      localStorage.setItem("astitva_inquiries", JSON.stringify(DEFAULT_INQUIRIES));
    }

    setTransactions(DEFAULT_TRANSACTIONS);
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput === "admin123" || pinInput === "admin" || pinInput === "astitva" || pinInput === "") {
      setIsAuthenticated(true);
      sessionStorage.setItem("astitva_admin_session", "active");
      toast({
        title: "Welcome, Administrator",
        description: "Authenticated to Astitva Innovation Command Center.",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid credentials. Use 'admin123' or leave blank to continue.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("astitva_admin_session");
    toast({
      title: "Logged Out",
      description: "Admin session ended securely.",
    });
  };

  const updateInquiryStatus = (id: string, newStatus: Inquiry["status"]) => {
    const updated = inquiries.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    );
    setInquiries(updated);
    localStorage.setItem("astitva_inquiries", JSON.stringify(updated));
    toast({
      title: "Status Updated",
      description: `Inquiry ${id} marked as ${newStatus}.`,
    });
  };

  const deleteInquiry = (id: string) => {
    const updated = inquiries.filter(item => item.id !== id);
    setInquiries(updated);
    localStorage.setItem("astitva_inquiries", JSON.stringify(updated));
    if (selectedInquiry?.id === id) setSelectedInquiry(null);
    toast({
      title: "Inquiry Deleted",
      description: "Record removed from database.",
    });
  };

  const filteredInquiries = inquiries.filter(inq => 
    inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inq.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inq.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If not logged in, show Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

        <Card className="w-full max-w-md p-8 bg-card/90 backdrop-blur-xl border border-primary/30 shadow-2xl relative z-10">
          <div className="text-center mb-6">
            <Link to="/" className="inline-block mb-4">
              <img src="/astitva-logo.png" alt="Astitva Innovation" className="h-12 mx-auto object-contain" />
            </Link>
            <h1 className="text-xl font-bold text-foreground">Admin Command Center</h1>
            <p className="text-xs text-muted-foreground mt-1">Management Portal for astitvainnovation.in</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Admin Password / Passcode
              </label>
              <Input 
                type="password"
                placeholder="Enter password (default: admin123)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="bg-background/60 border-border/80 text-xs h-11"
              />
            </div>

            <Button type="submit" variant="hero" className="w-full py-5 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 mr-2" />
              Sign In to Dashboard
            </Button>

            <div className="pt-2 text-center">
              <Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Back to Main Website
              </Link>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      
      {/* Top Admin Navbar */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border/70 sticky top-0 z-40 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src="/astitva-logo.png" alt="Astitva Innovation" className="h-8 w-auto object-contain" />
              <Badge variant="outline" className="text-[10px] font-mono border-primary/40 bg-primary/10 text-primary">
                ADMIN PANEL
              </Badge>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1.5 ml-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "overview" 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("inquiries")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === "inquiries" 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                Inquiries & Leads
                <span className="w-4 h-4 rounded-full bg-accent/30 text-accent text-[10px] flex items-center justify-center font-bold">
                  {inquiries.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("fintech")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "fintech" 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                FinTech Logs
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "settings" 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                Server & Domain
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/" target="_blank" className="text-xs text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1">
              <span>View Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="text-xs border-border/80 hover:border-destructive/40 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card className="p-5 bg-card/60 border-border/70 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Total Inquiries</span>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold">{inquiries.length}</div>
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +4 new this week
                </div>
              </Card>

              <Card className="p-5 bg-card/60 border-border/70 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Pipeline Value</span>
                  <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold">₹24,50,000</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Estimated project budgets
                </div>
              </Card>

              <Card className="p-5 bg-card/60 border-border/70 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">FinTech PG Inquiries</span>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {inquiries.filter(i => i.service.includes("FinTech")).length}
                </div>
                <div className="text-[11px] text-accent mt-1">
                  Highest requested service
                </div>
              </Card>

              <Card className="p-5 bg-card/60 border-border/70 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Server Status</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Server className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl font-bold text-emerald-400">99.99% Uptime</div>
                <div className="text-[11px] text-muted-foreground mt-1 font-mono">
                  IP: 217.216.58.223
                </div>
              </Card>
            </div>

            {/* Recent Leads Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <Card className="p-6 bg-card/60 border-border/70">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base">Recent Incoming Leads</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab("inquiries")}
                      className="text-xs"
                    >
                      View All
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {inquiries.slice(0, 3).map((inq) => (
                      <div 
                        key={inq.id}
                        className="p-4 rounded-xl bg-background/50 border border-border/60 flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{inq.name}</span>
                            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                              {inq.service}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {inq.email} • {inq.budget}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(inq.name)},%20thank%20you%20for%20contacting%20Astitva%20Innovation.`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                            title="Open WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                          <a
                            href={`mailto:${inq.email}?subject=Astitva%20Innovation%20-%20Project%20Scope%20Discussion`}
                            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-colors"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Quick Actions Panel */}
              <div className="lg:col-span-4 space-y-4">
                <Card className="p-6 bg-card/60 border-border/70 space-y-4">
                  <h3 className="font-bold text-base">Quick Operations</h3>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-xs h-10"
                      onClick={() => setActiveTab("inquiries")}
                    >
                      <Users className="w-3.5 h-3.5 mr-2 text-primary" />
                      Manage All Inquiries ({inquiries.length})
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-xs h-10"
                      onClick={() => setActiveTab("fintech")}
                    >
                      <CreditCard className="w-3.5 h-3.5 mr-2 text-accent" />
                      View Payment Gateway Sandbox Logs
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-xs h-10"
                      onClick={() => setActiveTab("settings")}
                    >
                      <Server className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                      Server & DNS Verification Status
                    </Button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-[11px] text-muted-foreground">
                    <div className="font-semibold text-foreground mb-1">Production URL:</div>
                    <a href="https://astitvainnovation.in" target="_blank" rel="noreferrer" className="text-accent underline flex items-center gap-1">
                      https://astitvainnovation.in <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </Card>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: INQUIRIES & LEADS */}
        {activeTab === "inquiries" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Inquiries & Quote Requests</h2>
                <p className="text-xs text-muted-foreground">Prospective clients who submitted quotes or cost calculations</p>
              </div>

              {/* Search */}
              <div className="w-full sm:w-72 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-card/60 border-border/80 text-xs h-10"
                />
              </div>
            </div>

            {/* Inquiries Table */}
            <Card className="bg-card/60 border-border/70 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-background/80 border-b border-border/70 text-muted-foreground uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-4">Client</th>
                      <th className="p-4">Service Needed</th>
                      <th className="p-4">Budget Tier</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredInquiries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No inquiries found matching your query.
                        </td>
                      </tr>
                    ) : (
                      filteredInquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-background/40 transition-colors">
                          <td className="p-4">
                            <div className="font-semibold text-foreground">{inq.name}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">{inq.email}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">{inq.phone}</div>
                          </td>
                          <td className="p-4 font-medium text-foreground">
                            {inq.service}
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-accent">{inq.budget}</span>
                          </td>
                          <td className="p-4">
                            <select
                              value={inq.status}
                              onChange={(e) => updateInquiryStatus(inq.id, e.target.value as Inquiry["status"])}
                              className="text-[11px] font-semibold bg-background border border-border rounded px-2 py-1 focus:outline-none"
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="In Review">In Review</option>
                              <option value="Closed">Closed</option>
                            </select>
                          </td>
                          <td className="p-4 font-mono text-[11px] text-muted-foreground">
                            {inq.date}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedInquiry(inq)}
                                className="text-[11px] h-8 px-2.5"
                              >
                                View Scope
                              </Button>

                              <a
                                href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteInquiry(inq.id)}
                                className="text-destructive hover:bg-destructive/10 h-8 px-2"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Selected Inquiry Modal / Detail Box */}
            {selectedInquiry && (
              <Card className="p-6 bg-card/90 border-primary/40 shadow-xl rounded-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/70">
                  <div>
                    <h3 className="font-bold text-sm">Full Technical Scope: {selectedInquiry.name}</h3>
                    <div className="text-xs text-muted-foreground font-mono">{selectedInquiry.email} • {selectedInquiry.phone}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedInquiry(null)}>
                    Close
                  </Button>
                </div>

                <div className="p-4 rounded-lg bg-background/80 border border-border/80 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                  {selectedInquiry.message}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">Budget: <strong className="text-foreground">{selectedInquiry.budget}</strong></span>
                  <div className="flex gap-2">
                    <a
                      href={`mailto:${selectedInquiry.email}?subject=Astitva%20Innovation%20-%20Project%20Proposal`}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Reply via Email
                    </a>
                  </div>
                </div>
              </Card>
            )}

          </div>
        )}

        {/* TAB 3: FINTECH LOGS */}
        {activeTab === "fintech" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">Payment Gateway Logs & Webhook Sandbox</h2>
              <p className="text-xs text-muted-foreground">Simulated and real checkout events processed through Razorpay, Stripe, and Cashfree</p>
            </div>

            <Card className="bg-card/60 border-border/70 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-background/80 border-b border-border/70 text-muted-foreground uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-4">Txn ID</th>
                      <th className="p-4">Gateway</th>
                      <th className="p-4">Channel / Method</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Webhook Event</th>
                      <th className="p-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-background/40 transition-colors">
                        <td className="p-4 font-mono text-foreground font-semibold">{tx.ref}</td>
                        <td className="p-4">
                          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                            {tx.gateway}
                          </Badge>
                        </td>
                        <td className="p-4 text-foreground">{tx.method}</td>
                        <td className="p-4 font-bold text-foreground">{tx.amount}</td>
                        <td className="p-4">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-muted-foreground">
                          payment.captured
                        </td>
                        <td className="p-4 font-mono text-[11px] text-muted-foreground">
                          {tx.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: SETTINGS & DOMAIN */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-xl font-bold">Server & Infrastructure Configuration</h2>
              <p className="text-xs text-muted-foreground">Current deployment settings for astitvainnovation.in</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-card/60 border-border/70 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Primary Domain</h3>
                    <p className="text-xs text-accent font-mono">astitvainnovation.in</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-border/60 pt-3">
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Canonical Host:</span>
                    <span className="font-mono">https://astitvainnovation.in</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">WWW Alias:</span>
                    <span className="font-mono">www.astitvainnovation.in</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">DNS Status:</span>
                    <span className="text-emerald-400 font-semibold">Authoritative Synced</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/60 border-border/70 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Server Host</h3>
                    <p className="text-xs text-foreground font-mono">217.216.58.223 (Ubuntu Nginx)</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-border/60 pt-3">
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Web Root:</span>
                    <span className="font-mono">/www/wwwroot/astitvainnovation.in</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Nginx Proxy:</span>
                    <span className="font-mono">HTTP/2 + Gzip SSL</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">CI/CD Pipeline:</span>
                    <span className="text-emerald-400 font-semibold">GitHub Actions (main)</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Admin;
