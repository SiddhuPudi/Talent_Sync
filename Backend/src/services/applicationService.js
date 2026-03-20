const prisma = require("../config/prisma");
const notificationService = require("./notificationService");

async function applyToJob(userId, jobId, resume) {
    const existingApplication = await prisma.application.findFirst({
        where: {
            userId: userId,
            jobId: Number(jobId)
        }
    });
    if (existingApplication) {
        throw new Error("You already applied to this job");
    }
    const application = await prisma.application.create({
        data: {
            userId: userId,
            jobId: Number(jobId),
            resume
        },
        include: {
            job: { select: { postedBy: true } }
        }
    });
    if(!application.job) {
        throw new Error("Job not found");
    }
    await notificationService.createNotification(
        Number(application.job.postedBy),
        "job_application",
        "New application received for your job"
    );
    return application;
}

async function getMyApplication(userId) {
    return prisma.application.findMany({
        where: { userId },
        include: { job: true },
        orderBy: { appliedAt: "desc" }
    });
}

async function getJobApplications(jobId) {
    return prisma.application.findMany({
        where: { jobId: Number(jobId) },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });
}

module.exports = {
    applyToJob,
    getMyApplication,
    getJobApplications
};