import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Users, 
  CheckCircle2, 
  Clock, 
  FileText, 
  MapPin, 
  DollarSign, 
  Award, 
  Search,
  Filter,
  UserCheck,
  XCircle,
  MessageSquare,
  Sparkles,
  Phone,
  Mail,
  Building
} from "lucide-react";
import { careersService, JobItem, JobApplicationItem } from "../services/careersService";

export const CareersPage = () => {
  const [activeTab, setActiveTab] = useState<"jobs" | "candidates">("jobs");
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [applications, setApplications] = useState<JobApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Search & filter state
  const [jobSearch, setJobSearch] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [selectedJobFilter, setSelectedJobFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");

  // Job Modal state
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobItem | null>(null);
  const [jobForm, setJobForm] = useState({
    title: "",
    department: "Engineering",
    location: "Remote / Hybrid",
    type: "Full-Time",
    experience: "3 - 5 Years",
    salary: "₹12,00,000 - ₹20,00,000 LPA",
    description: "",
    requirements: "TypeScript, Node.js, Express\nReact, WebSockets, Redis\nCloud DevOps, Docker, Nginx",
    benefits: "High ownership engineering\nFlexible remote culture\nPerformance equity bonuses"
  });

  // Candidate Details / Notes Modal state
  const [selectedCandidate, setSelectedCandidate] = useState<JobApplicationItem | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [adminNotesText, setAdminNotesText] = useState("");

  const { toast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    const [jobsData, appsData] = await Promise.all([
      careersService.getAdminJobs(),
      careersService.getApplications()
    ]);
    setJobs(jobsData);
    setApplications(appsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Job Handlers
  const handleOpenAddJob = () => {
    setEditingJob(null);
    setJobForm({
      title: "",
      department: "Engineering",
      location: "Remote / Hybrid",
      type: "Full-Time",
      experience: "2 - 5 Years",
      salary: "₹10,00,000 - ₹18,00,000 LPA",
      description: "",
      requirements: "TypeScript & React / Node.js\nSystem Design & Scalable Architecture\nGit, CI/CD, and REST APIs",
      benefits: "Remote Flexibility\nCompetitive Compensation\nDirect Founder Collaboration"
    });
    setIsJobModalOpen(true);
  };

  const handleOpenEditJob = (job: JobItem) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      experience: job.experience,
      salary: job.salary,
      description: job.description,
      requirements: Array.isArray(job.requirements) ? job.requirements.join("\n") : "",
      benefits: Array.isArray(job.benefits) ? job.benefits.join("\n") : ""
    });
    setIsJobModalOpen(true);
  };

  const handleSaveJob = async () => {
    if (!jobForm.title.trim()) {
      toast({ title: "Validation Error", description: "Job title is required.", variant: "destructive" });
      return;
    }

    const payload = {
      title: jobForm.title,
      department: jobForm.department,
      location: jobForm.location,
      type: jobForm.type,
      experience: jobForm.experience,
      salary: jobForm.salary,
      description: jobForm.description,
      requirements: jobForm.requirements.split("\n").map(s => s.trim()).filter(Boolean),
      benefits: jobForm.benefits.split("\n").map(s => s.trim()).filter(Boolean)
    };

    if (editingJob) {
      const res = await careersService.updateJob(editingJob.id, payload);
      if (res.success) {
        toast({ title: "Position Updated", description: `${jobForm.title} updated successfully.` });
        setIsJobModalOpen(false);
        loadData();
      } else {
        toast({ title: "Error", description: res.error || "Failed to update job", variant: "destructive" });
      }
    } else {
      const res = await careersService.createJob(payload);
      if (res.success) {
        toast({ title: "Job Posted", description: `${jobForm.title} is now open for applications.` });
        setIsJobModalOpen(false);
        loadData();
      } else {
        toast({ title: "Error", description: res.error || "Failed to post job", variant: "destructive" });
      }
    }
  };

  const handleToggleJob = async (job: JobItem) => {
    const res = await careersService.toggleJobStatus(job.id);
    if (res.success) {
      toast({ 
        title: `Job ${res.data?.status === "Active" ? "Activated" : "Closed"}`, 
        description: `${job.title} status toggled.` 
      });
      loadData();
    }
  };

  const handleDeleteJob = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the job posting "${title}"?`)) return;
    const res = await careersService.deleteJob(id);
    if (res.success) {
      toast({ title: "Job Deleted", description: "The posting has been removed." });
      loadData();
    }
  };

  // Candidate Handlers
  const handleUpdateCandidateStatus = async (id: string, status: string) => {
    const res = await careersService.updateApplicationStatus(id, status);
    if (res.success) {
      toast({ 
        title: `Status: ${status}`, 
        description: `Candidate status updated to ${status}.` 
      });
      loadData();
    }
  };

  const handleOpenNotes = (candidate: JobApplicationItem) => {
    setSelectedCandidate(candidate);
    setAdminNotesText(candidate.adminNotes || "");
    setIsNotesModalOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedCandidate) return;
    const res = await careersService.updateApplicationStatus(selectedCandidate.id, selectedCandidate.status, adminNotesText);
    if (res.success) {
      toast({ title: "Notes Saved", description: "Admin evaluation notes updated." });
      setIsNotesModalOpen(false);
      loadData();
    }
  };

  const handleDeleteCandidate = async (id: string, name: string) => {
    if (!confirm(`Delete application for ${name}?`)) return;
    const res = await careersService.deleteApplication(id);
    if (res.success) {
      toast({ title: "Application Removed", description: "Candidate record deleted." });
      loadData();
    }
  };

  // Filtered lists
  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.department.toLowerCase().includes(jobSearch.toLowerCase())
  );

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      app.email.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(candidateSearch.toLowerCase());
    const matchesJob = selectedJobFilter === "all" || app.jobId === selectedJobFilter;
    const matchesStatus = selectedStatusFilter === "All" || app.status === selectedStatusFilter;
    return matchesSearch && matchesJob && matchesStatus;
  });

  const activeJobsCount = jobs.filter(j => j.status === "Active").length;
  const hiredCount = applications.filter(a => a.status === "Hired").length;
  const inReviewCount = applications.filter(a => a.status === "Under Review" || a.status === "Shortlisted").length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold tracking-tight">Careers &amp; Talent Command Center</h1>
            <Badge className="bg-primary/20 text-primary border-primary/40 font-mono text-[10px]">
              ATS Portal
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Manage open job listings, review applicant credentials, and hire software engineering talent.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "jobs" ? (
            <Button onClick={handleOpenAddJob} className="bg-primary hover:bg-primary/90 text-white text-xs h-9 shadow-md shadow-primary/20">
              <Plus className="w-4 h-4 mr-1.5" />
              Post New Position
            </Button>
          ) : (
            <Button onClick={() => setActiveTab("jobs")} variant="outline" className="text-xs h-9">
              <Briefcase className="w-4 h-4 mr-1.5" />
              View Open Roles
            </Button>
          )}
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/60 backdrop-blur border-border/70 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Open Positions</p>
            <p className="text-xl font-extrabold">{jobs.length}</p>
          </div>
        </Card>

        <Card className="p-4 bg-card/60 backdrop-blur border-border/70 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Active Listings</p>
            <p className="text-xl font-extrabold text-emerald-400">{activeJobsCount}</p>
          </div>
        </Card>

        <Card className="p-4 bg-card/60 backdrop-blur border-border/70 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Total Applicants</p>
            <p className="text-xl font-extrabold">{applications.length}</p>
          </div>
        </Card>

        <Card className="p-4 bg-card/60 backdrop-blur border-border/70 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Hired Engineers</p>
            <p className="text-xl font-extrabold text-indigo-400">{hiredCount}</p>
          </div>
        </Card>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-1">
        <button
          onClick={() => setActiveTab("jobs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "jobs"
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-card/70"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Open Positions ({jobs.length})
        </button>

        <button
          onClick={() => setActiveTab("candidates")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "candidates"
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-card/70"
          }`}
        >
          <Users className="w-4 h-4" />
          Applicants &amp; Candidates ({applications.length})
          {inReviewCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-accent/20 text-accent font-mono">
              {inReviewCount} In Review
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: OPEN POSITIONS */}
      {activeTab === "jobs" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search job title or department..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                className="pl-9 h-9 text-xs bg-card/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="p-5 bg-card/70 border-border/80 backdrop-blur flex flex-col justify-between hover:border-primary/40 transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/30 text-primary">
                          {job.department}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] font-mono ${
                          job.status === "Active" 
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" 
                            : "border-muted bg-muted/20 text-muted-foreground"
                        }`}>
                          {job.status}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-base text-foreground">{job.title}</h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEditJob(job)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        title="Edit Job Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {job.description || "No description provided."}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-accent" />
                      <span>{job.location} ({job.type})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      <span>Exp: {job.experience}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-mono font-medium text-foreground">{job.salary}</span>
                    </div>
                  </div>

                  {job.requirements && job.requirements.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Key Requirements:</p>
                      <div className="flex flex-wrap gap-1">
                        {job.requirements.slice(0, 3).map((req, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-background border border-border/60 text-muted-foreground">
                            {req}
                          </span>
                        ))}
                        {job.requirements.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">
                            +{job.requirements.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span><b>{job.applicantCount || 0}</b> Applicants</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleJob(job)}
                      className={`text-xs h-7 px-2.5 ${job.status === "Active" ? "hover:border-destructive/40 text-muted-foreground" : "text-emerald-400 hover:border-emerald-500/40"}`}
                    >
                      {job.status === "Active" ? "Close Role" : "Re-open"}
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedJobFilter(job.id);
                        setActiveTab("candidates");
                      }}
                      className="text-xs h-7 px-2.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                    >
                      View Candidates
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {filteredJobs.length === 0 && (
              <div className="col-span-2 text-center py-12 border border-dashed border-border/70 rounded-2xl">
                <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">No open positions found</p>
                <p className="text-xs text-muted-foreground mb-4">Post a new position to attract software engineering talent.</p>
                <Button onClick={handleOpenAddJob} size="sm">Post Position</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CANDIDATES / APPLICANTS */}
      {activeTab === "candidates" && (
        <div className="space-y-4">
          
          {/* Candidate Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/40 p-3 rounded-2xl border border-border/60">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search candidate, email, role..."
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                className="pl-9 h-9 text-xs bg-background/80"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-background border border-border/80 rounded-lg text-foreground focus:outline-none"
              >
                <option value="all">All Jobs</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-background border border-border/80 rounded-lg text-foreground focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview Scheduled">Interview Scheduled</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Candidate Cards Grid */}
          <div className="space-y-3">
            {filteredApplications.map((candidate) => (
              <Card key={candidate.id} className="p-4 bg-card/70 border-border/80 backdrop-blur hover:border-border transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Candidate Info */}
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] text-muted-foreground">{candidate.id}</span>
                      <h4 className="text-sm font-bold text-foreground">{candidate.name}</h4>
                      <Badge className={`text-[10px] font-mono ${
                        candidate.status === "Hired" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" :
                        candidate.status === "Shortlisted" ? "bg-primary/20 text-primary border-primary/40" :
                        candidate.status === "Interview Scheduled" ? "bg-accent/20 text-accent border-accent/40" :
                        candidate.status === "Rejected" ? "bg-destructive/20 text-destructive border-destructive/40" :
                        "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      }`}>
                        {candidate.status}
                      </Badge>
                    </div>

                    <div className="text-xs text-foreground/90 font-medium flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-primary" />
                      <span>Applied for: <b>{candidate.jobTitle}</b></span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <a href={`mailto:${candidate.email}`} className="hover:text-primary hover:underline">{candidate.email}</a>
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <a href={`tel:${candidate.phone}`} className="hover:text-primary font-mono">{candidate.phone}</a>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-accent" />
                        <span>Exp: {candidate.experience}</span>
                      </span>
                      {candidate.currentCompany && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          <span>{candidate.currentCompany}</span>
                        </span>
                      )}
                    </div>

                    {candidate.coverNote && (
                      <p className="text-xs text-muted-foreground bg-background/50 p-2.5 rounded-lg border border-border/50 italic line-clamp-2">
                        "{candidate.coverNote}"
                      </p>
                    )}

                    {candidate.adminNotes && (
                      <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3 shrink-0" />
                        <span><b>Evaluation Note:</b> {candidate.adminNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Links */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2.5 shrink-0">
                    <div className="flex items-center gap-2">
                      {candidate.resumeUrl && (
                        <a
                          href={candidate.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Resume
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      )}

                      {candidate.portfolioUrl && (
                        <a
                          href={candidate.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent/20 hover:bg-accent/30 text-accent border border-accent/40 transition-colors"
                        >
                          Portfolio
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      )}
                    </div>

                    {/* Status Changer & Evaluation */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <select
                        value={candidate.status}
                        onChange={(e) => handleUpdateCandidateStatus(candidate.id, e.target.value)}
                        className="h-8 px-2.5 text-xs bg-background border border-border/80 rounded-lg text-foreground focus:outline-none"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="Hired">Hired 🎉</option>
                        <option value="Rejected">Rejected</option>
                      </select>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenNotes(candidate)}
                        className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground"
                        title="Add/Edit Evaluation Notes"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </Button>

                      {candidate.status !== "Hired" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateCandidateStatus(candidate.id, "Hired")}
                          className="text-xs h-8 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1" />
                          Hire Candidate
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCandidate(candidate.id, candidate.name)}
                        className="text-xs h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        title="Delete Application"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <span className="text-[10px] text-muted-foreground font-mono">
                      Applied: {new Date(candidate.appliedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                </div>
              </Card>
            ))}

            {filteredApplications.length === 0 && (
              <div className="text-center py-12 border border-dashed border-border/70 rounded-2xl">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">No candidates match your criteria</p>
                <p className="text-xs text-muted-foreground">Candidate submissions via the public /careers page will appear here instantly.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT JOB MODAL */}
      <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
        <DialogContent className="max-w-2xl bg-card border-border/80 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              {editingJob ? "Edit Job Posting" : "Post New Career Opportunity"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-foreground block mb-1">Job Title *</label>
                <Input
                  placeholder="e.g. Senior Full-Stack Engineer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="bg-background text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Department *</label>
                <select
                  value={jobForm.department}
                  onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                  className="w-full h-10 px-3 bg-background border border-border/80 rounded-md text-xs text-foreground focus:outline-none"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Mobile Engineering">Mobile Engineering</option>
                  <option value="Infrastructure">Infrastructure & Cloud</option>
                  <option value="Design & Product">Design & Product</option>
                  <option value="FinTech Operations">FinTech Operations</option>
                  <option value="QA & Testing">QA & Testing</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-foreground block mb-1">Location</label>
                <Input
                  placeholder="e.g. Remote / Hybrid"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  className="bg-background text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Employment Type</label>
                <select
                  value={jobForm.type}
                  onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                  className="w-full h-10 px-3 bg-background border border-border/80 rounded-md text-xs text-foreground focus:outline-none"
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Experience</label>
                <Input
                  placeholder="e.g. 3 - 5 Years"
                  value={jobForm.experience}
                  onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                  className="bg-background text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Salary Range / Compensation</label>
              <Input
                placeholder="e.g. ₹12,00,000 - ₹24,00,000 LPA"
                value={jobForm.salary}
                onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                className="bg-background text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Role Description</label>
              <textarea
                placeholder="Overview of the position, scope, and objectives..."
                rows={3}
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                className="w-full p-2.5 rounded-md bg-background border border-border/80 text-xs text-foreground focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Key Requirements (One per line)</label>
              <textarea
                placeholder="TypeScript, Node.js, Express&#10;Redis caching, WebSockets&#10;Microservices & Docker"
                rows={3}
                value={jobForm.requirements}
                onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                className="w-full p-2.5 rounded-md bg-background border border-border/80 text-xs text-foreground focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Perks &amp; Benefits (One per line)</label>
              <textarea
                placeholder="High ownership engineering culture&#10;Remote work flexibility&#10;Performance equity bonuses"
                rows={3}
                value={jobForm.benefits}
                onChange={(e) => setJobForm({ ...jobForm, benefits: e.target.value })}
                className="w-full p-2.5 rounded-md bg-background border border-border/80 text-xs text-foreground focus:outline-none resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsJobModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveJob} className="bg-primary text-white">
              {editingJob ? "Save Changes" : "Publish Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EVALUATION NOTES MODAL */}
      <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
        <DialogContent className="max-w-md bg-card border-border/80">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Candidate Evaluation Notes
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">
              Candidate: <b className="text-foreground">{selectedCandidate?.name}</b> ({selectedCandidate?.jobTitle})
            </p>

            <div>
              <label className="font-bold text-foreground block mb-1">Internal Notes &amp; Recommendations</label>
              <textarea
                placeholder="e.g. Candidate solved WebRTC audio latency challenge well. Proceed to CEO discussion."
                rows={4}
                value={adminNotesText}
                onChange={(e) => setAdminNotesText(e.target.value)}
                className="w-full p-2.5 rounded-md bg-background border border-border/80 text-xs text-foreground focus:outline-none resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsNotesModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveNotes} className="bg-primary text-white">
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default CareersPage;
