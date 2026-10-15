import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AiAgentWidget from "../components/AiAgentWidget";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Send, 
  Users, 
  Zap, 
  ShieldCheck, 
  Search,
  Filter,
  ExternalLink,
  Laptop,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export interface PublicJob {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  status: string;
}

const fallbackJobs: PublicJob[] = [
  {
    id: "job-fullstack-01",
    title: "Senior Full-Stack Architect (Node.js & React)",
    department: "Engineering",
    location: "Remote / Hybrid",
    type: "Full-Time",
    experience: "3 - 6 Years",
    salary: "₹12,00,000 - ₹24,00,000 LPA",
    description: "Architect, develop, and scale high-concurrency microservices, FinTech payment routing integrations, and responsive administrative web applications.",
    requirements: [
      "Deep expertise in TypeScript, Node.js, Express, and React",
      "Strong experience with Redis caching, PostgreSQL / MongoDB, and real-time WebSockets",
      "Hands-on background with Docker, Nginx reverse proxying, and cloud deployments",
      "Understanding of payment gateway lifecycles (Razorpay, Cashfree, Stripe) and webhook idempotency"
    ],
    benefits: [
      "High-ownership engineering culture",
      "Flexible remote work hours",
      "Performance equity incentives",
      "Direct collaboration with founding architects"
    ],
    status: "Active"
  },
  {
    id: "job-mobile-02",
    title: "React Native / Mobile Engineer (Audio & WebRTC)",
    department: "Mobile Engineering",
    location: "Remote",
    type: "Full-Time",
    experience: "2 - 5 Years",
    salary: "₹10,00,000 - ₹20,00,000 LPA",
    description: "Develop, optimize, and ship high-performance features for flagship voice social platform Meethi Chat, managing low-latency audio streams and native device bridges.",
    requirements: [
      "Demonstrated mastery of React Native / Android Native bridging",
      "Experience with WebRTC audio streams, InCallManager, and background socket lifecycles",
      "State management proficiency (Redux / Context / Zustand)",
      "Proven track record of deploying polished apps to Google Play Console"
    ],
    benefits: [
      "Shape social voice technology impacting thousands of daily active users",
      "Modern hardware budget & remote allowance",
      "Direct product roadmap influence"
    ],
    status: "Active"
  },
  {
    id: "job-devops-03",
    title: "DevOps & Cloud Security Specialist",
    department: "Infrastructure",
    location: "Remote",
    type: "Full-Time",
    experience: "3 - 5 Years",
    salary: "₹14,00,000 - ₹26,00,000 LPA",
    description: "Lead production cloud infrastructure, automated GitHub Actions CI/CD pipelines, SSL automation, and bank-grade application firewalls.",
    requirements: [
      "Advanced Linux server administration (Ubuntu / Debian)",
      "GitHub Actions CI/CD automation and container orchestration (Docker)",
      "Nginx virtual host security, rate limiting, and Let's Encrypt Certbot",
      "System telemetry, PM2 cluster management, and DDoS mitigation strategies"
    ],
    benefits: [
      "Ownership over high-availability infrastructure",
      "Cloud experimentation budget",
      "Autonomous engineering schedules"
    ],
    status: "Active"
  },
  {
    id: "job-uiux-04",
    title: "Lead Product & UI/UX Designer",
    department: "Design & Product",
    location: "Remote",
    type: "Full-Time",
    experience: "2 - 4 Years",
    salary: "₹8,00,000 - ₹16,00,000 LPA",
    description: "Design futuristic, ultra-polished, and intuitive user experiences for enterprise B2B panels, corporate showcases, and mobile consumer apps.",
    requirements: [
      "Mastery of Figma, modern design tokens, auto-layout, and clickable prototypes",
      "Exceptional eye for typography, glassmorphism, dark-mode aesthetics, and micro-interactions",
      "Experience collaborating directly with frontend engineers for pixel-perfect execution"
    ],
    benefits: [
      "Design-led product decisions",
      "Portfolio freedom on major releases",
      "Flexible working arrangement"
    ],
    status: "Active"
  }
];

export const CareersPage = () => {
  const [jobs, setJobs] = useState<PublicJob[]>(fallbackJobs);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<PublicJob | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    currentCompany: "",
    resumeUrl: "",
    portfolioUrl: "",
    coverNote: ""
  });

  const { toast } = useToast();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || "";
        const res = await fetch(`${apiBase}/api/jobs`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setJobs(json.data);
          }
        }
      } catch (_) {
        // Fallback already pre-set
      }
    };
    fetchJobs();
  }, []);

  const handleOpenApply = (job: PublicJob) => {
    setSelectedJob(job);
    setIsApplyModalOpen(true);
  };

  const handleOpenGeneralApply = () => {
    setSelectedJob({
      id: "general",
      title: "General Engineering & Architecture Application",
      department: "All Engineering",
      location: "Remote",
      type: "Full-Time",
      experience: "Flexible",
      salary: "Competitive",
      description: "Submit your credentials directly to our founding architects for upcoming positions.",
      requirements: [],
      benefits: [],
      status: "Active"
    });
    setIsApplyModalOpen(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please provide your name, email, and contact number.",
        variant: "destructive"
      });
      return;
    }

    if (!form.resumeUrl.trim()) {
      toast({
        title: "Resume Required",
        description: "Please share a public link to your resume (Google Drive, LinkedIn, or Dropbox).",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiBase}/api/jobs/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          jobId: selectedJob?.id || "general",
          ...form
        })
      });

      const json = await res.json();
      if (json.success) {
        toast({
          title: "Application Received 🎉",
          description: "Our talent acquisition squad and founders will review your profile and reach out shortly."
        });
        setIsApplyModalOpen(false);
        setForm({
          name: "",
          email: "",
          phone: "",
          experience: "",
          currentCompany: "",
          resumeUrl: "",
          portfolioUrl: "",
          coverNote: ""
        });
      } else {
        toast({
          title: "Submission Issue",
          description: json.error || "Unable to submit application. Please try again.",
          variant: "destructive"
        });
      }
    } catch (e) {
      toast({
        title: "Submission Error",
        description: "Network connection error. You can also email your CV to contact@astitvainnovation.in.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch = 
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase()) ||
      j.description.toLowerCase().includes(search.toLowerCase());
    const matchesDept = departmentFilter === "all" || j.department.toLowerCase().includes(departmentFilter.toLowerCase());
    return matchesSearch && matchesDept;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Top Breadcrumb */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Homepage
            </Link>
            <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
              We Are Actively Hiring Engineers
            </Badge>
          </div>

          {/* Hero Banner */}
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-card via-card/80 to-background border border-border/80 shadow-2xl relative overflow-hidden mb-12 text-center md:text-left">
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
            
            <Badge 
              variant="outline" 
              className="px-3.5 py-1 mb-4 text-xs font-semibold tracking-wider uppercase border-primary/40 bg-primary/10 text-primary"
            >
              Careers at Astitva Innovation
            </Badge>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              Build Next-Gen <span className="bg-gradient-primary bg-clip-text text-transparent">Voice &amp; FinTech</span> Systems
            </h1>

            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              We engineer ultra-low latency WebRTC audio platforms (like Meethi Chat), high-scale FinTech transaction engines, and bank-grade SaaS architectures. Join an elite squad of problem solvers with high autonomy and competitive compensation.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6 pt-6 border-t border-border/60 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Laptop className="w-4 h-4 text-primary" />
                <span>100% Remote-First Culture</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="w-4 h-4 text-accent" />
                <span>Zero Bureaucracy, High Ownership</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Competitive Salary &amp; Performance Bonuses</span>
              </div>
            </div>
          </div>

          {/* Culture Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 bg-card/50 border-border/70 backdrop-blur space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Extreme Engineering Autonomy</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Work on production architectures handling real users. Make architectural decisions, deploy with CI/CD, and collaborate directly with founders without corporate red tape.
              </p>
            </Card>

            <Card className="p-6 bg-card/50 border-border/70 backdrop-blur space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Top-Tier Market Compensation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We believe exceptional engineers should be compensated exceptionally. Competitive base salaries with clear milestones, performance incentives, and hardware allowances.
              </p>
            </Card>

            <Card className="p-6 bg-card/50 border-border/70 backdrop-blur space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Cutting-Edge Tech Stack</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Work with WebRTC, React Native, Node.js microservices, Redis caching, Docker, Nginx, and modern TypeScript ecosystems on real distributed systems.
              </p>
            </Card>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-card/40 p-4 rounded-2xl border border-border/70">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
              <Input
                placeholder="Search open positions by title or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 text-xs bg-background/80"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="h-10 px-3 text-xs bg-background border border-border/80 rounded-lg text-foreground focus:outline-none w-full sm:w-auto"
              >
                <option value="all">All Departments ({jobs.length})</option>
                <option value="Engineering">Engineering</option>
                <option value="Mobile">Mobile Engineering</option>
                <option value="Infrastructure">Infrastructure & Cloud</option>
                <option value="Design">Design & Product</option>
              </select>

              <Button onClick={handleOpenGeneralApply} variant="outline" className="text-xs h-10 shrink-0">
                General Application
              </Button>
            </div>
          </div>

          {/* Job Listings Grid */}
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="p-6 bg-card/60 backdrop-blur border-border/70 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/30 text-primary">
                        {job.department}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-mono">
                        {job.type}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] bg-accent/10 border-accent/30 text-accent font-mono">
                        {job.location}
                      </Badge>
                    </div>

                    <h3 className="text-lg md:text-xl font-bold text-foreground">
                      {job.title}
                    </h3>

                    <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-accent" />
                        <span>Experience: <b className="text-foreground">{job.experience}</b></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-mono text-emerald-400 font-bold">{job.salary}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Button
                      onClick={() => handleOpenApply(job)}
                      className="bg-primary hover:bg-primary/90 text-white text-xs px-5 shadow-lg shadow-primary/20"
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Apply for Position
                    </Button>
                  </div>
                </div>

                {job.requirements && job.requirements.length > 0 && (
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Core Technical Requirements:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.requirements.map((req, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-background/80 border border-border/60 text-muted-foreground"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}

            {filteredJobs.length === 0 && (
              <div className="text-center py-16 border border-dashed border-border/70 rounded-2xl">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                <h3 className="text-base font-bold">No active positions match your query</h3>
                <p className="text-xs text-muted-foreground mb-4 max-w-md mx-auto">
                  We are always on the lookout for world-class talent in backend, WebRTC, and full-stack engineering.
                </p>
                <Button onClick={handleOpenGeneralApply} size="sm">
                  Submit a General Application
                </Button>
              </div>
            )}
          </div>

          {/* Bottom Career Help Callout */}
          <div className="mt-16 p-8 rounded-3xl bg-card/40 border border-border/70 text-center space-y-3">
            <h3 className="text-base md:text-lg font-bold text-foreground">
              Have Questions About Engineering at Astitva Innovation?
            </h3>
            <p className="text-xs text-muted-foreground max-w-lg mx-auto">
              Reach our talent acquisition team directly at <a href="mailto:contact@astitvainnovation.in" className="text-primary underline">contact@astitvainnovation.in</a> or message our direct engineering desk on WhatsApp at <a href="https://wa.me/917233882089" className="text-emerald-400 font-mono underline">+91 7233882089</a>.
            </p>
          </div>

        </div>
      </main>

      {/* APPLICATION MODAL */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="max-w-xl bg-card border-border/80 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Apply for {selectedJob?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Department: {selectedJob?.department} • Location: {selectedJob?.location} ({selectedJob?.type})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitApplication} className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-foreground block mb-1">Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-background text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Email Address *</label>
                <Input
                  required
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-background text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-foreground block mb-1">Phone / WhatsApp Number *</label>
                <Input
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Total Experience (Years)</label>
                <Input
                  placeholder="e.g. 3.5 Years"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  className="bg-background text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Current Organization / Notice Period</label>
              <Input
                placeholder="e.g. ABC Technologies • 30 Days Notice"
                value={form.currentCompany}
                onChange={(e) => setForm({ ...form, currentCompany: e.target.value })}
                className="bg-background text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Resume Link (Google Drive / Dropbox / LinkedIn URL) *</label>
              <Input
                required
                placeholder="https://drive.google.com/file/d/your-resume/view"
                value={form.resumeUrl}
                onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
                className="bg-background text-xs"
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Ensure access is set to 'Anyone with the link can view'.
              </p>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">GitHub / Portfolio / Project Links</label>
              <Input
                placeholder="https://github.com/your-username"
                value={form.portfolioUrl}
                onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                className="bg-background text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Why Astitva Innovation? (Brief Cover Note)</label>
              <textarea
                placeholder="Tell us about complex problems you have solved, your tech stack mastery, or what excites you about building high-scale voice & fintech platforms..."
                rows={3}
                value={form.coverNote}
                onChange={(e) => setForm({ ...form, coverNote: e.target.value })}
                className="w-full p-2.5 rounded-md bg-background border border-border/80 text-xs text-foreground focus:outline-none resize-none"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsApplyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-primary text-white">
                {isSubmitting ? "Submitting Application..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
      <AiAgentWidget />
    </div>
  );
};

export default CareersPage;
