import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    climate: String,
    soilType: String,
    cropType: String,
    cropInfo: String,
    weatherDetails: String,
    cropConditions: String,
    recommendations: String,
    date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Recommendation', recommendationSchema);
