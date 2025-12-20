import express from 'express';
import DailyStat from '../models/DailyStat.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user steps for last X days
// @route   GET /api/stats/steps
// @access  Private
router.get('/steps', protect, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (days - 1));
        startDate.setHours(0, 0, 0, 0);

        const stats = await DailyStat.find({
            user: req.user._id,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Log/Update steps for a specific date
// @route   POST /api/stats/steps
// @access  Private
router.post('/steps', protect, async (req, res) => {
    try {
        const { date, steps } = req.body;

        if (steps === undefined || steps < 0) {
            return res.status(400).json({ message: 'Please provide valid steps count' });
        }

        const targetDate = date ? new Date(date) : new Date();
        // Normalize to midnight to match schema grouping if needed, 
        // but here we just store exact dates or normalize logic in service. 
        // Let's normalize to UTC midnight to avoid timezone duplicates if user changes zones.
        // For simplicity, we just use local midnight logic or whatever client sends.
        // Better strategy: Store 'YYYY-MM-DD' string or normalize Date to start of day.
        targetDate.setHours(0, 0, 0, 0);

        // Upsert: Update if exists, Insert if not
        const stat = await DailyStat.findOneAndUpdate(
            { user: req.user._id, date: targetDate },
            { steps },
            { new: true, upsert: true }
        );

        res.json(stat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
