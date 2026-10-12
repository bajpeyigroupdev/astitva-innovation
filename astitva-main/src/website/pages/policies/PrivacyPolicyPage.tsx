import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AiAgentWidget from "../../components/AiAgentWidget";
import { ShieldCheck, ArrowLeft, Lock, FileText, CheckCircle2, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const PrivacyPolicyPage = () => {
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
            <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
              Verified Legal Document • DPDP Act 2023 Compliant
            </Badge>
          </div>

          {/* Hero Header */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-card via-card/80 to-background border border-border/80 shadow-2xl relative overflow-hidden mb-10">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Official Policy for Astitva Innovation (astitvainnovation.in) • Effective Date: October 2026
                </p>
              </div>
            </div>

            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              At <b>Astitva Innovation</b>, accessible from <a href="https://astitvainnovation.in" className="text-primary underline">https://astitvainnovation.in</a>, we are dedicated to maintaining the absolute confidentiality, integrity, and security of the personal and proprietary information entrusted to us by our clients, website visitors, and corporate partners.
            </p>
          </div>

          {/* Policy Clauses Content */}
          <div className="space-y-8 text-xs md:text-sm text-muted-foreground leading-relaxed">
            
            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">1</span>
                Information We Collect
              </h2>
              <p>
                We collect personal and technical information when you submit project inquiries, engage our AI Solutions Architect, request formal proposals, or enter into engineering contracts with Astitva Innovation:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><b>Direct Identifiers:</b> Name, corporate email address, phone/WhatsApp number, company name, and designation.</li>
                <li><b>Project Specifications:</b> Technical requirements, architectural scopes, estimated budgets, and Statements of Work (SOWs).</li>
                <li><b>Automated Telemetry:</b> IP address, browser type, device information, operating system, and session timestamps collected to safeguard against unauthorized intrusion and abuse.</li>
              </ul>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">2</span>
                Purpose and Legal Basis for Processing
              </h2>
              <p>
                Your data is processed strictly for legitimate corporate purposes under India's Digital Personal Data Protection (DPDP) Act and global security frameworks:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Providing customized software development, FinTech integrations, cloud deployments, and mobile application engineering.</li>
                <li>Executing verified communication regarding project milestones, deliverables, and technical consultations.</li>
                <li>Processing project invoices and contract documentation.</li>
                <li>Preventing malicious fraud, unauthorized access, and maintaining our 99.99% server uptime infrastructure.</li>
              </ul>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">3</span>
                Payment Processing &amp; PCI-DSS Compliance
              </h2>
              <p>
                All online commercial transactions and payment gateway checkouts are handled exclusively via certified <b>PCI-DSS Level 1 Compliant</b> payment processors (Razorpay, Stripe, Cashfree). 
              </p>
              <p>
                <b>Astitva Innovation does NOT store, transmit, or retain raw credit/debit card numbers, CVVs, or bank net-banking passwords</b> on our servers. All transactions are end-to-end encrypted with 256-bit TLS/SSL encryption.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">4</span>
                Non-Disclosure (NDA) &amp; Client Intellectual Property
              </h2>
              <p>
                We consider all client concepts, proprietary code, trade secrets, and API schemas to be classified confidential material. Every client engagement is protected under strict Non-Disclosure Agreement (NDA) clauses. We never sell, monetize, or license your proprietary data to advertisers or third-party brokers.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">5</span>
                Data Retention &amp; Security Measures
              </h2>
              <p>
                We implement bank-grade administrative, physical, and technological security measures, including bcrypt credential hashing, role-based JWT authentication, automated daily backups, and strict Nginx reverse proxy firewalls. Data is retained only as long as necessary to fulfill project warranties and legal compliance requirements.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">6</span>
                Your Privacy Rights
              </h2>
              <p>
                You retain the right to review, update, or request the permanent deletion of your contact records from our inquiries database at any time. Simply contact our privacy desk at <b>privacy@astitvainnovation.in</b>.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">7</span>
                Grievance Officer &amp; Contact Desk
              </h2>
              <p>
                In accordance with the Information Technology Act 2000 and rules made thereunder, the Grievance Officer for privacy inquiries is:
              </p>
              <div className="p-4 rounded-xl bg-background/60 border border-border/50 text-xs space-y-1.5 font-mono">
                <p><b>Astitva Innovation — Legal &amp; Compliance Cell</b></p>
                <p>Engineering Hub: India &amp; Global Remote Operations</p>
                <p>Email: <a href="mailto:contact@astitvainnovation.in" className="text-primary hover:underline">contact@astitvainnovation.in</a> / <a href="mailto:support@astitvainnovation.in" className="text-primary hover:underline">support@astitvainnovation.in</a></p>
                <p>Direct Telephonic Desk: <a href="tel:+917233882089" className="text-emerald-400 hover:underline">+91 7233882089</a></p>
                <p>Official URL: <a href="https://astitvainnovation.in" className="text-accent hover:underline">https://astitvainnovation.in</a></p>
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
              <Link to="/terms-of-service">
                Read Terms of Service
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

export default PrivacyPolicyPage;
