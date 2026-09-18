import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  CheckCircle2, 
  Terminal, 
  Zap, 
  RefreshCw, 
  ShieldCheck, 
  Send,
  Lock,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PaymentLog } from "../types";

interface FinTechLogsProps {
  transactions: PaymentLog[];
}

export const FinTechLogs = ({ transactions }: FinTechLogsProps) => {
  const [logs, setLogs] = useState<PaymentLog[]>(transactions);
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);
  const { toast } = useToast();

  const simulateWebhook = () => {
    setIsSimulatingWebhook(true);
    setTimeout(() => {
      const newRef = "TXN_" + Math.floor(10000000 + Math.random() * 90000000);
      const newTx: PaymentLog = {
        id: "TX-" + Math.floor(100 + Math.random() * 900),
        gateway: "Razorpay Route",
        method: "UPI QR Mandate",
        amount: "₹" + Math.floor(1500 + Math.random() * 5000),
        status: "Captured",
        date: new Date().toISOString().slice(0, 16).replace("T", " "),
        ref: newRef,
      };

      setLogs([newTx, ...logs]);
      setIsSimulatingWebhook(false);
      toast({
        title: "Webhook Dispatched: payment.captured",
        description: `Simulated transaction ${newRef} verified with 200 OK.`,
      });
    }, 1000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            FinTech & Payment Gateway Operations
          </h2>
          <p className="text-xs text-muted-foreground">
            Real-time transaction logs, multi-gateway health, and automated webhook sandbox
          </p>
        </div>

        <Button 
          variant="hero" 
          size="sm" 
          onClick={simulateWebhook}
          disabled={isSimulatingWebhook}
          className="text-xs h-9 px-4"
        >
          {isSimulatingWebhook ? (
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Zap className="w-3.5 h-3.5 mr-1.5" />
          )}
          Trigger Test Webhook (200 OK)
        </Button>
      </div>

      {/* Gateway Nodes Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-xs text-foreground">Razorpay Node</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Operational
            </span>
          </div>
          <div className="text-lg font-bold text-foreground">99.98% SLA</div>
          <div className="text-[11px] text-muted-foreground mt-1">Avg Latency: 28ms</div>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-xs text-foreground">Stripe Connect</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Operational
            </span>
          </div>
          <div className="text-lg font-bold text-foreground">Global Multi-Currency</div>
          <div className="text-[11px] text-muted-foreground mt-1">Avg Latency: 42ms</div>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-xs text-foreground">Cashfree Auto-Collect</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Operational
            </span>
          </div>
          <div className="text-lg font-bold text-foreground">UPI 2.0 Dynamic QR</div>
          <div className="text-[11px] text-muted-foreground mt-1">Avg Latency: 31ms</div>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-xs text-foreground">Failover Auto-Router</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
              Active
            </span>
          </div>
          <div className="text-lg font-bold text-primary">Zero Drop-off</div>
          <div className="text-[11px] text-muted-foreground mt-1">Primary & Secondary Ready</div>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="bg-card/60 border-border/70 overflow-hidden shadow-lg">
        <div className="p-4 border-b border-border/70 flex items-center justify-between">
          <h3 className="font-bold text-sm text-foreground">Live Gateway Event Stream</h3>
          <span className="text-xs text-muted-foreground font-mono">Auto-reconciliation active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background/80 border-b border-border/70 text-muted-foreground uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Transaction Ref</th>
                <th className="p-4">Gateway</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Webhook Event</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {logs.map((tx) => (
                <tr key={tx.id} className="hover:bg-background/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-foreground">{tx.ref}</td>
                  <td className="p-4">
                    <Badge variant="outline" className="text-[10px] border-primary/40 bg-primary/10 text-primary">
                      {tx.gateway}
                    </Badge>
                  </td>
                  <td className="p-4 text-foreground">{tx.method}</td>
                  <td className="p-4 font-bold text-foreground">{tx.amount}</td>
                  <td className="p-4">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-max">
                      <CheckCircle2 className="w-3 h-3" />
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-muted-foreground">
                    payment.captured
                  </td>
                  <td className="p-4 font-mono text-[11px] text-muted-foreground">
                    {tx.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* PCI-DSS Security & Webhook URL info */}
      <Card className="p-6 bg-card/50 border-border/70 backdrop-blur-sm space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm text-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Webhook Endpoint URLs for Payment Aggregator Portals:</span>
        </div>
        <div className="space-y-2 font-mono text-xs text-muted-foreground">
          <div className="p-2.5 rounded-lg bg-background/60 border border-border/60 flex items-center justify-between">
            <span>Razorpay Webhook: <strong className="text-foreground">https://astitvainnovation.in/api/webhooks/razorpay</strong></span>
            <Badge variant="outline" className="text-[10px] text-emerald-400">Active</Badge>
          </div>
          <div className="p-2.5 rounded-lg bg-background/60 border border-border/60 flex items-center justify-between">
            <span>Stripe Webhook: <strong className="text-foreground">https://astitvainnovation.in/api/webhooks/stripe</strong></span>
            <Badge variant="outline" className="text-[10px] text-emerald-400">Active</Badge>
          </div>
          <div className="p-2.5 rounded-lg bg-background/60 border border-border/60 flex items-center justify-between">
            <span>Cashfree Webhook: <strong className="text-foreground">https://astitvainnovation.in/api/webhooks/cashfree</strong></span>
            <Badge variant="outline" className="text-[10px] text-emerald-400">Active</Badge>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default FinTechLogs;
