import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/RoutineForm.css';

const RoutineForm = ({ routine, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [tasks, setTasks] = useState([{ name: '', startTime: '', endTime: '' }]);

  useEffect(() => {
    if (routine) {
      setTitle(routine.title);
      setTasks(
        routine.tasks.length > 0
          ? routine.tasks.map(t => ({
            _id: t._id,
            name: t.name,
            startTime: t.startTime,
            endTime: t.endTime,
            completedDates: t.completedDates || []
          }))
          : [{ name: '', startTime: '', endTime: '' }]
      );
    }
  }, [routine]);

  const addTask = () => {
    setTasks([...tasks, { name: '', startTime: '', endTime: '' }]);
  };

  const removeTask = (index) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const updateTask = (index, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index][field] = value;
    setTasks(updatedTasks);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validTasks = tasks.filter(
      task => task.name.trim() && task.startTime
    );

    if (!title.trim()) {
      alert('Please enter a routine title');
      return;
    }

    if (validTasks.length === 0) {
      alert('Please add at least one task');
      return;
    }

    for (const task of validTasks) {
      if (task.endTime && task.startTime >= task.endTime) {
        alert(`Task "${task.name}" has invalid time range`);
        return;
      }
    }

    onSave({
      title: title.trim(),
      tasks: validTasks.map(t => ({
        _id: t._id,
        name: t.name.trim(),
        startTime: t.startTime,
        endTime: t.endTime,
        completedDates: t.completedDates || []
      }))
    });
  };

  const isTaskLocked = (task) => {
    // Only lock if editing existing routine and task has a start time
    if (!routine || !task.startTime) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = task.startTime.split(':').map(Number);
    const startTime = startHour * 60 + startMin;

    // Lock if start time has passed
    return currentTime >= startTime;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-900/95 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/20"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            {routine ? 'Edit Routine' : 'Create Routine'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="routine-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Routine Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Morning Power Hour"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Tasks ({tasks.length})
                </label>
                <button type="button" onClick={addTask} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </div>

              <div className="space-y-3">
                {tasks.map((task, index) => {
                  const locked = isTaskLocked(task);
                  return (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={index}
                      className={`flex flex-col sm:flex-row gap-3 p-4 rounded-xl border transition-colors ${locked
                          ? 'bg-gray-100 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 opacity-75'
                          : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 group hover:border-indigo-200 dark:hover:border-indigo-800'
                        }`}
                    >
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Task name"
                          value={task.name}
                          onChange={(e) => updateTask(index, 'name', e.target.value)}
                          disabled={locked}
                          className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none py-1 transition-colors disabled:cursor-not-allowed"
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 ${locked ? 'opacity-75' : ''}`}>
                          <Clock className="w-3 h-3" />
                          <input
                            type="time"
                            value={task.startTime}
                            onChange={(e) => updateTask(index, 'startTime', e.target.value)}
                            disabled={locked}
                            className="bg-transparent outline-none w-28 text-sm disabled:cursor-not-allowed"
                            required
                          />
                        </div>
                        <span className="text-gray-400">-</span>
                        <div className={`flex items-center gap-1 text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 ${locked ? 'opacity-75' : ''}`}>
                          <input
                            type="time"
                            value={task.endTime}
                            onChange={(e) => updateTask(index, 'endTime', e.target.value)}
                            disabled={locked}
                            className="bg-transparent outline-none w-28 text-sm placeholder:text-gray-400 disabled:cursor-not-allowed"
                          />
                        </div>
                        {tasks.length > 1 && !locked && (
                          <button
                            type="button"
                            onClick={() => removeTask(index)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {locked && (
                          <div className="w-8 flex justify-center" title="Task cannot be edited because time has passed">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="routine-form"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all transform hover:scale-105"
          >
            <Save className="w-4 h-4" /> {routine ? 'Update Routine' : 'Create Routine'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RoutineForm;
