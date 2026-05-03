import Labour from '../models/labourModel.js';

export const registerLabour = async (req, res) => {
    try {
        const { skills, dailyWage, contact, location, experience } = req.body;
        const labour = await Labour.findOneAndUpdate(
            { userId: req.userId },
            { 
                userId: req.userId,
                name: req.userName || "Worker", 
                skills, dailyWage, contact, location, experience 
            },
            { upsert: true, new: true }
        );
        res.status(201).json(labour);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllLabours = async (req, res) => {
    try {
        const labours = await Labour.find({ 
            status: 'Available',
            userId: { $ne: req.userId } // Don't show current user in the directory
        });
        res.status(200).json(labours);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getMyLabourProfile = async (req, res) => {
    try {
        const labour = await Labour.findOne({ userId: req.userId })
            .populate('hiredBy', 'name email');
        res.status(200).json(labour);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const hireLabour = async (req, res) => {
    try {
        const { labourId } = req.body;
        const labour = await Labour.findByIdAndUpdate(labourId, {
            status: 'Busy',
            hiredBy: req.userId
        }, { new: true });
        res.status(200).json({ message: "Labour hired successfully", labour });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
