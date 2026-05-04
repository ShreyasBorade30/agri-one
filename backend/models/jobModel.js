import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    wage: { type: Number, required: true },
    workersNeeded: { type: Number, required: true },
    startDate: { type: Date, required: true },
    duration: { type: String }, // e.g., "3 days"
    skillsRequired: [String],
    status: { type: String, enum: ['Open', 'In Progress', 'Completed', 'Cancelled'], default: 'Open' },
    applicants: [{
        workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' }
    }]
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);
