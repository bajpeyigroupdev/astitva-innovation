import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AiAgentWidget from "../../components/AiAgentWidget";
import { Lock, ArrowLeft, ShieldCheck, Server, Key, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const SecurityPolicyPage = () => {
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
              Enterprise Grade Security Architecture
            </Badge>
          </div>

          {/* Hero Header */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-card via-card/80 to-background border border-border/80 shadow-2xl relative overflow-hidden mb-10">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Information Security &amp; Compliance</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bank-Grade Architecture Protocols • Last Updated: October 2026
                </p>
              </div>
            </div>

            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              At <b>Astitva Innovation</b>, information security is engineered into every layer of our technology stack—from zero-trust API architectures to encrypted payment routing and hardened Linux server environments.
            </p>
          </div>

          {/* Clauses Content */}
          <div className="space-y-8 text-xs md:text-sm text-muted-foreground leading-relaxed">
            
            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-mono">1</span>
                Transport Layer Security &amp; Encryption
              </h2>
              <p>
                All data transmitted to and from <b>astitvainnovation.in</b> and our B2B microservices is enforced via <b>TLS 1.3 / SSL encryption</b> with modern elliptic curve cipher suites. Strict HTTP Strict Transport Security (HSTS) headers are configured across our Nginx proxies to prevent man-in-the-middle attacks.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-mono">2</span>
                Authentication, Passwords &amp; Cryptography
              </h2>
              <p>
                All administrative access, command center credentials, and client authentication tokens are cryptographically secured:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><b>Bcrypt Password Hashing:</b> Passwords are protected using salt rounds of 12+, preventing rainbow table and brute-force compromise.</li>
                <li><b>JWT Token Lifecycles:</b> Ephemeral JSON Web Tokens with strict cryptographic secret signing and automated expiration.</li>
                <li><b>Rate Limiting &amp; DDoS Shielding:</b> Automated IP-based rate limiting on sensitive API routes prevents credential stuffing and denial of service.</li>
              </ul>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-mono">3</span>
                Server Hardening &amp; Production Isolation
              </h2>
              <p>
                Our production infrastructure hosted on dedicated Ubuntu Linux servers (IP: 217.216.58.223) utilizes hardened security practices:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Non-root execution environments with restricted process privileges.</li>
                <li>Zero-touch automated deployment pipelines with cryptographic SSH keys.</li>
                <li>Automated daily timestamped snapshots and database backups with atomic write operations.</li>
                <li>Continuous PM2 process monitoring and automatic self-healing restart triggers.</li>
              </ul>
            </section>

            <section className="p-6 rounded-2xl bg-card/50 border border-border/60 space-y-3">
              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-mono">4</span>
                Vulnerability Disclosure Program
              </h2>
              <p>
                We welcome responsible security disclosures from independent researchers. If you identify a potential security issue in any of our software systems, please email <b>security@astitvainnovation.in</b> with reproduction details.
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
              <Link to="/cookie-policy">
                Review Cookie Policy
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

export default SecurityPolicyPage;
