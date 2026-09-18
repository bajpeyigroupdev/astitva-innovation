import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Terminal, 
  QrCode, 
  Smartphone,
  Layers,
  Banknote,
  Cpu
} from "lucide-react";

export const PaymentSolutions = () => {
  const [selectedGateway, setSelectedGateway] = useState("all");
  const [simulatorState, setSimulatorState] = useState<"idle" | "processing" | "success">("idle");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [txId, setTxId] = useState("");

  const gateways = [
    { name: "Razorpay", desc: "India's leading full-stack payment gateway & automated webhooks", logo: "💳" },
    { name: "Stripe", desc: "Global multi-currency credit/debit card processing & SaaS billing", logo: "🌍" },
    { name: "Cashfree Payments", desc: "Instant auto-collect UPI, payment links & marketplace payouts", logo: "⚡" },
    { name: "PhonePe PG", desc: "Direct UPI intent flow with high success rate on mobile", logo: "📱" },
    { name: "Paytm Business", desc: "Wallet, All-in-One QR, and recurring subscription mandates", logo: "🏦" },
    { name: "PayPal Express", desc: "Cross-border international payments across 200+ countries", logo: "🌐" },
  ];

  const features = [
    {
      icon: Zap,
      title: "Smart Multi-Gateway Routing",
      desc: "Zero transaction drop-off. If Primary Gateway (e.g., Razorpay) faces downtime, traffic routes seamlessly to fallback (Stripe/Cashfree) in milliseconds."
    },
    {
      icon: Smartphone,
      title: "Instant UPI & QR Intent",
      desc: "Deep-link UPI integration for GPay, PhonePe, and Paytm on Android/iOS, plus dynamic dynamic QR codes with real-time websocket verification."
    },
    {
      icon: RefreshCw,
      title: "Automated Recurring Subscriptions",
      desc: "RBI e-mandate & recurring card tokenization for SaaS platforms, weekly/monthly subscriptions, auto-retry logic, and dunning management."
    },
    {
      icon: Banknote,
      title: "Marketplace Split & Vendor Payouts",
      desc: "Automated merchant commission splitting, vendor disbursements, instant bank NEFT/IMPS transfers, and ledger reconciliation."
    },
    {
      icon: ShieldCheck,
      title: "PCI-DSS Compliant Security",
      desc: "End-to-end 256-bit SSL encryption, tokenized card vaulting without touching your database, and automated fraud score detection."
    },
    {
      icon: Terminal,
      title: "Webhook Reliability & Auto-Reconcile",
      desc: "Idempotent event webhooks, automated transaction reconciliation, and real-time failure notification queues so you never lose an order."
    }
  ];

  const handleSimulatePayment = () => {
    setSimulatorState("processing");
    setTimeout(() => {
      const generatedId = "TXN_" + Math.floor(10000000 + Math.random() * 90000000);
      setTxId(generatedId);
      setSimulatorState("success");
    }, 1400);
  };

  const handleResetSimulator = () => {
    setSimulatorState("idle");
    setTxId("");
  };

  const scrollToContact = () => {
    const el = document.getElementById("contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="fintech" className="py-24 relative overflow-hidden bg-gradient-to-b from-background via-card/40 to-background border-y border-border/40">
      {/* Background glow */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="outline" className="px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase border-accent/40 bg-accent/10 text-accent">
            FinTech & Payment Engineering
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
            Enterprise <span className="bg-gradient-primary bg-clip-text text-transparent">Payment Gateway</span> Solutions
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We architect, integrate, and certify bank-grade payment gateways, UPI systems, recurring billing, and multi-currency checkouts for high-scale applications.
          </p>
        </div>

        {/* Supported Gateway Badges */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {gateways.map((gw, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-xl bg-card/60 border border-border/60 hover:border-primary/40 hover:bg-card transition-all duration-300 text-center group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{gw.logo}</div>
              <div className="font-semibold text-sm text-foreground">{gw.name}</div>
              <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{gw.desc}</div>
            </div>
          ))}
        </div>

        {/* Feature Grid & Interactive Live Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Features Column */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feat, idx) => (
              <Card 
                key={idx}
                className="p-5 bg-card/50 backdrop-blur-sm border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary">
                  <feat.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base mb-2 text-foreground">{feat.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
              </Card>
            ))}
          </div>

          {/* Interactive Live Payment Simulator */}
          <div className="lg:col-span-5">
            <Card className="p-6 bg-card/80 backdrop-blur-md border border-primary/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-accent/20 text-accent text-[11px] font-mono font-semibold rounded-bl-lg border-l border-b border-accent/30">
                LIVE SANDBOX DEMO
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Astitva FinTech Engine</h4>
                  <p className="text-xs text-muted-foreground">Zero Drop-off Checkout Modal</p>
                </div>
              </div>

              {simulatorState === "idle" && (
                <div className="space-y-4">
                  {/* Order Summary box */}
                  <div className="p-3.5 rounded-lg bg-background/60 border border-border/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">Product Package</div>
                      <div className="text-sm font-semibold">Enterprise SaaS License</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Amount</div>
                      <div className="text-base font-bold text-primary">₹2,499.00</div>
                    </div>
                  </div>

                  {/* Payment method selection */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-2">Select Payment Channel:</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("upi")}
                        className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                          paymentMethod === "upi"
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border/80 bg-background/50 text-muted-foreground hover:bg-card"
                        }`}
                      >
                        <QrCode className="w-4 h-4" />
                        <span>UPI / QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                          paymentMethod === "card"
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border/80 bg-background/50 text-muted-foreground hover:bg-card"
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("netbanking")}
                        className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                          paymentMethod === "netbanking"
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border/80 bg-background/50 text-muted-foreground hover:bg-card"
                        }`}
                      >
                        <Layers className="w-4 h-4" />
                        <span>NetBanking</span>
                      </button>
                    </div>
                  </div>

                  {/* Simulated Input */}
                  <div className="p-3 rounded-lg bg-background/40 border border-border/60 text-xs">
                    {paymentMethod === "upi" && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-mono">vpa: client@okaxis</span>
                        <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">Instant Intent</Badge>
                      </div>
                    )}
                    {paymentMethod === "card" && (
                      <div className="flex items-center justify-between font-mono text-muted-foreground">
                        <span>•••• •••• •••• 4242</span>
                        <span>12/28</span>
                      </div>
                    )}
                    {paymentMethod === "netbanking" && (
                      <div className="text-muted-foreground">
                        HDFC Bank / ICICI Bank / SBI Fast Router
                      </div>
                    )}
                  </div>

                  <Button 
                    variant="hero" 
                    className="w-full py-5 text-sm font-semibold"
                    onClick={handleSimulatePayment}
                  >
                    <Lock className="w-3.5 h-3.5 mr-2" />
                    Simulate Live Checkout (₹2,499)
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                    <span>256-Bit Encrypted & Tokenized Simulation</span>
                  </div>
                </div>
              )}

              {simulatorState === "processing" && (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
                  <div>
                    <h5 className="font-semibold text-sm">Processing Smart Routing...</h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      Checking node latency & token verification
                    </p>
                  </div>
                </div>
              )}

              {simulatorState === "success" && (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h5 className="font-bold text-base text-emerald-400">Transaction Authorized!</h5>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      Ref ID: {txId}
                    </p>
                  </div>

                  <div className="bg-background/80 rounded-lg p-3 text-left border border-border/80 text-[11px] font-mono space-y-1 text-muted-foreground">
                    <div className="text-emerald-400">✓ Webhook dispatched: payment.captured</div>
                    <div>✓ Gateway: Primary Tier-1 Node</div>
                    <div>✓ SLA Response Time: 34ms</div>
                    <div>✓ Auto-invoice generated & sent</div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full mt-2 text-xs"
                    onClick={handleResetSimulator}
                  >
                    Test Another Method
                  </Button>
                </div>
              )}
            </Card>
          </div>

        </div>

        {/* Enterprise Bottom Banner */}
        <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-primary/20 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">Need a custom payment gateway or merchant integration?</h3>
            <p className="text-sm text-muted-foreground max-w-xl">
              From business merchant compliance documents to full API integration on web & mobile, our certified engineers deliver turnkey payment infrastructure.
            </p>
          </div>
          <Button 
            variant="hero" 
            size="lg"
            onClick={scrollToContact}
            className="shrink-0 whitespace-nowrap"
          >
            Integrate Payment Gateway
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

      </div>
    </section>
  );
};

export default PaymentSolutions;
