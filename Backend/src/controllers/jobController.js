const jobService = require("../services/jobService");
const prisma = require("../config/prisma");
const sendEmail = require("../utils/sendEmail");

exports.createJob = async (req, res) => {
    try {
        const job = await jobService.createJob(
            req.user.id,
            req.body
        );
        
        // Async Mass Email Notification
        prisma.user.findMany({ select: { email: true } })
            .then(users => {
                const subject = "New Job Opportunity";
                const message = `A new job has been posted: ${job.title} at ${job.company}`;
                users.forEach(user => {
                    if (user.email) {
                        sendEmail({ to: user.email, subject, message }).catch(console.error);
                    }
                });
            })
            .catch(console.error);
        
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const job = await jobService.updateJob(
            req.user.id,
            req.params.id,
            req.body
        );
        res.json(job);
    } catch (error) {
        res.status(403).json({
            message: error.message
        });
    }
}

exports.deleteJob = async (req, res) => {
    try {
        await jobService.deleteJob(
            req.user.id,
            req.params.id
        );
        res.json({
            message: "Job deleted successfully"
        });
    } catch (error) {
        res.status(403).json({
            message: error.message
        });
    }
}

exports.getJobs = async (req, res) => {
    try {
        const jobs = await jobService.getAllJobs(req.query);
        res.json(jobs);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getJob = async (req, res) => {
    try {
        const job = await jobService.getJobById(req.params.id);
        if(!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }
        res.json(job);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};