import Job from '../models/jobModel.js';

export const postJob = async (req, res) => {
    try {
        const newJob = new Job({
            farmerId: req.userId,
            ...req.body
        });
        await newJob.save();
        res.status(201).json(newJob);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'Open' }).populate('farmerId', 'name email');
        res.status(200).json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getFarmerJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ farmerId: req.userId });
        res.status(200).json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const applyForJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ error: "Job not found" });

        const alreadyApplied = job.applicants.some(app => app.workerId.toString() === req.userId);
        if (alreadyApplied) return res.status(400).json({ error: "Already applied for this job" });

        job.applicants.push({ workerId: req.userId });
        await job.save();
        res.status(200).json({ message: "Applied successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateApplicantStatus = async (req, res) => {
    try {
        const { jobId, workerId, status } = req.body;
        const job = await Job.findOneAndUpdate(
            { _id: jobId, "applicants.workerId": workerId },
            { $set: { "applicants.$.status": status } },
            { new: true }
        );
        res.status(200).json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
