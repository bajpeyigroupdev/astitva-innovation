import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  UserCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2,
  Award,
  Search
} from "lucide-react";
import { foundersService, FounderProfile } from "../services/foundersService";

export const FoundersPage = () => {
  const [founders, setFounders] = useState<FounderProfile[]>([]);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingFounder, setEditingFounder] = useState<FounderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    position: "",
    roleBadge: "",
    bio: "",
    portfolioSummary: "",
    keySkills: "System Architecture, Strategic Leadership",
    photoUrl: "",
    linkedin: "",
    instagram: "",
    email: "",
    phone: "+91 7233882089",
    order: 1
  });

  const { toast } = useToast();

  const loadFounders = async () => {
    setIsLoading(true);
    const data = await foundersService.getFounders();
    setFounders(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadFounders();
  }, []);

  const handleOpenAdd = () => {
    setEditingFounder(null);
    setForm({
      name: "",
      position: "",
      roleBadge: "",
      bio: "",
      portfolioSummary: "",
      keySkills: "System Architecture, Strategic Leadership",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      linkedin: "",
      instagram: "",
      email: "",
      phone: "+91 7233882089",
      order: founders.length + 1
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (f: FounderProfile) => {
    setEditingFounder(f);
    setForm({
      name: f.name || "",
      position: f.position || "",
      roleBadge: f.roleBadge || f.position || "",
      bio: f.bio || "",
      portfolioSummary: f.portfolioSummary || "",
      keySkills: Array.isArray(f.keySkills) ? f.keySkills.join(", ") : "",
      photoUrl: f.photoUrl || "",
      linkedin: f.linkedin || "",
      instagram: f.instagram || "",
      email: f.email || "",
      phone: f.phone || "+91 7233882089",
      order: f.order || 1
    });
    setIsAddOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.position.trim()) {
      toast({ title: "Validation Error", description: "Name and Position are required", variant: "destructive" });
      return;
    }

    const payload: Partial<FounderProfile> = {
      name: form.name.trim(),
      position: form.position.trim(),
      roleBadge: form.roleBadge.trim() || form.position.trim(),
      bio: form.bio.trim(),
      portfolioSummary: form.portfolioSummary.trim(),
      keySkills: form.keySkills.split(",").map(s => s.trim()).filter(Boolean),
      photoUrl: form.photoUrl.trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      linkedin: form.linkedin.trim(),
      instagram: form.instagram.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || "+91 7233882089",
      order: Number(form.order) || 1
    };

    if (editingFounder) {
      const res = await foundersService.updateFounder(editingFounder.id, payload);
      if (res.success) {
        toast({ title: "Founder Profile Updated", description: `${form.name} was successfully updated.` });
        setIsAddOpen(false);
        loadFounders();
      } else {
        toast({ title: "Error", description: res.error || "Failed to update", variant: "destructive" });
      }
    } else {
      const res = await foundersService.createFounder(payload);
      if (res.success) {
        toast({ title: "Founder Profile Added", description: `${form.name} is now published on the website.` });
        setIsAddOpen(false);
        loadFounders();
      } else {
        toast({ title: "Error", description: res.error || "Failed to add founder", variant: "destructive" });
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the profile of "${name}"?`)) return;
    const ok = await foundersService.deleteFounder(id);
    if (ok) {
      toast({ title: "Profile Removed", description: `${name} has been removed from leadership directory.` });
      setFounders(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleToggle = async (id: string) => {
    const ok = await foundersService.toggleFounder(id);
    if (ok) {
      loadFounders();
      toast({ title: "Visibility Toggled", description: "Founder website visibility updated." });
    }
  };

  const filtered = founders.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.position.toLowerCase().includes(search.toLowerCase()) ||
    f.bio.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-card/90 via-card/60 to-card/90 border border-border/80 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
              Executive Governance
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Leadership &amp; Founders Management
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Manage founders profiles, photo, positions, bios, portfolio showcases, and social handles (LinkedIn, Instagram)
          </p>
        </div>

        <Button
          variant="hero"
          size="sm"
          onClick={handleOpenAdd}
          className="text-xs h-10 px-4 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Founder Profile
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 bg-card/60 border-border/70 backdrop-blur-sm">
          <div className="text-xs text-muted-foreground uppercase font-semibold">Total Executive Profiles</div>
          <div className="text-3xl font-black text-foreground mt-2">{founders.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Founders & Leadership directory</div>
        </Card>
        <Card className="p-5 bg-card/60 border-border/70 backdrop-blur-sm">
          <div className="text-xs text-muted-foreground uppercase font-semibold">Key Executives</div>
          <div className="text-sm font-semibold text-accent mt-2">
            Shivansh Kamal Bajpeyi &amp; Shiv Prakash
          </div>
          <div className="text-xs text-emerald-400 mt-1">Full Portfolio Active</div>
        </Card>
        <Card className="p-5 bg-card/60 border-border/70 backdrop-blur-sm">
          <div className="text-xs text-muted-foreground uppercase font-semibold">Primary Contact Desk</div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-2">
            +91 7233882089
          </div>
          <div className="text-xs text-muted-foreground mt-1">Direct Founder Line</div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search founders by name or position..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card/60 border-border/70 text-xs h-10"
          />
        </div>
      </div>

      {/* Founders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(f => (
          <Card
            key={f.id}
            className="p-6 bg-card/60 border-border/70 backdrop-blur-sm flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border-2 border-primary/30 overflow-hidden shrink-0 shadow-md">
                    <img src={f.photoUrl} alt={f.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{f.name}</h3>
                    <div className="text-xs font-medium text-accent">{f.position}</div>
                    <Badge variant="outline" className="text-[10px] mt-1 font-mono border-primary/30 text-primary">
                      {f.roleBadge}
                    </Badge>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`text-[10px] cursor-pointer ${
                    f.enabled !== false
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-muted text-muted-foreground"
                  }`}
                  onClick={() => handleToggle(f.id)}
                  title="Click to toggle visibility"
                >
                  {f.enabled !== false ? "Visible" : "Hidden"}
                </Badge>
              </div>

              {/* Bio */}
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {f.bio}
              </p>

              {/* Portfolio Summary */}
              {f.portfolioSummary && (
                <div className="p-3 rounded-xl bg-background/50 border border-border/60 text-[11px] text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground block mb-0.5">Portfolio Highlights:</span>
                  <span className="line-clamp-2">{f.portfolioSummary}</span>
                </div>
              )}

              {/* Social Channels */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                {f.linkedin && (
                  <a
                    href={f.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-background/80 border border-border/60 text-muted-foreground hover:text-primary transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                )}
                {f.instagram && (
                  <a
                    href={f.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-background/80 border border-border/60 text-muted-foreground hover:text-pink-400 transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                )}
                {f.email && (
                  <a
                    href={`mailto:${f.email}`}
                    className="p-2 rounded-lg bg-background/80 border border-border/60 text-muted-foreground hover:text-accent transition-colors"
                    title="Email"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                )}
                <a
                  href={`https://wa.me/${f.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  title="WhatsApp"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
                <span className="text-[11px] text-muted-foreground font-mono ml-auto">
                  {f.phone}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-border/60 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground font-mono">
                Order: #{f.order || 1}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(f)}
                  className="h-8 text-xs border-border/70"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(f.id, f.name)}
                  className="h-8 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                  title="Delete Founder"
                  aria-label="Delete Founder"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl bg-card border-border/80 p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              {editingFounder ? `Edit ${editingFounder.name}` : "Add New Executive Leader"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                  Full Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Shivansh Kamal Bajpeyi"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="bg-background/60 text-xs h-9"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                  Official Position *
                </label>
                <Input
                  required
                  placeholder="Founder & Chief Executive Officer"
                  value={form.position}
                  onChange={e => setForm({ ...form, position: e.target.value })}
                  className="bg-background/60 text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                  Role Badge Text
                </label>
                <Input
                  placeholder="CEO & Principal Architect"
                  value={form.roleBadge}
                  onChange={e => setForm({ ...form, roleBadge: e.target.value })}
                  className="bg-background/60 text-xs h-9"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                  Display Order
                </label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                  className="bg-background/60 text-xs h-9 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                Profile Photo URL
              </label>
              <Input
                placeholder="https://... or /photo.jpg"
                value={form.photoUrl}
                onChange={e => setForm({ ...form, photoUrl: e.target.value })}
                className="bg-background/60 text-xs h-9"
              />
            </div>

            <div>
              <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                Executive Bio / Vision *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Brief high-level summary of the founder's leadership and vision..."
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                className="w-full p-2.5 rounded-md bg-background/60 border border-border text-xs text-foreground resize-none"
              />
            </div>

            <div>
              <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                Detailed Portfolio Summary (Modal Deep-Dive)
              </label>
              <textarea
                rows={3}
                placeholder="Comprehensive overview of projects engineered, FinTech architectures delivered, company growth achievements..."
                value={form.portfolioSummary}
                onChange={e => setForm({ ...form, portfolioSummary: e.target.value })}
                className="w-full p-2.5 rounded-md bg-background/60 border border-border text-xs text-foreground resize-none"
              />
            </div>

            <div>
              <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                Key Skills (comma separated)
              </label>
              <Input
                placeholder="Distributed Architecture, FinTech, WebRTC, Cloud DevOps"
                value={form.keySkills}
                onChange={e => setForm({ ...form, keySkills: e.target.value })}
                className="bg-background/60 text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                  LinkedIn URL
                </label>
                <Input
                  placeholder="https://linkedin.com/in/..."
                  value={form.linkedin}
                  onChange={e => setForm({ ...form, linkedin: e.target.value })}
                  className="bg-background/60 text-xs h-9"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                  Instagram URL
                </label>
                <Input
                  placeholder="https://instagram.com/..."
                  value={form.instagram}
                  onChange={e => setForm({ ...form, instagram: e.target.value })}
                  className="bg-background/60 text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                  Corporate Email
                </label>
                <Input
                  type="email"
                  placeholder="founder@astitvainnovation.in"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="bg-background/60 text-xs h-9"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                  Direct Phone / WhatsApp
                </label>
                <Input
                  placeholder="+91 7233882089"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="bg-background/60 text-xs h-9 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="hero"
                size="sm"
                className="text-xs h-9 px-4"
              >
                Save Founder Profile
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoundersPage;
