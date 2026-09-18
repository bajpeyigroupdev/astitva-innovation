import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Trash2, 
  MessageSquare, 
  Mail, 
  Plus, 
  Download, 
  Filter, 
  X,
  FileText
} from "lucide-react";
import { Inquiry } from "../types";

interface InquiriesManagerProps {
  inquiries: Inquiry[];
  onUpdateStatus: (id: string, status: Inquiry["status"]) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
}

export const InquiriesManager = ({
  inquiries,
  onUpdateStatus,
  onDelete,
  onOpenAddModal,
}: InquiriesManagerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const filtered = inquiries.filter((inq) => {
    const matchesSearch =
      inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ["ID,Name,Email,Phone,Service,Budget,Status,Date,Message"];
    const rows = inquiries.map(
      (i) =>
        `"${i.id}","${i.name}","${i.email}","${i.phone}","${i.service}","${i.budget}","${i.status}","${i.date}","${i.message.replace(/"/g, '""')}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "astitva_inquiries.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Inquiries & Client Leads ({inquiries.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            All inquiries received via the contact form and project cost calculator
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportCSV}
            className="text-xs h-9 border-border/80"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>

          <Button 
            variant="hero" 
            size="sm" 
            onClick={onOpenAddModal}
            className="text-xs h-9 px-4"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-grow w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads by client name, email, phone, or project scope..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card/60 border-border/80 text-xs h-10 w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["all", "New", "Contacted", "In Review", "Closed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === st
                  ? "bg-primary text-white"
                  : "bg-card/60 text-muted-foreground hover:bg-card border border-border/60"
              }`}
            >
              {st === "all" ? "All" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries Table */}
      <Card className="bg-card/60 border-border/70 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background/80 border-b border-border/70 text-muted-foreground uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Client Details</th>
                <th className="p-4">Requested Service</th>
                <th className="p-4">Budget Tier</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No inquiries found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((inq) => (
                  <tr key={inq.id} className="hover:bg-background/40 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-foreground text-sm">{inq.name}</div>
                      <div className="text-[11px] text-accent font-mono">{inq.email}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{inq.phone}</div>
                    </td>

                    <td className="p-4">
                      <span className="font-medium text-foreground">{inq.service}</span>
                    </td>

                    <td className="p-4">
                      <span className="font-mono text-primary font-semibold">{inq.budget}</span>
                    </td>

                    <td className="p-4">
                      <select
                        value={inq.status}
                        onChange={(e) => onUpdateStatus(inq.id, e.target.value as Inquiry["status"])}
                        className={`text-[11px] font-semibold rounded px-2 py-1 border focus:outline-none bg-background ${
                          inq.status === "New" 
                            ? "border-emerald-500/40 text-emerald-400" 
                            : inq.status === "Contacted" 
                            ? "border-primary/40 text-primary" 
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Review">In Review</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-muted-foreground">
                      {inq.date}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInquiry(inq)}
                          className="text-[11px] h-8 px-2.5"
                        >
                          View Scope
                        </Button>

                        <a
                          href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(inq.name)},%20I%20am%20reaching%20out%20from%20Astitva%20Innovation%20regarding%20your%20project%20inquiry.`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                          title="WhatsApp Chat"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>

                        <a
                          href={`mailto:${inq.email}?subject=Astitva%20Innovation%20-%20Project%20Scope%20and%20Architecture`}
                          className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-colors"
                          title="Email Client"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(inq.id)}
                          className="text-destructive hover:bg-destructive/10 h-8 px-2"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Scope Detail Modal / Drawer */}
      {selectedInquiry && (
        <Card className="p-6 bg-card/95 border-primary/40 shadow-2xl rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <div>
              <h3 className="font-bold text-base text-foreground">
                Technical Scope & Requirements: {selectedInquiry.name}
              </h3>
              <div className="text-xs text-muted-foreground font-mono mt-0.5">
                Ref: {selectedInquiry.id} • {selectedInquiry.email} • {selectedInquiry.phone}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedInquiry(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-background/60 border border-border/60 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Service:</span>
              <strong className="text-accent">{selectedInquiry.service}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Budget Tier:</span>
              <strong className="text-primary font-mono">{selectedInquiry.budget}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Received Date:</span>
              <span className="font-mono text-muted-foreground">{selectedInquiry.date}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">
              Project Description & Requirements:
            </label>
            <div className="p-4 rounded-xl bg-background/80 border border-border/80 text-xs font-mono whitespace-pre-wrap leading-relaxed">
              {selectedInquiry.message}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Mark Status:</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onUpdateStatus(selectedInquiry.id, "Contacted")}
                className="text-xs h-8"
              >
                Mark Contacted
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onUpdateStatus(selectedInquiry.id, "In Review")}
                className="text-xs h-8"
              >
                Mark In Review
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`mailto:${selectedInquiry.email}?subject=Astitva%20Innovation%20-%20Project%20Scope%20and%20Architecture`}
                className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                Reply via Email
              </a>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
};

export default InquiriesManager;
