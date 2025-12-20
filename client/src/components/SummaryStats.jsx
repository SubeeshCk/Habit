import '../styles/SummaryStats.css';

const SummaryStats = ({ routines }) => {
  // Calculate statistics
  const totalRoutines = routines.length;
  const totalTasks = routines.reduce((sum, routine) => sum + (routine.tasks?.length || 0), 0);

  // Get today's date string
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Calculate today's completion
  let todayCompleted = 0;
  let todayTotal = 0;

  routines.forEach(routine => {
    if (routine.tasks && routine.tasks.length > 0) {
      todayTotal += routine.tasks.length;
      routine.tasks.forEach(task => {
        if (task.completedDates) {
          const isCompleted = task.completedDates.some(d => {
            const compareDate = d instanceof Date ? d : new Date(d);
            const dStr = `${compareDate.getFullYear()}-${String(compareDate.getMonth() + 1).padStart(2, '0')}-${String(compareDate.getDate()).padStart(2, '0')}`;
            return dStr === todayStr;
          });
          if (isCompleted) todayCompleted++;
        }
      });
    }
  });

  const todayPercentage = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  // Calculate weekly completion (last 7 days)
  const weekDates = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    weekDates.push(date);
  }

  let weekCompleted = 0;
  let weekTotal = totalTasks * 7;

  routines.forEach(routine => {
    if (routine.tasks) {
      routine.tasks.forEach(task => {
        weekDates.forEach(date => {
          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          if (task.completedDates) {
            const isCompleted = task.completedDates.some(d => {
              const compareDate = d instanceof Date ? d : new Date(d);
              const dStr = `${compareDate.getFullYear()}-${String(compareDate.getMonth() + 1).padStart(2, '0')}-${String(compareDate.getDate()).padStart(2, '0')}`;
              return dStr === dateStr;
            });
            if (isCompleted) weekCompleted++;
          }
        });
      });
    }
  });

  const weekPercentage = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

  const stats = [
    {
      label: 'Total Routines',
      value: totalRoutines,
      icon: '📋',
      color: 'var(--accent-primary)'
    },
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: '✅',
      color: 'var(--success)'
    },
    {
      label: "Today's Progress",
      value: `${todayPercentage}%`,
      subValue: `${todayCompleted}/${todayTotal}`,
      icon: '📊',
      color: 'var(--accent-primary)'
    },
    {
      label: 'Weekly Progress',
      value: `${weekPercentage}%`,
      subValue: `${weekCompleted}/${weekTotal}`,
      icon: '📈',
      color: 'var(--success)'
    }
  ];

  return (
    <div className="summary-stats">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
          <div className="stat-icon" style={{ color: stat.color }}>
            {stat.icon}
          </div>
          <div className="stat-content">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            {stat.subValue && (
              <div className="stat-sub-value">{stat.subValue}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryStats;

