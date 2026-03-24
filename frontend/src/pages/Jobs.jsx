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
      // update UI immediately
      setAppliedJobs((prev) => [...prev, jobId]);
      alert("Applied successfully 🚀");
    } catch (error) {
      console.error(error);
      alert("Error applying to job");
    } finally {
      setApplyingId(null);
    }
  };
  if (loading) {
    return <p className="text-textSoft">Loading jobs...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl text-accent">Jobs</h1>

      {jobs.length === 0 ? (
        <p className="text-textSoft">No jobs available</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

          {jobs.map((job) => {
            const isApplied = appliedJobs.includes(job.id);

            return (
              <div
                key={job.id}
                className="bg-surface p-4 rounded-xl shadow-md flex flex-col gap-2"
              >
                <h2 className="text-lg font-semibold text-accent">
                  {job.title}
                </h2>

                <p className="text-textSoft">{job.company}</p>
                <p className="text-sm text-textSoft">{job.location}</p>

                <p className="text-sm mt-2 line-clamp-3">
                  {job.description}
                </p>

                <button
                  onClick={() => handleApply(job.id)}
                  disabled={isApplied || applyingId === job.id}
                  className={`mt-3 px-3 py-1 rounded text-white ${
                    isApplied
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-primary hover:bg-primaryHover"
                  }`}
                >
                  {isApplied
                    ? "Applied"
                    : applyingId === job.id
                    ? "Applying..."
                    : "Apply"}
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