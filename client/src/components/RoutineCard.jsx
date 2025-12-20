import { useState } from 'react';
import { routineAPI } from '../services/api';
import ProgressBar from './ProgressBar';
import '../styles/RoutineCard.css';

const RoutineCard = ({ routine, onUpdate, onDelete }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // Sort tasks by start time
  const sortedTasks = [...routine.tasks].sort((a, b) => {
    const timeA = a.startTime.replace(':', '');
    const timeB = b.startTime.replace(':', '');
    return timeA.localeCompare(timeB);
  });

  // Calculate progress for selected date
  const getProgressForDate = (date) => {
    const dateStr = new Date(date).toISOString().split('T')[0];
    const completed = sortedTasks.filter(task => {
      return task.completedDates.some(d => {
        const dStr = new Date(d).toISOString().split('T')[0];
        return dStr === dateStr;
      });
    }).length;
    return { completed, total: sortedTasks.length };
  };

  const isTaskCompleted = (task, date) => {
    const dateStr = new Date(date).toISOString().split('T')[0];
    return task.completedDates.some(d => {
      const dStr = new Date(d).toISOString().split('T')[0];
      return dStr === dateStr;
    });
  };

  const toggleTaskCompletion = async (taskId, date) => {
    setLoading(true);
    try {
      const task = routine.tasks.find(t => t._id === taskId || t.id === taskId);
      const isCompleted = isTaskCompleted(task, date);

      if (isCompleted) {
        await routineAPI.uncompleteTask(routine._id, taskId, date);
      } else {
        await routineAPI.completeTask(routine._id, taskId, date);
      }

      onUpdate();
    } catch (error) {
      console.error('Error toggling task completion:', error);
      alert('Failed to update task completion');
    } finally {
      setLoading(false);
    }
  };

  const progress = getProgressForDate(selectedDate);

  return (
    <div className="routine-card">
      <div className="routine-header">
        <h3>{routine.title}</h3>
        <div className="routine-actions">
          <button
            onClick={() => onUpdate(routine)}
            className="btn-edit"
            title="Edit routine"
          >
            ✏️
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this routine?')) {
                onDelete(routine._id);
              }
            }}
            className="btn-delete"
            title="Delete routine"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="date-selector">
        <label htmlFor={`date-${routine._id}`}>Select Date:</label>
        <input
          type="date"
          id={`date-${routine._id}`}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-input"
        />
      </div>

      <ProgressBar completed={progress.completed} total={progress.total} />

      <div className="tasks-list">
        {sortedTasks.map((task, index) => {
          const completed = isTaskCompleted(task, selectedDate);
          return (
            <div
              key={task._id || `task-${index}`}
              className={`task-row ${completed ? 'completed' : ''}`}
            >
              <div className="task-info">
                <span className="task-time-range">
                  {task.startTime} - {task.endTime}
                </span>
                <span className="task-name">{task.name}</span>
              </div>
              <button
                onClick={() => toggleTaskCompletion(task._id || task.id, selectedDate)}
                disabled={loading}
                className={`task-checkbox ${completed ? 'checked' : ''}`}
                title={completed ? 'Mark as incomplete' : 'Mark as complete'}
              >
                {completed ? '✓' : ''}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoutineCard;

