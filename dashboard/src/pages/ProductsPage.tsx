import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Smartphone, 
  Globe, 
  Layers,
  Search
} from "lucide-react";
import { productsService, ProductItem } from "../services/productsService";

export const ProductsPage = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    tagline: "",
    category: "Mobile Application",
    badge: "Official Release",
    description: "",
    storeUrl: "",
    storeType: "google-play",
    packageName: "",
    iconUrl: "",
    technologies: "Flutter, Node.js, WebRTC",
    features: "Real-time communication\nIn-app wallet\nSmart discovery",
    status: "Active",
    isFeatured: false
  });

  const { toast } = useToast();

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await productsService.getProducts();
    setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      tagline: "",
      category: "Mobile Application",
      badge: "Official Release",
      description: "",
      storeUrl: "",
      storeType: "google-play",
      packageName: "",
      iconUrl: "",
      technologies: "Flutter, Node.js, WebRTC",
      features: "Real-time communication\nIn-app wallet\nSmart discovery",
      status: "Active",
      isFeatured: false
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (p: ProductItem) => {
    setEditingProduct(p);
    setForm({
      name: p.name || "",
      tagline: p.tagline || "",
      category: p.category || "Mobile Application",
      badge: p.badge || "Live",
      description: p.description || "",
      storeUrl: p.storeUrl || "",
      storeType: p.storeType || "google-play",
      packageName: p.packageName || "",
      iconUrl: p.iconUrl || "",
      technologies: Array.isArray(p.technologies) ? p.technologies.join(", ") : "",
      features: Array.isArray(p.features) ? p.features.join("\n") : "",
      status: p.status || "Active",
      isFeatured: Boolean(p.isFeatured)
    });
    setIsAddOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Validation Error", description: "Product name is required", variant: "destructive" });
      return;
    }

    const payload: Partial<ProductItem> = {
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      category: form.category.trim(),
      badge: form.badge.trim(),
      description: form.description.trim(),
      storeUrl: form.storeUrl.trim(),
      storeType: form.storeType,
      packageName: form.packageName.trim(),
      iconUrl: form.iconUrl.trim(),
      technologies: form.technologies.split(",").map(s => s.trim()).filter(Boolean),
      features: form.features.split("\n").map(s => s.trim()).filter(Boolean),
      status: form.status,
      isFeatured: form.isFeatured
    };

    if (editingProduct) {
      const res = await productsService.updateProduct(editingProduct.id, payload);
      if (res.success) {
        toast({ title: "Product Updated", description: `${form.name} was successfully updated.` });
        setIsAddOpen(false);
        loadProducts();
      } else {
        toast({ title: "Error", description: res.error || "Failed to update", variant: "destructive" });
      }
    } else {
      const res = await productsService.createProduct(payload);
      if (res.success) {
        toast({ title: "Product Added", description: `${form.name} is now live and published.` });
        setIsAddOpen(false);
        loadProducts();
      } else {
        toast({ title: "Error", description: res.error || "Failed to add", variant: "destructive" });
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}"?`)) return;
    const ok = await productsService.deleteProduct(id);
    if (ok) {
      toast({ title: "Product Removed", description: `${name} has been deleted.` });
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleToggle = async (id: string) => {
    const ok = await productsService.toggleProduct(id);
    if (ok) {
      loadProducts();
      toast({ title: "Status Updated", description: "Product live visibility toggled." });
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-card/90 via-card/60 to-card/90 border border-border/80 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
              Software Ecosystem Management
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Proprietary Products & Apps
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Add, update, and manage platforms published by Astitva Innovation (e.g. Meethi Chat, SaaS platforms, apps)
          </p>
        </div>

        <Button
          variant="hero"
          size="sm"
          onClick={handleOpenAdd}
          className="text-xs h-10 px-4 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 bg-card/60 border-border/70 backdrop-blur-sm">
          <div className="text-xs text-muted-foreground uppercase font-semibold">Total Platforms</div>
          <div className="text-3xl font-black text-foreground mt-2">{products.length}</div>
          <div className="text-xs text-muted-foreground mt-1">In centralized registry</div>
        </Card>
        <Card className="p-5 bg-card/60 border-border/70 backdrop-blur-sm">
          <div className="text-xs text-muted-foreground uppercase font-semibold">Active & Live</div>
          <div className="text-3xl font-black text-emerald-400 mt-2">
            {products.filter(p => p.status === "Active" || !p.status).length}
          </div>
          <div className="text-xs text-emerald-400/80 mt-1">Visible on corporate website</div>
        </Card>
        <Card className="p-5 bg-card/60 border-border/70 backdrop-blur-sm">
          <div className="text-xs text-muted-foreground uppercase font-semibold">Flagship Apps</div>
          <div className="text-3xl font-black text-primary mt-2">
            {products.filter(p => p.isFeatured || p.id === "prod-meethi-chat").length}
          </div>
          <div className="text-xs text-accent mt-1">e.g. Meethi Chat (Voice)</div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products by name or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card/60 border-border/70 text-xs h-10"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(p => (
          <Card
            key={p.id}
            className="p-6 bg-card/60 border-border/70 backdrop-blur-sm flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                    {p.iconUrl ? (
                      <img src={p.iconUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      {p.name}
                      {p.id === "prod-meethi-chat" && (
                        <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent border-accent/30 font-mono">
                          Flagship
                        </Badge>
                      )}
                    </h3>
                    <div className="text-xs text-muted-foreground">{p.category}</div>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`text-[10px] cursor-pointer ${
                    p.status === "Active" || !p.status
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-muted text-muted-foreground"
                  }`}
                  onClick={() => handleToggle(p.id)}
                  title="Click to toggle status"
                >
                  {p.status || "Active"}
                </Badge>
              </div>

              {p.tagline && (
                <div className="text-xs font-semibold text-accent">{p.tagline}</div>
              )}

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {p.description}
              </p>

              {p.technologies && p.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {p.technologies.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-background/60 border border-border/60 text-foreground/80 font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {p.storeUrl && (
                <div className="pt-2">
                  <a
                    href={p.storeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-accent font-medium transition-colors"
                  >
                    <span>Store / Demo URL</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-border/60 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground font-mono">
                ID: {p.id}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(p)}
                  className="h-8 text-xs border-border/70"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>

                {p.id !== "prod-meethi-chat" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(p.id, p.name)}
                    className="h-8 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
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
              {editingProduct ? `Edit ${editingProduct.name}` : "Publish New Product / Platform"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                  Product Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Meethi Chat, PayFlex Gateway"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="bg-background/60 text-xs h-9"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                  Category
                </label>
                <Input
                  placeholder="e.g. Social Voice, FinTech, SaaS"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="bg-background/60 text-xs h-9"
                />
              </div>
            </div>

            <div>
              <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                Tagline / Short Hook
              </label>
              <Input
                placeholder="e.g. Real-Time 1-on-1 Voice Calling & Matchmaking Platform"
                value={form.tagline}
                onChange={e => setForm({ ...form, tagline: e.target.value })}
                className="bg-background/60 text-xs h-9"
              />
            </div>

            <div>
              <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                Full Description *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Detailed overview of what the platform does, users targeted, and core capabilities..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full p-2.5 rounded-md bg-background/60 border border-border text-xs text-foreground resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                  Play Store / Web URL
                </label>
                <Input
                  placeholder="https://play.google.com/store/apps/..."
                  value={form.storeUrl}
                  onChange={e => setForm({ ...form, storeUrl: e.target.value })}
                  className="bg-background/60 text-xs h-9"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                  Package / Identifier
                </label>
                <Input
                  placeholder="e.g. com.umangchatlive"
                  value={form.packageName}
                  onChange={e => setForm({ ...form, packageName: e.target.value })}
                  className="bg-background/60 text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                  Icon URL
                </label>
                <Input
                  placeholder="/meethi-chat-icon.png or https://..."
                  value={form.iconUrl}
                  onChange={e => setForm({ ...form, iconUrl: e.target.value })}
                  className="bg-background/60 text-xs h-9"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                  Badge Text
                </label>
                <Input
                  placeholder="Official Flagship, Beta, Live"
                  value={form.badge}
                  onChange={e => setForm({ ...form, badge: e.target.value })}
                  className="bg-background/60 text-xs h-9"
                />
              </div>
            </div>

            <div>
              <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                Technologies (comma separated)
              </label>
              <Input
                placeholder="WebRTC, Node.js, Socket.IO, Redis, Android Native"
                value={form.technologies}
                onChange={e => setForm({ ...form, technologies: e.target.value })}
                className="bg-background/60 text-xs h-9 font-mono"
              />
            </div>

            <div>
              <label className="text-muted-foreground uppercase font-semibold text-[10px] block mb-1">
                Key Features (one per line)
              </label>
              <textarea
                rows={3}
                placeholder="Real-Time 1-on-1 Voice Calling&#10;Smart Matchmaking algorithm&#10;In-app wallet & rewards"
                value={form.features}
                onChange={e => setForm({ ...form, features: e.target.value })}
                className="w-full p-2.5 rounded-md bg-background/60 border border-border text-xs text-foreground resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded border-border"
                />
                <span>Highlight as Featured Flagship Platform</span>
              </label>

              <div className="flex items-center gap-2">
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
                  Save & Publish
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
