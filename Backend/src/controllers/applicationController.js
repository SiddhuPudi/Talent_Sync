const applicationService = require("../services/applicationService");

exports.applyJob = async (req, res) => {
    try {
        const { jobId } = req.body;
        const resumePath = req.file ? req.file.path : null;
        const application = await applicationService.applyToJob(
            req.user.id,
            jobId,
            resumePath
        )
        res.status(201).json(application);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getMyApplications = async (req, res) => {
    try {
        const applications = await applicationService.getMyApplication(req.user.id);
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getApplicationsForJob = async (req, res) => {
    try {
        const applications = await applicationService.getJobApplications(req.params.jobId);
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};