import { useEffect, useState } from "react";
import { getJobs } from "../features/jobs/jobService";
import { applyToJob } from "../services/applicationService";
import { getMyApplications } from "../services/applicationService";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await getJobs();
      setJobs(data.jobs || data);
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

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      <div className="flex items-center justify-between pl-1">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primaryHover to-accent inline-block">Explore Jobs</h1>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      ) : jobs.length === 0 ? (
        <div className="card text-center py-20 flex flex-col items-center justify-center gap-4">
            <span className="text-6xl opacity-50 drop-shadow-lg">📭</span>
            <p className="text-textSoft text-lg font-medium mt-2">No jobs available at the moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => {
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
    </div>
  );
}

export default Jobs;