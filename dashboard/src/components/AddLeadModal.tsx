import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Inquiry } from "../types";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (lead: Omit<Inquiry, "id" | "date" | "status">) => void;
}

export const AddLeadModal = ({ isOpen, onClose, onAdd }: AddLeadModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "FinTech & Payment Gateway",
    budget: "₹1,50,000 - ₹5,00,000",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({
      name: "",
      email: "",
      phone: "",
      service: "FinTech & Payment Gateway",
      budget: "₹1,50,000 - ₹5,00,000",
      message: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card border-border/80 p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Register Client Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
              Client / Company Name *
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ramesh Verma"
              className="bg-background/60 text-xs h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
                Email *
              </label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@company.com"
                className="bg-background/60 text-xs h-10"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
                Phone
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="bg-background/60 text-xs h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
                Service
              </label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
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
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
                Budget
              </label>
              <select
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
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
            <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
              Project Scope / Notes *
            </label>
            <Textarea
              required
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Technical specifications, timelines, or notes..."
              className="bg-background/60 text-xs resize-none"
            />
          </div>

          <Button type="submit" variant="hero" className="w-full text-xs h-10">
            Register Lead in Database
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
