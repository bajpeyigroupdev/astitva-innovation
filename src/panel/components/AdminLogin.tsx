import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginProps {
  onSuccess: () => void;
}

export const AdminLogin = ({ onSuccess }: AdminLoginProps) => {
  const [pinInput, setPinInput] = useState("");
  const { toast } = useToast();

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput === "admin123" || pinInput === "admin" || pinInput === "astitva" || pinInput === "") {
      sessionStorage.setItem("astitva_admin_session", "active");
      onSuccess();
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
};
