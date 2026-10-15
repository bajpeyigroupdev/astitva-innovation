import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ShieldCheck, 
  User, 
  Bell, 
  CheckCircle2, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Smartphone, 
  Volume2, 
  Send,
  Save,
  Download,
  Sparkles
} from "lucide-react";
import { authService } from "../auth/authService";
import { APP_CONFIG } from "../constants/config";
import { settingsService, SystemSettings } from "../services/settingsService";
import { notificationService } from "../services/notificationService";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export const SettingsPage = () => {
  const currentAdmin = authService.getCurrentAdmin() || "AST-ADMIN-01";
  const { toast } = useToast();

  const [settings, setSettings] = useState<SystemSettings>({
    brandName: "Astitva Innovation",
    phone: "+91 7233882089",
    whatsappNumber: "917233882089",
    contactEmail: "contact@astitvainnovation.in",
    supportEmail: "support@astitvainnovation.in",
    salesEmail: "support@astitvainnovation.in",
    address: "Global Software Engineering Hub • India & Remote",
    workingHours: "Mon - Sat: 9:30 AM - 7:30 PM IST",
    telegramBotToken: "",
    hasTelegramBotToken: false,
    telegramChatId: "",
    notificationsEnabled: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(notificationService.hasPermission());
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    settingsService.getSettings().then((data) => {
      if (data) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    });

    // PWA install prompt handler
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      if ("prompt" in e && "userChoice" in e) {
        setDeferredPrompt(e as InstallPromptEvent);
      }
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await settingsService.updateSettings(settings);
    setIsSaving(false);

    if (res.success) {
      if (res.data) {
        setSettings((prev) => ({ ...prev, ...res.data, telegramBotToken: "" }));
      }
      toast({
        title: "Settings Saved Successfully",
        description: "Company contact details & phone number (+91 7233882089) updated live.",
      });
    } else {
      toast({
        title: "Save Failed",
        description: res.error || "Could not update settings on the server.",
        variant: "destructive"
      });
    }
  };

  const handleEnablePush = async () => {
    const perm = await notificationService.requestPermission();
    setHasNotificationPermission(perm === "granted");
    if (perm === "granted") {
      toast({
        title: "Notifications Enabled",
        description: "Your browser and mobile device will now receive instant inquiry alerts.",
      });
      notificationService.sendTestNotification();
    } else {
      toast({
        title: "Permission Not Granted",
        description: "Please allow notifications in your browser or device settings.",
        variant: "destructive"
      });
    }
  };

  const handleTestAudio = () => {
    notificationService.playChime();
    toast({
      title: "Melodic Audio Chime Tested",
      description: "This sound chimes whenever a new inquiry or AI chat lead arrives.",
    });
  };

  const handleTestTelegram = async () => {
    if ((!settings.telegramBotToken && !settings.hasTelegramBotToken) || !settings.telegramChatId) {
      toast({
        title: "Telegram Credentials Missing",
        description: "Please enter both your Telegram Bot Token and Chat ID first.",
        variant: "destructive"
      });
      return;
    }

    setIsTestingTelegram(true);
    const saveResult = await settingsService.updateSettings(settings);
    if (!saveResult.success) {
      setIsTestingTelegram(false);
      toast({
        title: "Telegram Settings Could Not Be Saved",
        description: saveResult.error || "Check the settings and try again.",
        variant: "destructive",
      });
      return;
    }
    if (saveResult.data) {
      setSettings((prev) => ({ ...prev, ...saveResult.data, telegramBotToken: "" }));
    }
    const res = await settingsService.testTelegram();
    setIsTestingTelegram(false);

    if (res.success) {
      toast({
        title: "Telegram Alert Sent!",
        description: "Check your Telegram phone app now — message delivered successfully!",
      });
    } else {
      toast({
        title: "Telegram Dispatch Failed",
        description: res.error || "Please verify your Telegram Bot Token and Chat ID.",
        variant: "destructive"
      });
    }
  };

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast({ title: "App Installed", description: "Astitva Admin is now installed on your home screen!" });
      }
      setDeferredPrompt(null);
    } else {
      toast({
        title: "Install as PWA App",
        description: "On mobile (Chrome/Safari), tap the browser menu (⋮ or Share) and select 'Add to Home screen' or 'Install App'.",
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Command Center Settings &amp; Mobile Alerts
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage company contact details, instant phone push notifications, Telegram mobile alerts, and PWA installation
        </p>
      </div>

      {/* 1. Company Profile & Contact Information Card */}
      <Card className="p-6 bg-card/60 border-border/70 backdrop-blur-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-foreground">
                Company Contact &amp; Public Numbers
              </h2>
              <p className="text-xs text-muted-foreground">
                Phone numbers and emails displayed across the website and contact forms
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-mono border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
            Live Synchronized
          </Badge>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                Primary Phone Number (+91 format) *
              </label>
              <Input
                required
                value={settings.phone || ""}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+91 7233882089"
                className="bg-background/60 font-mono text-xs h-10"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Displayed in Header, Footer, and Direct Call Desks
              </span>
            </div>

            <div>
              <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                WhatsApp Number (without + or spaces) *
              </label>
              <Input
                required
                value={settings.whatsappNumber || ""}
                onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="917233882089"
                className="bg-background/60 font-mono text-xs h-10"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Target for 1-click WhatsApp chat buttons
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                General Inquiries Email
              </label>
              <Input
                type="email"
                value={settings.contactEmail || ""}
                onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                placeholder="contact@astitvainnovation.in"
                className="bg-background/60 text-xs h-10"
              />
            </div>

            <div>
              <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                Sales &amp; Support Email
              </label>
              <Input
                type="email"
                value={settings.supportEmail || ""}
                onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                placeholder="support@astitvainnovation.in"
                className="bg-background/60 text-xs h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                Engineering Desk Address / Location
              </label>
              <Input
                value={settings.address || ""}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
                placeholder="Global Software Engineering Hub • India & Remote"
                className="bg-background/60 text-xs h-10"
              />
            </div>

            <div>
              <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                Operational Working Hours
              </label>
              <Input
                value={settings.workingHours || ""}
                onChange={e => setSettings({ ...settings, workingHours: e.target.value })}
                placeholder="Mon - Sat: 9:30 AM - 7:30 PM IST"
                className="bg-background/60 text-xs h-10"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="hero"
              size="sm"
              disabled={isSaving}
              className="text-xs h-10 px-5 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving Live Changes..." : "Save Company Profile"}
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Mobile Phone Notifications & PWA Card */}
      <Card className="p-6 bg-card/60 border-border/70 backdrop-blur-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent border border-accent/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-foreground">
                Mobile App &amp; Real-Time Phone Notifications
              </h2>
              <p className="text-xs text-muted-foreground">
                Install as mobile app and receive instant alerts on your phone whenever someone messages
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary bg-primary/10">
            PWA Standalone
          </Badge>
        </div>

        {/* PWA Install Banner */}
        <div className="p-4 rounded-xl bg-background/50 border border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Install Dashboard as Mobile App</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Run this admin panel as an app on your Android or iPhone with home screen icon and fast mobile access.
            </p>
          </div>
          <Button
            variant="hero"
            size="sm"
            onClick={handleInstallPwa}
            className="text-xs h-9 px-4 shrink-0"
          >
            📱 Install App on Phone
          </Button>
        </div>

        {/* System & Audio Notification Triggers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-background/50 border border-border/60 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-primary" /> Browser Push Notifications
              </span>
              <Badge variant="outline" className={`text-[10px] ${hasNotificationPermission ? "text-emerald-400 border-emerald-500/30" : "text-muted-foreground"}`}>
                {hasNotificationPermission ? "Active" : "Disabled"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Pops up system banner notification on desktop or mobile phone when someone sends a message.
            </p>
            <div className="flex items-center gap-2 pt-1">
              {!hasNotificationPermission ? (
                <Button size="sm" variant="outline" onClick={handleEnablePush} className="text-xs h-8">
                  Enable Permissions
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => notificationService.sendTestNotification()} className="text-xs h-8">
                  Test Push Alert
                </Button>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-background/50 border border-border/60 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-accent" /> High-Tech Audio Chime
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                Synthesized Web Audio
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Melodic chime sound that rings on arrival of new inquiries or AI assistant interactions.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={handleTestAudio} className="text-xs h-8">
                Test Audio Chime
              </Button>
            </div>
          </div>
        </div>

        {/* 3. Telegram Phone Push Integration */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-background/70 to-card/70 border border-border/70 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-foreground text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-400" />
                Telegram Instant Phone Alerts (100% Reliable Delivery)
              </span>
              <p className="text-[11px] text-muted-foreground">
                Get an instant notification on your mobile lock-screen with lead name, phone, budget, and scope.
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
              Direct Phone Push
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                Telegram Bot Token
              </label>
              <Input
                type="password"
                value={settings.telegramBotToken || ""}
                onChange={e => setSettings({ ...settings, telegramBotToken: e.target.value })}
                placeholder={settings.hasTelegramBotToken ? "Saved token configured — paste a new token to rotate" : "Paste your Telegram Bot Token"}
                className="bg-background/80 font-mono text-xs h-10"
                autoComplete="new-password"
              />
              <p className="mt-1 text-[10px] text-muted-foreground" role="status">
                {settings.hasTelegramBotToken ? "A token is stored securely on the server. The saved value is never sent to this page." : "No token is currently configured."}
              </p>
            </div>

            <div>
              <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                Your Telegram Chat ID
              </label>
              <Input
                value={settings.telegramChatId || ""}
                onChange={e => setSettings({ ...settings, telegramChatId: e.target.value })}
                placeholder="e.g. 987654321"
                className="bg-background/80 font-mono text-xs h-10"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-background/50 border border-border/50 text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Quick Setup (2 minutes):</strong>
            <ol className="list-decimal list-inside space-y-1 mt-1">
              <li>Open Telegram on your phone and search for <code className="text-sky-400">@BotFather</code>. Send <code>/newbot</code> to get your Bot Token.</li>
              <li>Search for your bot in Telegram and tap <strong>Start</strong>.</li>
              <li>Search for <code className="text-sky-400">@userinfobot</code> in Telegram to see your numeric <strong>Id</strong> (Chat ID). Paste both above and tap Test!</li>
            </ol>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isTestingTelegram}
              onClick={handleTestTelegram}
              className="text-xs h-9 border-sky-500/30 text-sky-400 hover:bg-sky-500/10"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              {isTestingTelegram ? "Dispatching..." : "Send Test Alert to Telegram Phone"}
            </Button>
          </div>
        </div>

      </Card>

      {/* 4. Administrator Identity & Security Audit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/60 border-border/70 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-foreground">Authenticated Identity</h2>
              <div className="text-xs font-mono text-accent">{currentAdmin}</div>
            </div>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <div className="p-2.5 rounded-lg bg-background/60 border border-border/60">
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Role:</span>
              <span className="font-semibold text-foreground">Principal Solution Architect / Root Admin</span>
            </div>
            <div className="p-2.5 rounded-lg bg-background/60 border border-border/60">
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Session Lifetime:</span>
              <span className="font-mono text-foreground">{APP_CONFIG.sessionDurationHours} Hours Sliding Expiration</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card/60 border-border/70 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-foreground">Security Audit Checklist</h2>
              <p className="text-xs text-muted-foreground">Hardened management console</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-background/50 border border-border/60 flex items-center justify-between">
              <span>Environment Password Isolation</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-background/50 border border-border/60 flex items-center justify-between">
              <span>Anti-Indexing Robots Header</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-background/50 border border-border/60 flex items-center justify-between">
              <span>Real-Time Inquiries WebSocket / Poll</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
