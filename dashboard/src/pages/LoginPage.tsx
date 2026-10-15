import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";
import { authService } from "../auth/authService";
import { APP_CONFIG } from "../constants/config";
import { useToast } from "@/hooks/use-toast";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await authService.login(username, password);
      if (result.success) {
        toast({
          title: "Authentication Successful",
          description: `Welcome to ${APP_CONFIG.brandName} Command Center.`,
        });

        const from = (location.state as { from?: { pathname?: unknown; search?: unknown; hash?: unknown } } | null)?.from;
        const pathname = typeof from?.pathname === "string" ? from.pathname : "/";
        const isSafeReturnPath = pathname.startsWith("/") && !pathname.startsWith("//") && pathname !== "/login" && pathname !== "/admin/login";
        navigate(
          isSafeReturnPath
            ? {
                pathname,
                search: typeof from?.search === "string" ? from.search : "",
                hash: typeof from?.hash === "string" ? from.hash : "",
              }
            : "/",
          { replace: true },
        );
      } else {
        setErrorMessage(result.error || "Authentication failed. Please check credentials.");
      }
    } catch (error) {
      console.error("Administrator login could not complete:", error);
      setErrorMessage("Login could not complete. Please retry in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[140px] pointer-events-none" />

      <Card className="w-full max-w-md p-8 bg-card/90 backdrop-blur-xl border border-primary/30 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <img src="/astitva-logo.png" alt={APP_CONFIG.brandName} className="h-12 mx-auto object-contain mb-3" />
          <h1 className="text-xl font-bold text-foreground">
            {APP_CONFIG.panelTitle}
          </h1>
          <p className="text-xs text-muted-foreground">
            Authoritative Management Gateway • {APP_CONFIG.domain}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs leading-relaxed">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Administrator ID
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. AST-ADMIN-01"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-background/60 border-border/80 text-xs h-11"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Secret Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your security password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/60 border-border/80 text-xs h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            variant="hero" 
            disabled={isLoading}
            className="w-full py-5 text-xs font-semibold"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Security Token...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Authenticate to Command Center</span>
              </div>
            )}
          </Button>
        </form>

        <div className="pt-2 border-t border-border/60 text-center">
          <a
            href={APP_CONFIG.canonicalUrl}
            className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Return to Public Portal ({APP_CONFIG.domain})
          </a>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
