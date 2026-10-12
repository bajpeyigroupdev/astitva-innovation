import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AiAgentWidget from "../../components/AiAgentWidget";
import { Cookie, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const CookiePolicyPage = () => {
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
            <Badge variant="outline" className="text-[10px] font-mono border-amber-500/40 bg-amber-500/10 text-amber-400">
              Web Telemetry &amp; Cookie Disclosure
            </Badge>
          </div>

          {/* Hero Header */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-card via-card/80 to-background border border-border/80 shadow-2xl relative overflow-hidden mb-10">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
                <Cookie className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Cookie Policy</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Transparency on Local Storage &amp; Cookies • Last Updated: October 2026
                </p>
              </div>
            </div>

            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              This Cookie Policy explains how <b>Astitva Innovation</b> uses cookies, local storage, and related browser technologies on <a href="https://astitvainnovation.in" className="text-primary underline">https://astitvainnovation.in</a> to enhance your navigation experience and deliver customized software estimations.
            </p>
          </div>

          {/* Clauses Content */}
          <div className="space-y-8 text-xs md:text-sm text-muted-foreground leading-relaxed">
            
            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-mono">1</span>
                What Are Cookies &amp; Local Storage?
              </h2>
              <p>
                Cookies and HTML5 LocalStorage are small text files stored locally in your web browser. They enable web applications to preserve your preferences (such as dark-mode visual theme, project calculator selections, or AI chat state) across page reloads.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-mono">2</span>
                Categories of Cookies We Use
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><b>Strictly Necessary Cookies:</b> Essential for security, CSRF protection, and authenticating authorized administrative sessions on the B2B dashboard.</li>
                <li><b>Functional &amp; State Storage:</b> Saves your selected project scope in the cost calculator and stores your session in the AI Assistant widget so your chat isn't lost on refresh.</li>
                <li><b>Performance &amp; Diagnostics:</b> Aggregated anonymous telemetry to evaluate page load speeds, asset bundle caching, and server latency.</li>
              </ul>
              <p>
                <b>We do NOT use invasive advertising tracking cookies</b> or sell cross-site behavioral cookies to third-party ad networks.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-mono">3</span>
                Managing Your Preferences
              </h2>
              <p>
                You can manage, restrict, or delete cookies at any time via your browser settings (Chrome, Firefox, Safari, Edge). Please note that disabling essential cookies may impact the interactivity of our Project Cost Estimator and B2B login session.
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
              <Link to="/privacy-policy">
                View Privacy Policy
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

export default CookiePolicyPage;
