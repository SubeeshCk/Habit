import mongoose from 'mongoose';

const dailyStatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    steps: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index to ensure one stat entry per user per day
dailyStatSchema.index({ user: 1, date: 1 }, { unique: true });

const DailyStat = mongoose.model('DailyStat', dailyStatSchema);

export default DailyStat;
