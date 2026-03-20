const prisma = require("../config/prisma");

async function createJob(userId, data) {
    const job = await prisma.job.create({
        data: {
            ...data,
            postedBy: userId
        }
    });
    const users = await prisma.user.findMany({
        select: { id: true }
    });
    const notificationsData = users
        .filter(user => user.id !== userId)
        .map(user => ({
            userId: Number(user.id),
            type: "job_posted",
            message: `New job posted: ${data.title}`
        }));

    if (notificationsData.length > 0) {
        await prisma.notification.createMany({
            data: notificationsData,
            skipDuplicates: true
        });
    }
    return job;
}

async function updateJob(userId, jobId, data) {
    const job = await prisma.job.findUnique({ where: { id: Number(jobId) } });
    if (!job) {
        throw new Error("Job not found");
    }
    if (job.postedBy !== userId) {
        throw new Error("Not authorized to update this job");
    }
    return prisma.job.update({
        where: { id: Number(jobId) },
        data
    });
}

async function deleteJob(userId, jobId) {
    const job = await prisma.job.findUnique({ where: { id: Number(jobId) } });
    if (!job) {
        throw new Error("Job not found");
    }
    if (job.postedBy !== userId) {
        throw new Error("Not authorized to delete this job");
    }
    return prisma.job.delete({
        where: { id: Number(jobId) }
    });
}

async function getAllJobs(filters) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;
    const where = {}
    if (filters.location) {
        where.location = {
            contains: filters.location,
            mode: "insensitive"
        };
    }
    if (filters.company) {
        where.company = {
            contains: filters.company,
            mode: "insensitive"
        };
    }
    if (filters.title) {
        where.title = {
            contains: filters.title,
            mode: "insensitive"
        };
    }
    const jobs = await prisma.job.findMany({
        where,
        skip,
        take: limit,
        include: {
            user: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });
    const totalJobs = await prisma.job.count({ where });
    return {
        totalJobs,
        page,
        limit,
        jobs
    };
}

async function getJobById(jobId) {
    return prisma.job.findUnique({
        where: { id: Number(jobId) },
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
    createJob,
    updateJob,
    deleteJob,
    getAllJobs,
    getJobById
};