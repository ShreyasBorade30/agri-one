import mongoose from 'mongoose';

const labourSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    skills: [String],
    dailyWage: Number,
    contact: String,
    location: String,
    experience: Number,
    status: { type: String, enum: ['Available', 'Busy'], default: 'Available' },
    hiredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

export default mongoose.model('Labour', labourSchema);
