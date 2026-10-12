import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
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
  UserCheck
} from "lucide-react";
import { authService } from "../auth/authService";
import { APP_CONFIG } from "../constants/config";
import { useToast } from "@/hooks/use-toast";
import { notificationService } from "../services/notificationService";

export const PanelLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentAdmin = authService.getCurrentAdmin() || "AST-ADMIN-01";

  useEffect(() => {
    notificationService.startInquiryMonitor((newLead) => {
      toast({
        title: `🔔 New Client Lead: ${newLead.name}`,
        description: `${newLead.service} • ${newLead.phone || newLead.email}`,
      });
    });

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      notificationService.stopInquiryMonitor();
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

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
            {navItems.map((item) => (
              <NavLink
                key={item.to}
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
            ))}
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
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground hover:text-primary"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-card border-b border-border p-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
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
          </div>
        )}

        {/* Main Content Workspace */}
        <main className="p-4 sm:p-6 lg:p-8 flex-grow">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default PanelLayout;
