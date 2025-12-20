import { useNavigate } from 'react-router-dom';
import '../styles/RoutineOverviewCard.css';

const RoutineOverviewCard = ({ routine }) => {
  const navigate = useNavigate();

  // Sort tasks by start time
  const sortedTasks = [...(routine.tasks || [])].sort((a, b) => {
    const timeA = a.startTime.replace(':', '');
    const timeB = b.startTime.replace(':', '');
    return timeA.localeCompare(timeB);
  });

  // Get today's date string
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Calculate today's progress
  const totalTasks = sortedTasks.length;
  let completedTasks = 0;

  sortedTasks.forEach(task => {
    if (task.completedDates) {
      const isCompleted = task.completedDates.some(d => {
        const compareDate = d instanceof Date ? d : new Date(d);
        const dStr = `${compareDate.getFullYear()}-${String(compareDate.getMonth() + 1).padStart(2, '0')}-${String(compareDate.getDate()).padStart(2, '0')}`;
        return dStr === todayStr;
      });
      if (isCompleted) completedTasks++;
    }
  });

  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate circumference for progress ring
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const handleViewDetails = () => {
    navigate('/routines', { state: { scrollToRoutine: routine._id } });
  };

  return (
    <div
      className="routine-overview-card bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
      onClick={handleViewDetails}
    >
      <div className="card-header">
        <h3 className="routine-title">{routine.title}</h3>
        <span className="task-count">{totalTasks} tasks</span>
      </div>

      <div className="card-content">
        <div className="progress-ring-container">
          <svg className="progress-ring" width="80" height="80">
            <circle
              className="progress-ring-background"
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              strokeWidth="6"
            />
            <circle
              className="progress-ring-progress"
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 40 40)"
            />
          </svg>
          <div className="progress-percentage">{percentage}%</div>
        </div>

        <div className="card-stats">
          <div className="stat-item">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{completedTasks}/{totalTasks}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Remaining</span>
            <span className="stat-value">{totalTasks - completedTasks}</span>
          </div>
        </div>
      </div>

      <button className="view-details-btn" onClick={(e) => { e.stopPropagation(); handleViewDetails(); }}>
        View Details →
      </button>
    </div>
  );
};

export default RoutineOverviewCard;

