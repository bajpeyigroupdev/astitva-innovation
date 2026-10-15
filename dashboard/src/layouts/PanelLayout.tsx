import { useState, useEffect, Suspense } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import RouteLoadingFallback from "../components/RouteLoadingFallback";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Zap, 
  Layers, 
  Server, 
  Settings, 
  LogOut, 
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Package,
  UserCheck,
  Briefcase,
  MessageSquare
} from "lucide-react";
import { authService } from "../auth/authService";
import { APP_CONFIG } from "../constants/config";
import { useToast } from "@/hooks/use-toast";
import { notificationService } from "../services/notificationService";
import { normalizeWhatsAppTab } from "../constants/whatsappTabs";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export const PanelLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const currentAdmin = authService.getCurrentAdmin() || "AST-ADMIN-01";

  useEffect(() => {
    notificationService.startInquiryMonitor((newLead) => {
      toast({
        title: `🔔 New Client Lead: ${newLead.name}`,
        description: `${newLead.service} • ${newLead.phone || newLead.email}`,
      });
    });

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall as EventListener);

    return () => {
      notificationService.stopInquiryMonitor();
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall as EventListener);
    };
  }, [toast]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    authService.logout();
    toast({
      title: "Session Terminated",
      description: "You have been logged out securely.",
    });
    navigate("/login");
  };

  const navItems = [
    { to: "/", label: "Overview", icon: LayoutDashboard },
    { to: "/inquiries", label: "Inquiries & Leads", icon: Users },
    { to: "/whatsapp", label: "WhatsApp Platform", icon: MessageSquare },
    { to: "/careers", label: "Careers & Hiring", icon: Briefcase },
    { to: "/products", label: "Products & Apps", icon: Package },
    { to: "/founders", label: "Founders & Team", icon: UserCheck },
    { to: "/fintech", label: "FinTech Operations", icon: CreditCard },
    { to: "/proposals", label: "Proposal Generator", icon: Zap },
    { to: "/services", label: "Services & Pricing", icon: Layers },
    { to: "/server", label: "Server & DNS", icon: Server },
    { to: "/settings", label: "System Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row overflow-x-hidden">
      
      {/* Desktop Sidebar (lg:flex) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border/70 bg-card/60 backdrop-blur-xl shrink-0 p-5 sticky top-0 h-screen justify-between">
        
        {/* Brand & Admin ID */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src="/astitva-logo.png" alt="Astitva Innovation" className="h-9 w-auto object-contain" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-mono border-primary/40 bg-primary/10 text-primary">
                {currentAdmin}
              </Badge>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isWhatsApp = item.to === "/whatsapp";
              const isWhatsAppActive = location.pathname.startsWith("/whatsapp");
              const currentTab = normalizeWhatsAppTab(new URLSearchParams(location.search).get("tab")) || "overview";

              return (
                <div key={item.to} className="space-y-1">
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-card/80"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5">
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                      </>
                    )}
                  </NavLink>

                  {/* WhatsApp Platform 11-Module Sub-Navigation */}
                  {isWhatsApp && isWhatsAppActive && (
                    <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-primary/30 ml-4 my-1">
                      {[
                        { tab: "overview", label: "1. Overview" },
                        { tab: "connection", label: "2. Connection & Config" },
                        { tab: "chats", label: "3. Chats & Messages" },
                        { tab: "templates", label: "4. Message Templates" },
                        { tab: "contacts", label: "5. Contacts & Opt-in" },
                        { tab: "webhooks", label: "6. Webhooks & Events" },
                        { tab: "delivery-logs", label: "7. Delivery Logs" },
                        { tab: "evidence", label: "8. Evidence & Screencast" },
                        { tab: "checklist", label: "9. App Review Checklist" },
                        { tab: "diagnostics", label: "10. Diagnostics & Logs" },
                        { tab: "security", label: "11. Security & RBAC" },
                      ].map((sub) => {
                        const isSubActive = currentTab === sub.tab;
                        const subnavParams = new URLSearchParams(location.search);
                        subnavParams.set("tab", sub.tab);
                        return (
                          <Link
                            key={sub.tab}
                            to={`/whatsapp?${subnavParams.toString()}`}
                            className={`block px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                              isSubActive
                                ? "bg-primary/20 text-primary font-semibold"
                                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                            }`}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Info */}
        <div className="pt-4 border-t border-border/60 space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-background/50 border border-border/60 text-[11px] space-y-1">
            <div className="text-muted-foreground">Server Host:</div>
            <div className="font-mono text-foreground font-semibold">{APP_CONFIG.serverIp}</div>
            <div className="text-[10px] text-emerald-400">DNS Authoritative Active</div>
          </div>

          {deferredPrompt && (
            <Button
              variant="hero"
              size="sm"
              onClick={() => {
                deferredPrompt.prompt();
                setDeferredPrompt(null);
              }}
              className="w-full text-xs h-9 font-semibold"
            >
              📱 Install App on Phone
            </Button>
          )}

          <a
            href={APP_CONFIG.canonicalUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card text-xs transition-colors"
          >
            <span>Visit Main Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full text-xs h-9 border-border/80 hover:border-destructive/40 hover:text-destructive"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Area & Mobile Header */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Mobile Header (lg:hidden) */}
        <header className="lg:hidden bg-card/80 backdrop-blur-md border-b border-border/70 sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/astitva-logo.png" alt="Astitva Innovation" className="h-7 w-auto object-contain" />
            <Badge variant="outline" className="text-[10px] font-mono border-primary/40 bg-primary/10 text-primary">
              PANEL
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground hover:text-primary"
              aria-label="Toggle navigation"
              aria-expanded={isMobileMenuOpen}
              aria-controls="dashboard-mobile-navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <nav id="dashboard-mobile-navigation" aria-label="Mobile navigation" className="lg:hidden bg-card border-b border-border p-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                    isActive ? "bg-primary text-white" : "text-muted-foreground hover:bg-background"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full text-xs mt-2"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </Button>
          </nav>
        )}

        {/* Main Content Workspace */}
        <main className="p-4 sm:p-6 lg:p-8 flex-grow">
          <Suspense fallback={<RouteLoadingFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

    </div>
  );
};

export default PanelLayout;
