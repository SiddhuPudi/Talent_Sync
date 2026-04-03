import { useEffect, useState, useMemo, useCallback } from "react";
import { getJobs, createJob } from "../features/jobs/jobService";
import { applyToJob, getMyApplications, getMyProfile } from "../services/applicationService";
import { useAuth } from "../store/AuthContext";
import { useDebounce } from "../hooks/useDebounce";

function formatSalary(salary) {
  if (!salary) return "Not Disclosed";
  return `₹${Number(salary).toLocaleString("en-IN")}`;
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-5 right-5 z-[300] px-5 py-3 rounded-2xl shadow-2xl border animate-slide-down flex items-center gap-3 font-medium text-sm backdrop-blur-xl ${toast.type === "success"
        ? "bg-green-500/20 border-green-500/40 text-green-300"
        : "bg-red-500/20 border-red-500/40 text-red-300"
        }`}
    >
      <span className="text-lg">{toast.type === "success" ? "✅" : "❌"}</span>
      <span>{toast.message}</span>
    </div>
  );
}

function JobDetailModal({ job, isApplied, onClose, onOpenApply }) {
  useEffect(() => {
    const handle = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onClose]);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl bg-surface border border-white/10 rounded-3xl shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between p-6 pb-4 border-b border-white/5 shrink-0">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-textMain leading-tight mb-1">
              {job.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="badge badge-primary text-sm px-3 py-1">
                {job.company}
              </span>
              <span className="text-textSoft text-sm flex items-center gap-1">
                📍 {job.location}
              </span>
              {job.createdAt && (
                <span className="text-textSoft/60 text-xs">
                  🕐 {timeAgo(job.createdAt)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-icon shrink-0 text-xl"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg/60 rounded-2xl p-4 border border-white/5">
              <p className="text-xs text-textSoft/60 uppercase tracking-widest mb-1 font-medium">
                Salary
              </p>
              <p className="text-lg font-bold text-accent flex items-center gap-1.5">
                💰 {formatSalary(job.salary)}
              </p>
            </div>
            <div className="bg-bg/60 rounded-2xl p-4 border border-white/5">
              <p className="text-xs text-textSoft/60 uppercase tracking-widest mb-1 font-medium">
                Location
              </p>
              <p className="text-lg font-bold text-textMain flex items-center gap-1.5">
                📍 {job.location}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-textSoft/70 uppercase tracking-widest mb-3">
              Job Description
            </h3>
            <div className="text-textSoft leading-relaxed whitespace-pre-wrap text-sm bg-bg/40 rounded-2xl p-4 border border-white/5">
              {job.description || "No description provided."}
            </div>
          </div>
        </div>
        <div className="p-6 pt-4 border-t border-white/5 shrink-0 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Close
          </button>
          {isApplied ? (
            <button
              disabled
              className="flex-1 py-2.5 rounded-xl font-semibold bg-green-500/20 border border-green-500/30 text-green-400 cursor-not-allowed flex items-center justify-center gap-2"
            >
              ✅ Already Applied
            </button>
          ) : (
            <button
              onClick={() => { onClose(); onOpenApply(job); }}
              className="btn-primary flex-1"
            >
              Apply Now 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ApplyModal({ job, onClose, onSuccess }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", resume: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  useEffect(() => {
    const handle = (e) => e.key === "Escape" && !isSubmitting && onClose();
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onClose, isSubmitting]);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  useEffect(() => {
    (async () => {
      try {
        const profile = await getMyProfile();
        setForm((f) => ({
          ...f,
          fullName: profile?.name || profile?.fullName || user?.name || "",
          email: profile?.email || user?.email || "",
        }));
      } catch {
        setForm((f) => ({
          ...f,
          fullName: user?.name || "",
          email: user?.email || "",
        }));
      } finally {
        setProfileLoading(false);
      }
    })();
  }, [user]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.resume.trim()) return;
    setIsSubmitting(true);
    try {
      await applyToJob(job.id, form.resume.trim());
      setIsDone(true);
      setTimeout(() => {
        onSuccess(job.id);
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
      alert("Failed to apply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={() => !isSubmitting && onClose()}
      />
      <div className="relative z-10 w-full max-w-lg bg-surface border border-white/10 rounded-3xl shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-textMain">Apply for Position</h2>
            <p className="text-textSoft/70 text-sm mt-0.5">
              {job.title} · <span className="text-primaryHover">{job.company}</span>
            </p>
          </div>
          <button
            onClick={() => !isSubmitting && onClose()}
            className="btn-icon"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          {isDone ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4 animate-scale-in">
              <div className="text-6xl animate-bounce">🎉</div>
              <h3 className="text-xl font-bold text-green-400">Applied Successfully!</h3>
              <p className="text-textSoft text-sm text-center">
                Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been submitted.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-textSoft mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  className="input-field disabled:opacity-60"
                  value={profileLoading ? "" : form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder={profileLoading ? "Loading..." : "Your full name"}
                  disabled={profileLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textSoft mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  className="input-field disabled:opacity-60"
                  value={profileLoading ? "" : form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={profileLoading ? "Loading..." : "you@example.com"}
                  disabled={profileLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textSoft mb-1.5">
                  Resume Link <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  className="input-field"
                  value={form.resume}
                  onChange={(e) => setForm({ ...form, resume: e.target.value })}
                  placeholder="https://drive.google.com/your-resume"
                />
                <p className="text-xs text-textSoft/50 mt-1">
                  Paste a public link to your resume (Google Drive, Dropbox, etc.)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-textSoft mb-1.5">
                  Cover Letter{" "}
                  <span className="text-textSoft/40 font-normal">(optional)</span>
                </label>
                <textarea
                  className="input-field min-h-[90px] resize-y"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell the recruiter why you're a great fit..."
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !form.resume.trim()}
                  className="btn-primary flex-1"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Application 🚀"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, isApplied, justApplied, isApplying, onViewDetails, onApply }) {
  return (
    <div
      className="card flex flex-col justify-between group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover hover:-translate-y-1 hover:border-white/15"
      onClick={() => onViewDetails(job)}
    >
      <div>
        <h2 className="text-lg font-bold text-textMain leading-tight group-hover:text-primaryHover transition-colors mb-3">
          {job.title}
        </h2>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="badge badge-primary">{job.company}</span>
          <span className="text-sm text-textSoft flex items-center gap-1 opacity-80">
            📍 {job.location}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mb-3">
          <span
            className={`text-sm font-semibold flex items-center gap-1 ${job.salary ? "text-accent" : "text-textSoft/50"
              }`}
          >
            💰 {formatSalary(job.salary)}
          </span>
        </div>
        <p className="text-sm text-textSoft line-clamp-2 mb-5 leading-relaxed">
          {job.description}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onViewDetails(job); }}
          className="btn-secondary flex-1 text-sm py-2"
        >
          View Details
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); if (!isApplied) onApply(job); }}
          disabled={isApplied || isApplying}
          className={`flex-1 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 text-sm ${isApplied
            ? "bg-green-500/20 border border-green-500/30 text-green-400 cursor-not-allowed"
            : isApplying
              ? "bg-primary/60 text-white cursor-wait"
              : "bg-primary hover:bg-primaryHover text-white shadow-md hover:shadow-glow-primary active:scale-95"
            }`}
        >
          {isApplied ? (
            <><span className={justApplied ? "animate-bounce" : ""}>✅</span> Applied</>
          ) : isApplying ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Applying...</>
          ) : (
            "Apply Now"
          )}
        </button>
      </div>
    </div>
  );
}

function Jobs() {
  const { user } = useAuth();
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [successJobId, setSuccessJobId] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Post Job Modal
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [jobForm, setJobForm] = useState({ title: "", company: "", location: "", description: "", salary: "" });
  const [isPosting, setIsPosting] = useState(false);

  // Job Detail Modal
  const [selectedJob, setSelectedJob] = useState(null);

  // Apply Form Modal
  const [applyJob, setApplyJob] = useState(null);

  const isVerified = user?.isVerified ?? true;

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await getJobs();
      setAllJobs(data.jobs || data || []);
    } catch {
      showToast("Failed to load jobs.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const data = await getMyApplications();
      setAppliedJobs(data.map((app) => app.jobId));
    } catch {
      // silent
    }
  };

  // Called by ApplyModal on success
  const handleApplySuccess = useCallback((jobId) => {
    setAppliedJobs((prev) => [...prev, jobId]);
    setSuccessJobId(jobId);
    showToast("🎉 Application submitted successfully!", "success");
    setTimeout(() => setSuccessJobId(null), 2500);
  }, [showToast]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.company || !jobForm.location || !jobForm.description) {
      showToast("Please fill all required fields.", "error");
      return;
    }
    setIsPosting(true);
    try {
      const payload = {
        ...jobForm,
        salary: jobForm.salary !== "" ? Number(jobForm.salary) : null,
      };
      const newJob = await createJob(payload);
      setAllJobs((prev) => [newJob, ...prev]);
      setIsPostModalOpen(false);
      setJobForm({ title: "", company: "", location: "", description: "", salary: "" });
      showToast("Job posted successfully!", "success");
    } catch {
      showToast("Error posting job. Please try again.", "error");
    } finally {
      setIsPosting(false);
    }
  };

  const filteredJobs = useMemo(() => {
    let result = [...allJobs];
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      result = result.filter(
        (job) =>
          job.title?.toLowerCase().includes(term) ||
          job.company?.toLowerCase().includes(term) ||
          job.location?.toLowerCase().includes(term)
      );
    }
    if (locationFilter) {
      result = result.filter((job) =>
        job.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    result.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });
    return result;
  }, [allJobs, debouncedSearchTerm, locationFilter, sortBy]);

  const uniqueLocations = useMemo(() => {
    const locs = allJobs.map((j) => j.location).filter(Boolean);
    return [...new Set(locs)];
  }, [allJobs]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans pb-10">
      <Toast toast={toast} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text inline-block">Explore Jobs</h1>
          <p className="text-textSoft text-sm mt-1">
            {loading ? "" : `${filteredJobs.length} ${filteredJobs.length === 1 ? "position" : "positions"} available`}
          </p>
        </div>

        <div className="relative group inline-block w-full md:w-auto">
          <button
            onClick={() => isVerified && setIsPostModalOpen(true)}
            disabled={!isVerified}
            className={`btn-primary shadow-lg w-full md:w-auto ${!isVerified ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className="text-lg leading-none">+</span> Post a Job
          </button>
          {!isVerified && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 glass text-white text-xs text-center p-2 rounded-lg shadow-xl z-50">
              Only verified users can post jobs.
            </div>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card sticky top-[60px] z-40 p-4 md:p-5 shadow-xl border-white/5 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textSoft/60">🔍</span>
          <input
            type="text"
            placeholder="Search by title, company, or location..."
            className="input-field pl-10 bg-bg/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select
            className="input-field bg-bg/50 flex-1 md:w-40 appearance-none cursor-pointer"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">All Locations</option>
            {uniqueLocations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <select
            className="input-field bg-bg/50 flex-1 md:w-40 appearance-none cursor-pointer"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Job Listings */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card flex flex-col gap-4">
              <div className="skeleton h-6 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-4 w-2/5" />
              <div className="skeleton h-14 w-full mt-2" />
              <div className="skeleton h-10 w-full mt-4 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="card text-center py-20 flex flex-col items-center justify-center gap-4 border-dashed border-2 border-white/10 bg-transparent">
          <span className="text-6xl opacity-40 drop-shadow-lg">📡</span>
          <h3 className="text-2xl font-bold text-textMain mt-2">No results found</h3>
          <p className="text-textSoft text-lg">Try adjusting your filters or search query.</p>
          {(searchTerm || locationFilter) && (
            <button
              onClick={() => { setSearchTerm(""); setLocationFilter(""); }}
              className="btn-secondary mt-2"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isApplied={appliedJobs.includes(job.id)}
              justApplied={successJobId === job.id}
              isApplying={applyingId === job.id}
              onViewDetails={setSelectedJob}
              onApply={setApplyJob}
            />
          ))}
        </div>
      )}

      {/* ── Job Detail Modal ── */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          isApplied={appliedJobs.includes(selectedJob.id)}
          onClose={() => setSelectedJob(null)}
          onOpenApply={(job) => setApplyJob(job)}
        />
      )}

      {/* ── Apply Form Modal ── */}
      {applyJob && (
        <ApplyModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onSuccess={handleApplySuccess}
        />
      )}

      {/* ── Post Job Modal ── */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !isPosting && setIsPostModalOpen(false)}
          />
          <div className="card w-full max-w-lg relative z-10 animate-slide-up bg-surface border-white/10 shadow-2xl rounded-3xl">
            <button
              onClick={() => !isPosting && setIsPostModalOpen(false)}
              className="absolute top-4 right-4 btn-icon"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-textMain mb-1">Post a New Job</h2>
            <p className="text-textSoft text-sm mb-6">Fill in the details to list a new position.</p>

            <form onSubmit={handlePostJob} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-textSoft mb-1.5">Job Title *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textSoft mb-1.5">Company *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="Company Name"
                    value={jobForm.company}
                    onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textSoft mb-1.5">Location *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Remote, NY"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-textSoft mb-1.5">
                  Salary (₹) <span className="text-textSoft/40 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent font-semibold text-sm pointer-events-none">₹</span>
                  <input
                    type="number"
                    min="0"
                    className="input-field pl-8"
                    placeholder="e.g. 600000"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                  />
                </div>
                <p className="text-xs text-textSoft/40 mt-1">Leave blank to show "Not Disclosed"</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-textSoft mb-1.5">Description *</label>
                <textarea
                  required
                  className="input-field min-h-[120px] resize-y"
                  placeholder="Describe the role and responsibilities..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  disabled={isPosting}
                  className="btn-secondary w-full"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isPosting} className="btn-primary w-full">
                  {isPosting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Posting...
                    </span>
                  ) : "Post Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Jobs;