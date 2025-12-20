import express from 'express';
import Todo from '../models/Todo.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user todos
// @route   GET /api/todos
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Create a todo
// @route   POST /api/todos
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { text, dueDate } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Please provide todo text' });
        }

        const todo = await Todo.create({
            user: req.user._id,
            text,
            dueDate
        });

        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update a todo (toggle complete or update text)
// @route   PUT /api/todos/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        // Check user
        if (todo.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedTodo);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete a todo
// @route   DELETE /api/todos/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        // Check user
        if (todo.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await todo.deleteOne();
        res.json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
