import { useEffect, useState, useMemo } from "react";
import { getJobs, createJob } from "../features/jobs/jobService";
import { applyToJob, getMyApplications } from "../services/applicationService";
import { useAuth } from "../store/AuthContext";
import { useDebounce } from "../hooks/useDebounce";

function Jobs() {
  const { user } = useAuth();
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [successJobId, setSuccessJobId] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobForm, setJobForm] = useState({ title: "", company: "", location: "", description: "" });
  const [isPosting, setIsPosting] = useState(false);

  const isVerified = user?.isVerified ?? true; 

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await getJobs();
      setAllJobs(data.jobs || data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const data = await getMyApplications();
      const jobIds = data.map((app) => app.jobId);
      setAppliedJobs(jobIds);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const handleApply = async (jobId) => {
    try {
      setApplyingId(jobId);
      await applyToJob(jobId);
      setAppliedJobs((prev) => [...prev, jobId]);
      setSuccessJobId(jobId);
      showToast("Application submitted successfully!", "success");
      setTimeout(() => setSuccessJobId(null), 2000);
    } catch (error) {
      console.error(error);
      showToast("Failed to apply. Please try again.", "error");
    } finally {
      setApplyingId(null);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.company || !jobForm.location || !jobForm.description) {
      showToast("Please fill all required fields.", "error");
      return;
    }
    setIsPosting(true);
    try {
      const newJob = await createJob(jobForm);
      setAllJobs((prev) => [newJob, ...prev]);
      setIsModalOpen(false);
      setJobForm({ title: "", company: "", location: "", description: "" });
      showToast("Job posted successfully!", "success");
    } catch (err) {
      console.error(err);
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
      if (sortBy === "newest") return dateB - dateA;
      return dateA - dateB;
    });
    return result;
  }, [allJobs, debouncedSearchTerm, locationFilter, sortBy]);

  const uniqueLocations = useMemo(() => {
    const locs = allJobs.map(j => j.location).filter(Boolean);
    return [...new Set(locs)];
  }, [allJobs]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans pb-10">
      
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[200] px-5 py-3 rounded-xl shadow-2xl border animate-slide-down flex items-center gap-3 font-medium text-sm backdrop-blur-xl ${
          toast.type === "success"
            ? "bg-green-500/20 border-green-500/30 text-green-400"
            : "bg-red-500/20 border-red-500/30 text-red-400"
        }`}>
          <span className="text-lg">{toast.type === "success" ? "✅" : "❌"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Post Job */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text inline-block">Explore Jobs</h1>
            <p className="text-textSoft text-sm mt-1">
              {loading ? "" : `${filteredJobs.length} ${filteredJobs.length === 1 ? 'position' : 'positions'} available`}
            </p>
          </div>
          
          <div className="relative group inline-block w-full md:w-auto">
            <button 
                onClick={() => isVerified && setIsModalOpen(true)}
                disabled={!isVerified}
                className={`btn-primary shadow-lg w-full md:w-auto ${!isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                 {uniqueLocations.map(loc => (
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
                   <div className="skeleton h-6 w-3/4"></div>
                   <div className="skeleton h-4 w-1/2"></div>
                   <div className="skeleton h-4 w-1/3"></div>
                   <div className="skeleton h-16 w-full mt-2"></div>
                   <div className="skeleton h-10 w-full mt-4 rounded-xl"></div>
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
          {filteredJobs.map((job) => {
            const isApplied = appliedJobs.includes(job.id);
            const justApplied = successJobId === job.id;

            return (
              <div
                key={job.id}
                className="card card-hover flex flex-col justify-between group"
              >
                <div>
                  <h2 className="text-xl font-bold text-textMain leading-tight group-hover:text-primaryHover transition-colors mb-3">
                    {job.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="badge badge-primary">
                          {job.company}
                      </span>
                      <span className="text-sm text-textSoft flex items-center gap-1 opacity-80">
                          📍 {job.location}
                      </span>
                  </div>

                  <p className="text-sm text-textSoft line-clamp-3 mb-6 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                <button
                  onClick={() => handleApply(job.id)}
                  disabled={isApplied || applyingId === job.id}
                  className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    isApplied
                      ? "bg-surface/50 border border-white/5 text-textSoft cursor-not-allowed"
                      : applyingId === job.id 
                      ? "bg-primary/70 text-white cursor-wait"
                      : "bg-primary hover:bg-primaryHover text-white shadow-md hover:shadow-glow-primary active:scale-95"
                  }`}
                >
                  {isApplied ? (
                    <><span className={justApplied ? "animate-bounce" : ""}>✅</span> Applied</>
                  ) : applyingId === job.id ? (
                    <>
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       Applying...
                    </>
                  ) : (
                    "Apply Now"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE JOB MODAL */}
      {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={() => !isPosting && setIsModalOpen(false)}></div>
              <div className="card w-full max-w-lg relative z-10 animate-slide-up bg-surface border-white/10 shadow-2xl">
                  <button 
                      onClick={() => !isPosting && setIsModalOpen(false)}
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
                             onChange={e => setJobForm({...jobForm, title: e.target.value})}
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
                               onChange={e => setJobForm({...jobForm, company: e.target.value})}
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
                               onChange={e => setJobForm({...jobForm, location: e.target.value})}
                            />
                         </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-textSoft mb-1.5">Description *</label>
                          <textarea 
                             required
                             className="input-field min-h-[120px] resize-y" 
                             placeholder="Describe the role and responsibilities..."
                             value={jobForm.description}
                             onChange={e => setJobForm({...jobForm, description: e.target.value})}
                          />
                      </div>
                      
                      <div className="flex gap-3 mt-4">
                          <button 
                             type="button" 
                             onClick={() => setIsModalOpen(false)}
                             disabled={isPosting}
                             className="btn-secondary w-full"
                          >
                             Cancel
                          </button>
                          <button 
                             type="submit" 
                             disabled={isPosting}
                             className="btn-primary w-full"
                          >
                             {isPosting ? (
                               <span className="flex items-center gap-2">
                                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                 Posting...
                               </span>
                             ) : 'Post Job'}
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