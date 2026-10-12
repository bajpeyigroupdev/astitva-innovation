import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AiAgentWidget from "../../components/AiAgentWidget";
import { FileText, ArrowLeft, CheckCircle2, ShieldCheck, Scale, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const TermsOfServicePage = () => {
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
            <Badge variant="outline" className="text-[10px] font-mono border-primary/40 bg-primary/10 text-primary">
              Legally Binding Agreement • Indian Contract Act 1872
            </Badge>
          </div>

          {/* Hero Header */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-card via-card/80 to-background border border-border/80 shadow-2xl relative overflow-hidden mb-10">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Commercial &amp; Engineering Agreement • Last Updated: October 2026
                </p>
              </div>
            </div>

            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              These Terms of Service govern the access, utilization, and contractual engineering engagements executed between <b>Astitva Innovation</b> ("Company", "we", "us", or "our") and any prospective client, partner, or user ("Client", "you").
            </p>
          </div>

          {/* Clauses Content */}
          <div className="space-y-8 text-xs md:text-sm text-muted-foreground leading-relaxed">
            
            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">1</span>
                Statement of Work &amp; Project Milestones
              </h2>
              <p>
                All software development, cloud infrastructure setup, payment gateway integrations, and mobile engineering services are governed by formal Statements of Work (SOW), project proposals, or digital work orders issued by Astitva Innovation.
              </p>
              <p>
                Each SOW clearly demarcates technical specifications, deliverables, iterative milestone schedules, and financial terms. Any alteration or scope expansion requested during the project lifecycle will be processed via an official Change Request Order (CRO).
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">2</span>
                100% Intellectual Property &amp; Source Code Ownership
              </h2>
              <p>
                We believe in complete ownership freedom for our clients:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><b>Full Code Assignment:</b> Upon receipt of 100% of the agreed milestone payments, all customized source code, Git repositories, architectural diagrams, database schemas, and intellectual property rights are unconditionally and irrevocably transferred to the Client.</li>
                <li><b>Pre-Existing Utilities:</b> Any open-source libraries (e.g. React, Node.js, TailwindCSS) remain licensed under their respective MIT/Apache licenses.</li>
                <li><b>Client Proprietary Data:</b> All client algorithms, proprietary databases, and confidential business logic remain the exclusive property of the Client at all times.</li>
              </ul>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">3</span>
                Financial Invoicing, Taxes &amp; Milestones
              </h2>
              <p>
                Payments are typically structured around predefined deliverables:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><b>Inception Deposit:</b> Required prior to the initiation of architecture design, sprint zero, or server provisioning.</li>
                <li><b>Sprint Milestones:</b> Billed upon successful staging demonstration of agreed deliverables.</li>
                <li><b>Final Handover:</b> Released upon final User Acceptance Testing (UAT) and production cutover.</li>
                <li>Invoices must be cleared within seven (7) business days. Applicable GST and statutory taxes are added as per Indian tax norms.</li>
              </ul>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">4</span>
                Post-Launch Warranty &amp; Bug-Fix Guarantee
              </h2>
              <p>
                Every custom application built by Astitva Innovation includes a complimentary <b>30 to 90-day post-launch warranty window</b> (stipulated in the SOW). During this warranty phase, our engineering squad resolves any deviations from agreed functional specifications or software bugs at zero additional fee.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">5</span>
                Third-Party Dependencies &amp; Limitation of Liability
              </h2>
              <p>
                While Astitva Innovation guarantees the resilience of its software architecture, the Company cannot be held liable for third-party infrastructure outages, including but not limited to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Bank server downtimes, UPI switch failures, or payment gateway processor outages (Razorpay, Stripe, Cashfree).</li>
                <li>Cloud service provider global disruptions (AWS, Cloudflare, Google Cloud, DigitalOcean).</li>
                <li>Delays arising from client-side third-party API approval processes (e.g. Meta WhatsApp Business API verification or Google Play Store review cycles).</li>
              </ul>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">6</span>
                Dispute Resolution &amp; Governing Jurisdiction
              </h2>
              <p>
                These Terms shall be interpreted, construed, and enforced in accordance with the laws of the Republic of India. In the event of any commercial dispute arising out of or related to this agreement, the parties agree to first pursue amicable mediation. If unresolved, exclusive legal jurisdiction shall vest in the competent courts of <b>Kanpur / Lucknow, Uttar Pradesh, India</b>.
              </p>
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
              <Link to="/refund-policy">
                Review Refund Policy
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

export default TermsOfServicePage;
