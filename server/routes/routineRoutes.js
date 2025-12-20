import express from 'express';
import Routine from '../models/Routine.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/routines
// @desc    Get all routines for user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const routines = await Routine.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(routines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/routines
// @desc    Create new routine
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, tasks } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Please provide a routine title' });
    }

    const routine = await Routine.create({
      userId: req.user._id,
      title,
      tasks: tasks || []
    });

    res.status(201).json(routine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/routines/:id
// @desc    Update routine
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { title, tasks } = req.body;
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    // Check if routine belongs to user
    if (routine.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (title) routine.title = title;
    if (tasks !== undefined) {
      // Update tasks while preserving IDs and completion history
      const existingTaskMap = new Map();
      routine.tasks.forEach(task => {
        existingTaskMap.set(task._id.toString(), task);
      });

      const updatedTasks = tasks.map(taskData => {
        if (taskData._id && existingTaskMap.has(taskData._id.toString())) {
          // Update existing task
          const existingTask = existingTaskMap.get(taskData._id.toString());
          existingTask.name = taskData.name;
          existingTask.startTime = taskData.startTime;
          existingTask.endTime = taskData.endTime;
          // Preserve completedDates if not provided
          if (!taskData.completedDates) {
            taskData.completedDates = existingTask.completedDates;
          }
          return existingTask;
        } else {
          // New task
          return {
            name: taskData.name,
            startTime: taskData.startTime,
            endTime: taskData.endTime,
            completedDates: taskData.completedDates || []
          };
        }
      });

      routine.tasks = updatedTasks;
    }

    const updatedRoutine = await routine.save();
    res.json(updatedRoutine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/routines/:id
// @desc    Delete routine
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    // Check if routine belongs to user
    if (routine.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Routine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Routine deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/routines/:id/tasks/:taskId/complete
// @desc    Mark task as done for date
// @access  Private
router.patch('/:id/tasks/:taskId/complete', async (req, res) => {
  try {
    const { date } = req.body;
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    // Check if routine belongs to user
    if (routine.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const task = routine.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Parse date string (YYYY-MM-DD) and create date in local timezone
    const [year, month, day] = date.split('-').map(Number);
    const completionDate = new Date(year, month - 1, day);
    completionDate.setHours(0, 0, 0, 0);

    // Check if already completed for this date (compare date strings)
    const dateStr = date; // Use the original date string
    const isAlreadyCompleted = task.completedDates.some(d => {
      const compareDate = new Date(d);
      const compareDateStr = `${compareDate.getFullYear()}-${String(compareDate.getMonth() + 1).padStart(2, '0')}-${String(compareDate.getDate()).padStart(2, '0')}`;
      return compareDateStr === dateStr;
    });

    if (!isAlreadyCompleted) {
      task.completedDates.push(completionDate);
      await routine.save();
    }

    res.json(routine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/routines/:id/tasks/:taskId/uncomplete
// @desc    Unmark task for date
// @access  Private
router.patch('/:id/tasks/:taskId/uncomplete', async (req, res) => {
  try {
    const { date } = req.body;
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    // Check if routine belongs to user
    if (routine.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const task = routine.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Use the original date string for comparison
    const dateStr = date;

    task.completedDates = task.completedDates.filter(d => {
      const compareDate = new Date(d);
      const compareDateStr = `${compareDate.getFullYear()}-${String(compareDate.getMonth() + 1).padStart(2, '0')}-${String(compareDate.getDate()).padStart(2, '0')}`;
      return compareDateStr !== dateStr;
    });

    await routine.save();
    res.json(routine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

