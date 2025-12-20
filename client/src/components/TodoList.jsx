import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, Circle, Calendar } from 'lucide-react';
import { todoAPI } from '../services/api';

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            const response = await todoAPI.getAll();
            setTodos(response.data);
        } catch (error) {
            console.error('Error fetching todos:', error);
        } finally {
            setLoading(false);
        }
    };

    const activeTodos = todos.filter(t => !t.completed);
    const completedTodos = todos.filter(t => t.completed);

    const handleAddTodo = async (e) => {
        e.preventDefault();
        if (!newTodo.trim()) return;

        try {
            const response = await todoAPI.create({ text: newTodo });
            setTodos([response.data, ...todos]);
            setNewTodo('');
        } catch (error) {
            console.error('Error creating todo:', error);
        }
    };

    const toggleTodo = async (todo) => {
        try {
            // Optimistic update
            const updatedTodos = todos.map(t =>
                t._id === todo._id ? { ...t, completed: !t.completed } : t
            );
            setTodos(updatedTodos);

            await todoAPI.update(todo._id, { completed: !todo.completed });
        } catch (error) {
            console.error('Error updating todo:', error);
            fetchTodos(); // Revert on error
        }
    };

    const deleteTodo = async (id) => {
        try {
            setTodos(todos.filter(t => t._id !== id));
            await todoAPI.delete(id);
        } catch (error) {
            console.error('Error deleting todo:', error);
            fetchTodos();
        }
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative group">
            {/* Decorative gradient */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500"></div>

            <div className="p-6 pb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600 dark:text-pink-400">
                        <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    Quick Tasks
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 pl-9">
                    {activeTodos.length} pending, {completedTodos.length} done
                </p>
            </div>

            <div className="px-6 mb-4">
                <form onSubmit={handleAddTodo} className="relative">
                    <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="Add a new task..."
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={!newTodo.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </form>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar space-y-2">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700/50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : todos.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                        <p>No tasks yet. Add one above! ✨</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false} mode='popLayout'>
                        {[...activeTodos, ...completedTodos].map((todo) => (
                            <motion.div
                                key={todo._id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`group/item flex items-center gap-3 p-3 rounded-xl border transition-all ${todo.completed
                                        ? 'bg-gray-50/50 dark:bg-gray-800/30 border-transparent opacity-60'
                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-900/50 hover:shadow-sm'
                                    }`}
                            >
                                <button
                                    onClick={() => toggleTodo(todo)}
                                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${todo.completed
                                            ? 'bg-pink-500 border-pink-500 text-white'
                                            : 'border-gray-300 dark:border-gray-500 text-transparent hover:border-pink-500'
                                        }`}
                                >
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </button>

                                <span className={`flex-1 text-sm font-medium truncate transition-all ${todo.completed
                                        ? 'text-gray-400 line-through'
                                        : 'text-gray-700 dark:text-gray-200'
                                    }`}>
                                    {todo.text}
                                </span>

                                <button
                                    onClick={() => deleteTodo(todo._id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all"
                                    title="Delete task"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default TodoList;
