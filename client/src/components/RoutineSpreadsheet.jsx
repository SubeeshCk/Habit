import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, ChevronLeft, ChevronRight, Calendar, Check, Clock } from 'lucide-react';
import { routineAPI } from '../services/api';
import '../styles/RoutineSpreadsheet.css';

const RoutineSpreadsheet = ({ routine, onUpdate, onDelete, onEdit }) => {
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
  const [loading, setLoading] = useState(false);

  // Local state for optimistic updates
  const [localTasks, setLocalTasks] = useState(routine.tasks);

  // Sync local state when routine prop updates
  useEffect(() => {
    setLocalTasks(routine.tasks);
  }, [routine.tasks]);

  // Use localTasks instead of routine.tasks for rendering
  const sortedTasks = [...localTasks].sort((a, b) => {
    const timeA = a.startTime.replace(':', '');
    const timeB = b.startTime.replace(':', '');
    return timeA.localeCompare(timeB);
  });

  // Get week dates (Monday to Sunday)
  function getCurrentWeek() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  function getWeekDates(startDate) {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  const weekDates = getWeekDates(currentWeek);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Format date to YYYY-MM-DD in local timezone (not UTC)
  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isTaskCompleted = (task, date) => {
    const dateStr = formatLocalDate(date);
    return task.completedDates.some(d => {
      // Handle both Date objects and date strings
      const compareDate = d instanceof Date ? d : new Date(d);
      const dStr = formatLocalDate(compareDate);
      return dStr === dateStr;
    });
  };

  const toggleTaskCompletion = async (taskId, date) => {
    // 1. Calculate new state optimistically
    const dateStr = formatLocalDate(date);
    const taskIndex = localTasks.findIndex(t => (t._id || t.id) === taskId);
    if (taskIndex === -1) return;

    const task = localTasks[taskIndex];
    const isCompleted = isTaskCompleted(task, date);

    // Create new completed dates array
    let newCompletedDates;
    if (isCompleted) {
      newCompletedDates = task.completedDates.filter(d => {
        const compareDate = d instanceof Date ? d : new Date(d);
        return formatLocalDate(compareDate) !== dateStr;
      });
    } else {
      newCompletedDates = [...task.completedDates, new Date(date)];
    }

    // Update local state immediately
    const newTasks = [...localTasks];
    newTasks[taskIndex] = { ...task, completedDates: newCompletedDates };
    setLocalTasks(newTasks);

    // 2. Perform API Call in background
    try {
      if (isCompleted) {
        await routineAPI.uncompleteTask(routine._id, taskId, dateStr);
      } else {
        await routineAPI.completeTask(routine._id, taskId, dateStr);
      }
      // Success: Trigger parent update to ensure data consistency
      onUpdate();
    } catch (error) {
      console.error('Error toggling task completion:', error);
      alert('Failed to update task completion');
      // Revert on error
      setLocalTasks(routine.tasks);
    }
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  const goToToday = () => {
    setCurrentWeek(getCurrentWeek());
  };

  const formatDateHeader = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      isToday: date.getTime() === today.getTime()
    };
  };

  const getProgressForDate = (date) => {
    const dateStr = formatLocalDate(date);
    const completed = sortedTasks.filter(task => {
      return task.completedDates.some(d => {
        const compareDate = d instanceof Date ? d : new Date(d);
        const dStr = formatLocalDate(compareDate);
        return dStr === dateStr;
      });
    }).length;
    return { completed, total: sortedTasks.length, percentage: sortedTasks.length > 0 ? Math.round((completed / sortedTasks.length) * 100) : 0 };
  };

  const isTaskActionable = (task, date) => {
    const now = new Date();
    const todayStr = formatLocalDate(now);
    const dateStr = formatLocalDate(date);

    // STRICTLY allow only TODAY
    if (dateStr !== todayStr) return false;

    // Time Check
    if (!task.startTime) return true;

    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Check if task has ended (or started if no end time)
    // User Requirement: "only able to mark it done after that time end"
    const targetTimeStr = task.endTime || task.startTime;
    const [targetHour, targetMin] = targetTimeStr.split(':').map(Number);
    const targetTime = targetHour * 60 + targetMin;

    return currentTime >= targetTime;
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-2xl mb-12">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>

      {/* Header Section */}
      <div className="p-8 border-b border-gray-100 dark:border-gray-700/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{routine.title}</h3>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                {routine.tasks.length} Tasks
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Week of {weekDates[0].toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-4 self-end md:self-auto">
            {/* Week Navigation */}
            <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-1.5 border border-gray-200 dark:border-gray-600">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-all text-gray-600 dark:text-gray-300 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateWeek(1)}
                className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-all text-gray-600 dark:text-gray-300 shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(routine)}
                className="p-2.5 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30"
                title="Edit routine"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this routine?')) {
                    onDelete(routine._id);
                  }
                }}
                className="p-2.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                title="Delete routine"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Table Header */}
          <div className="flex items-end border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="w-72 p-6 sticky left-0 z-20 bg-gray-50 dark:bg-gray-800 border-r border-dashed border-gray-200 dark:border-gray-700 font-semibold text-gray-500 dark:text-gray-400 tracking-wide text-xs uppercase">
              Routine Tasks
            </div>
            {weekDates.map((date, index) => {
              const header = formatDateHeader(date);
              const progress = getProgressForDate(date);
              const isToday = header.isToday;

              return (
                <div key={index} className={`w-32 flex-shrink-0 flex flex-col items-center justify-end pb-4 relative ${isToday ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                  {isToday && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                  )}
                  <div className={`text-xs font-bold mb-1 uppercase tracking-wider ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    {header.day}
                  </div>
                  <div className={`text-2xl font-bold mb-3 ${isToday ? 'text-indigo-700 dark:text-white scale-110' : 'text-gray-700 dark:text-gray-300'}`}>
                    {header.date}
                  </div>

                  {/* Circular Progress Indicator for Header */}
                  <div className="relative w-8 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.percentage}%` }}
                      className={`h-full rounded-full ${progress.percentage === 100 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-indigo-500'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table Body */}
          {sortedTasks.map((task, taskIndex) => (
            <div
              key={task._id || `task-${taskIndex}`}
              className="group/row flex items-center border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors bg-white dark:bg-gray-900"
            >
              <div className="w-72 p-6 sticky left-0 z-10 bg-white dark:bg-gray-900 border-r border-dashed border-gray-200 dark:border-gray-700 transition-colors group-hover/row:bg-gray-50 dark:group-hover/row:bg-gray-800/95">
                <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1.5 line-clamp-2">
                  {task.name}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-medium">
                  <Clock className="w-3 h-3" />
                  {task.startTime} {task.endTime ? `- ${task.endTime}` : ''}
                </div>
              </div>

              {weekDates.map((date, dateIndex) => {
                const completed = isTaskCompleted(task, date);
                const isToday = date.getTime() === today.getTime();
                const actionable = isTaskActionable(task, date);

                return (
                  <div
                    key={dateIndex}
                    className={`w-32 h-20 flex-shrink-0 flex items-center justify-center border-r border-gray-50 dark:border-gray-800 last:border-r-0 ${isToday ? 'bg-indigo-50/20 dark:bg-indigo-900/5' : ''}`}
                  >
                    <button
                      onClick={() => actionable && toggleTaskCompletion(task._id || task.id, date)}
                      disabled={loading || (!actionable && !completed)}
                      className={`
                        relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                        ${completed
                          ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-100 rotate-0'
                          : actionable
                            ? 'bg-gray-100 dark:bg-gray-800 text-transparent hover:bg-gray-200 dark:hover:bg-gray-700 scale-90 hover:scale-100 cursor-pointer'
                            : 'bg-gray-50 dark:bg-gray-800/50 text-transparent opacity-50 cursor-not-allowed scale-75'
                        }
                      `}
                    >
                      <Check className={`w-5 h-5 stroke-[2.5px] transition-all duration-300 ${completed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />

                      {/* Empty state dot */}
                      {!completed && actionable && (
                        <div className={`absolute w-1.5 h-1.5 rounded-full ${isToday ? 'bg-indigo-300 dark:bg-indigo-700' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoutineSpreadsheet;
