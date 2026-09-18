import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  CreditCard, 
  Globe, 
  Smartphone, 
  Cloud, 
  Bot, 
  Layers, 
  Palette, 
  Users,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  startingPrice: string;
  turnaround: string;
  active: boolean;
  icon: any;
}

export const ServicesManager = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: "srv-1",
      name: "Payment Gateway & FinTech Engineering",
      category: "FinTech",
      startingPrice: "₹45,000",
      turnaround: "2-3 Weeks",
      active: true,
      icon: CreditCard,
    },
    {
      id: "srv-2",
      name: "Enterprise Web & SaaS Platforms",
      category: "Full-Stack",
      startingPrice: "₹65,000",
      turnaround: "3-5 Weeks",
      active: true,
      icon: Globe,
    },
    {
      id: "srv-3",
      name: "Cross-Platform Mobile Apps (iOS & Android)",
      category: "Mobile",
      startingPrice: "₹75,000",
      turnaround: "4-6 Weeks",
      active: true,
      icon: Smartphone,
    },
    {
      id: "srv-4",
      name: "Cloud DevOps, Docker & Kubernetes",
      category: "Cloud",
      startingPrice: "₹40,000",
      turnaround: "1-2 Weeks",
      active: true,
      icon: Cloud,
    },
    {
      id: "srv-5",
      name: "AI Agents & Intelligent Workflow Automation",
      category: "AI",
      startingPrice: "₹50,000",
      turnaround: "2-4 Weeks",
      active: true,
      icon: Bot,
    },
    {
      id: "srv-6",
      name: "Custom API Microservices & Webhooks",
      category: "Backend",
      startingPrice: "₹35,000",
      turnaround: "1-3 Weeks",
      active: true,
      icon: Layers,
    },
    {
      id: "srv-7",
      name: "UI/UX Product Design & Figma Prototyping",
      category: "Design",
      startingPrice: "₹25,000",
      turnaround: "1-2 Weeks",
      active: true,
      icon: Palette,
    },
    {
      id: "srv-8",
      name: "Dedicated Engineering Squad Augmentation",
      category: "Staffing",
      startingPrice: "₹1,20,000/mo",
      turnaround: "Immediate",
      active: true,
      icon: Users,
    },
  ]);

  const toggleService = (id: string) => {
    setServices(prev => 
      prev.map(s => s.id === id ? { ...s, active: !s.active } : s)
    );
    toast({
      title: "Service Status Updated",
      description: "Service visibility status updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          Service Offerings & Pricing Management
        </h2>
        <p className="text-xs text-muted-foreground">
          Control active enterprise services, turnaround baselines, and introductory pricing tiers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((srv) => (
          <Card 
            key={srv.id}
            className={`p-5 border transition-all ${
              srv.active 
                ? "bg-card/60 border-border/70 hover:border-primary/40" 
                : "bg-card/20 border-border/40 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                  <srv.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-foreground">{srv.name}</h3>
                    <Badge variant="outline" className="text-[10px]">{srv.category}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Starting: <strong className="text-accent font-mono">{srv.startingPrice}</strong> • Delivery: {srv.turnaround}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Switch 
                  checked={srv.active}
                  onCheckedChange={() => toggleService(srv.id)}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServicesManager;
