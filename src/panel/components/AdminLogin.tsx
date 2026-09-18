import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "../auth/authService";

interface AdminLoginProps {
  onSuccess: () => void;
}

export const AdminLogin = ({ onSuccess }: AdminLoginProps) => {
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { toast } = useToast();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const result = await authService.login(usernameInput, passwordInput);
    setIsLoading(false);

    if (result.success) {
      onSuccess();
      toast({
        title: "Welcome, Administrator",
        description: "Authenticated to Astitva Innovation Command Center.",
      });
    } else {
      setErrorMsg(result.error || "Authentication failed. Invalid Admin ID or password.");
      toast({
        title: "Access Denied",
        description: result.error || "Invalid Admin ID or password.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md p-8 bg-card/90 backdrop-blur-xl border border-primary/30 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block mb-3">
            <img src="/astitva-logo.png" alt="Astitva Innovation" className="h-12 mx-auto object-contain" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Admin Command Center</h1>
          <p className="text-xs text-muted-foreground">Management Portal for astitvainnovation.in</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Admin Identity ID
            </label>
            <Input 
              type="text"
              required
              placeholder="e.g. AST-ADMIN-01"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="bg-background/60 border-border/80 text-xs h-11"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter security password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
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

          <Button type="submit" variant="hero" disabled={isLoading} className="w-full py-5 text-xs font-semibold">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Credentials...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In to Dashboard</span>
              </div>
            )}
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
};
