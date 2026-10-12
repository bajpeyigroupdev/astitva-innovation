import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AiAgentWidget from "../../components/AiAgentWidget";
import { CreditCard, ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const RefundPolicyPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Homepage
            </Link>
            <Badge variant="outline" className="text-[10px] font-mono border-accent/40 bg-accent/10 text-accent">
              Merchant Payment Gateway Standard • RBI Compliance
            </Badge>
          </div>

          {/* Hero Header */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-card via-card/80 to-background border border-border/80 shadow-2xl relative overflow-hidden mb-10">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-inner">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Refund &amp; Cancellation Policy</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Commercial Milestone Guidelines • Last Updated: October 2026
                </p>
              </div>
            </div>

            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              At <b>Astitva Innovation</b>, we engineer high-performance custom software, FinTech gateway routing engines, and enterprise digital solutions. Because our deliverables involve intensive specialized engineering hours, server resources, and custom intellectual capital, this policy governs the terms of milestone refunds and project cancellations.
            </p>
          </div>

          {/* Clauses Content */}
          <div className="space-y-8 text-xs md:text-sm text-muted-foreground leading-relaxed">
            
            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">1</span>
                Project Inception &amp; Cancellation Window
              </h2>
              <p>
                Clients may cancel an engagement by submitting written notice via email to <b>billing@astitvainnovation.in</b>:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><b>Cancellation within 48 Hours:</b> If written cancellation is received within 48 hours of invoice payment and prior to the commencement of technical architecture sprint zero, a <b>100% full refund</b> (less nominal third-party payment gateway transaction fees) will be issued.</li>
                <li><b>Cancellation After Engineering Kickoff:</b> Once dedicated engineering teams, server environments, or wireframes have been mobilized, advance retainers are non-refundable to cover consumed engineering hours.</li>
              </ul>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">2</span>
                Milestone-Based Deliverable Non-Refundability
              </h2>
              <p>
                To provide transparency, our development contracts are broken into verifiable milestones:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Payments made toward completed, demonstrated, or client-approved milestones (e.g. database schema approval, UI design signoff, staging server demonstration) are strictly <b>non-refundable</b>.</li>
                <li>In the unlikely event that a future milestone cannot be fulfilled due to Company default, unearned advance funds allocated specifically to that future milestone will be refunded on a pro-rata basis.</li>
              </ul>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">3</span>
                Third-Party &amp; Cloud Infrastructure Costs
              </h2>
              <p>
                Certain expenditures incurred on the Client's behalf cannot be refunded under any circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Cloud server hosting and domain name registrations (AWS, Ubuntu Droplets, Cloudflare, Namecheap).</li>
                <li>Third-party API credits, SMS gateway packs, Meta WhatsApp API fees, or merchant account setup charges.</li>
                <li>Google Play Console or Apple Developer Program merchant fees paid directly to third-party stores.</li>
              </ul>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">4</span>
                Refund Processing Timelines
              </h2>
              <p>
                Approved refunds will be processed within <b>5 to 7 business days</b> from the date of formal approval. Refunds will be credited directly to the original method of payment (Original Credit/Debit Card, UPI handle, or Bank NEFT/RTGS Account) as required under Indian banking and payment gateway mandates.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">5</span>
                Commercial Support &amp; Billing Assistance
              </h2>
              <p>
                For questions regarding invoices, milestone schedules, or cancellation requests, reach our finance and client accounts desk:
              </p>
              <div className="p-4 rounded-xl bg-background/60 border border-border/50 text-xs space-y-1.5 font-mono">
                <p><b>Astitva Innovation — Accounts &amp; Billing Desk</b></p>
                <p>Email: <a href="mailto:billing@astitvainnovation.in" className="text-primary hover:underline">billing@astitvainnovation.in</a> / <a href="mailto:contact@astitvainnovation.in" className="text-primary hover:underline">contact@astitvainnovation.in</a></p>
                <p>Direct Phone: <a href="tel:+917233882089" className="text-emerald-400 hover:underline">+91 7233882089</a></p>
                <p>Official Website: <a href="https://astitvainnovation.in" className="text-accent hover:underline">https://astitvainnovation.in</a></p>
              </div>
            </section>

          </div>

          {/* Action CTA */}
          <div className="mt-12 text-center pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild variant="outline" className="text-xs">
              <Link to="/">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Return to Homepage
              </Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-white text-xs">
              <Link to="/security-policy">
                View Security &amp; Compliance Policy
              </Link>
            </Button>
          </div>

        </div>
      </main>

      <Footer />
      <AiAgentWidget />
    </div>
  );
};

export default RefundPolicyPage;
