import { useEffect, useState, useMemo } from "react";
import { getJobs, createJob } from "../features/jobs/jobService";
import { applyToJob, getMyApplications } from "../services/applicationService";
import { useAuth } from "../store/AuthContext";
import { useDebounce } from "../hooks/useDebounce";

function Jobs() {
  const { token } = useAuth();
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest" or "oldest"
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobForm, setJobForm] = useState({ title: "", company: "", location: "", description: "" });
  const [isPosting, setIsPosting] = useState(false);

  // Authentication & Verification
  const user = token ? JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) : null;
  // Assume backend sends isVerified. Mocking as true so feature is usable, change to test false.
  const isVerified = user?.isVerified ?? true; 

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
    } catch (error) {
      console.error(error);
      alert("Error applying to job");
    } finally {
      setApplyingId(null);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.company || !jobForm.location || !jobForm.description) {
      return alert("Please fill all required fields.");
    }
    setIsPosting(true);
    try {
      const newJob = await createJob(jobForm);
      setAllJobs((prev) => [newJob, ...prev]);
      setIsModalOpen(false);
      setJobForm({ title: "", company: "", location: "", description: "" });
      alert("Job posted successfully!");
    } catch (err) {
      console.error(err);
      alert("Error posting job");
    } finally {
      setIsPosting(false);
    }
  };

  // Derived state: Filtered and Sorted Jobs
  const filteredJobs = useMemo(() => {
    let result = [...allJobs];

    // Search filter
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      result = result.filter(
        (job) =>
          job.title?.toLowerCase().includes(term) ||
          job.company?.toLowerCase().includes(term) ||
          job.location?.toLowerCase().includes(term)
      );
    }

    // Location filter
    if (locationFilter) {
      result = result.filter((job) =>
        job.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Sorting (assuming jobs have createdAt or sorting by id/array index for mockup)
    result.sort((a, b) => {
      // Mock newest vs oldest using ID if createdAt isn't standard
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
      if (sortBy === "newest") return dateB - dateA;
      return dateA - dateB;
    });

    return result;
  }, [allJobs, debouncedSearchTerm, locationFilter, sortBy]);

  // Extract unique locations for the filter
  const uniqueLocations = useMemo(() => {
    const locs = allJobs.map(j => j.location).filter(Boolean);
    return [...new Set(locs)];
  }, [allJobs]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans pb-10">
      
      {/* Header & Post Job */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-1">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primaryHover to-accent inline-block">Explore Jobs</h1>
          
          <div className="relative group inline-block w-full md:w-auto">
            <button 
                onClick={() => isVerified && setIsModalOpen(true)}
                disabled={!isVerified}
                className={`btn-primary shadow-lg w-full md:w-auto ${!isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <span className="text-lg leading-none">+</span> Post a Job
            </button>
            {!isVerified && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 bg-surface border border-white/10 text-white text-xs text-center p-2 rounded-lg shadow-xl z-50">
                    Only verified users can post jobs.
                </div>
            )}
          </div>
      </div>

      {/* Global Search & Filters */}
      <div className="card sticky top-[72px] z-40 p-4 md:p-6 shadow-xl border-white/5 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textSoft">🔍</span>
              <input 
                 type="text" 
                 placeholder="Search by title, company, or location..." 
                 className="input-field pl-10 bg-bg"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <select 
                 className="input-field bg-bg sm:w-40 appearance-none cursor-pointer"
                 value={locationFilter}
                 onChange={(e) => setLocationFilter(e.target.value)}
              >
                 <option value="">All Locations</option>
                 {uniqueLocations.map(loc => (
                     <option key={loc} value={loc}>{loc}</option>
                 ))}
              </select>
              <select 
                 className="input-field bg-bg sm:w-40 appearance-none cursor-pointer"
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
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
        <div className="card text-center py-20 flex flex-col items-center justify-center gap-4 border-dashed border-2 border-white/10 bg-transparent mt-2">
            <span className="text-6xl opacity-40 drop-shadow-lg">📡</span>
            <h3 className="text-2xl font-bold text-textMain mt-2">No results found</h3>
            <p className="text-textSoft text-lg">Try adjusting your filters or search query.</p>
            {(searchTerm || locationFilter) && (
                <button 
                  onClick={() => { setSearchTerm(""); setLocationFilter(""); }}
                  className="mt-2 text-primaryHover hover:underline font-medium"
                >
                  Clear all filters
                </button>
            )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
          {filteredJobs.map((job) => {
            const isApplied = appliedJobs.includes(job.id);

            return (
              <div
                key={job.id}
                className="card card-hover flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                      <h2 className="text-xl font-bold text-textMain leading-tight group-hover:text-primaryHover transition-colors">
                        {job.title}
                      </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="bg-primary/10 border border-primary/20 text-textSoft px-3 py-1 rounded-full text-sm font-medium">
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
                  className={`w-full py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    isApplied
                      ? "bg-surface/50 border border-white/5 text-textSoft cursor-not-allowed"
                      : applyingId === job.id 
                      ? "bg-primary/70 text-white cursor-wait"
                      : "bg-primary hover:bg-primaryHover text-white shadow-md hover:shadow-lg active:scale-95"
                  }`}
                >
                  {isApplied ? (
                    <>✅ Applied</>
                  ) : applyingId === job.id ? (
                    <>
                       <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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
                      className="absolute top-4 right-4 text-textSoft hover:text-white transition-colors"
                  >
                      ✕
                  </button>
                  <h2 className="text-2xl font-bold text-textMain mb-6">Post a New Job</h2>
                  
                  <form onSubmit={handlePostJob} className="flex flex-col gap-4">
                      <div>
                          <label className="block text-sm font-medium text-textSoft mb-1">Job Title *</label>
                          <input 
                             type="text" 
                             required
                             className="input-field" 
                             placeholder="e.g. Senior Frontend Engineer"
                             value={jobForm.title}
                             onChange={e => setJobForm({...jobForm, title: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-textSoft mb-1">Company *</label>
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
                            <label className="block text-sm font-medium text-textSoft mb-1">Location *</label>
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
                          <label className="block text-sm font-medium text-textSoft mb-1">Description *</label>
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
                             {isPosting ? 'Posting...' : 'Post Job'}
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