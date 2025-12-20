import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import '../styles/ProgressChart.css';

const ProgressChart = ({ routines }) => {
  // Get last 7 days
  const dates = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date);
  }

  // Format date for display
  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  // Calculate daily completion data
  const chartData = dates.map(date => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    let totalCompleted = 0;
    let totalTasks = 0;

    routines.forEach(routine => {
      if (routine.tasks) {
        routine.tasks.forEach(task => {
          totalTasks++;
          if (task.completedDates) {
            const isCompleted = task.completedDates.some(d => {
              const compareDate = d instanceof Date ? d : new Date(d);
              const dStr = `${compareDate.getFullYear()}-${String(compareDate.getMonth() + 1).padStart(2, '0')}-${String(compareDate.getDate()).padStart(2, '0')}`;
              return dStr === dateStr;
            });
            if (isCompleted) totalCompleted++;
          }
        });
      }
    });

    const percentage = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

    return {
      date: formatDate(date),
      fullDate: dateStr,
      completion: percentage,
      completed: totalCompleted,
      total: totalTasks
    };
  });

  // Calculate routine completion rates for bar chart
  const barChartData = routines.map(routine => {
    const totalTasks = routine.tasks?.length || 0;
    if (totalTasks === 0) return { name: routine.title, completion: 0 };

    let totalCompleted = 0;
    dates.forEach(date => {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      routine.tasks.forEach(task => {
        if (task.completedDates) {
          const isCompleted = task.completedDates.some(d => {
            const compareDate = d instanceof Date ? d : new Date(d);
            const dStr = `${compareDate.getFullYear()}-${String(compareDate.getMonth() + 1).padStart(2, '0')}-${String(compareDate.getDate()).padStart(2, '0')}`;
            return dStr === dateStr;
          });
          if (isCompleted) totalCompleted++;
        }
      });
    });

    const avgCompletion = totalTasks > 0 ? Math.round((totalCompleted / (totalTasks * 7)) * 100) : 0;
    
    return {
      name: routine.title.length > 15 ? routine.title.substring(0, 15) + '...' : routine.title,
      completion: avgCompletion
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 rounded-lg border border-white/20">
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            {payload[0].payload.fullDate || payload[0].payload.name}
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: payload[0].color }}></span>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {payload[0].value}% Completed
            </p>
          </div>
          {payload[0].payload.completed !== undefined && (
            <p className="text-xs mt-1 opacity-70" style={{ color: 'var(--text-tertiary)' }}>
              {payload[0].payload.completed}/{payload[0].payload.total} tasks
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-xl p-6 relative overflow-hidden"
      >
        <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
          Weekly Progress
        </h3>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.5} />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-secondary)"
                tickLine={false}
                axisLine={false}
                dy={10}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                tickLine={false}
                axisLine={false}
                dx={-10}
                style={{ fontSize: '12px' }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--text-tertiary)', strokeDasharray: '4 4' }} />
              <Area 
                type="monotone" 
                dataKey="completion" 
                stroke="var(--accent-primary)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCompletion)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {barChartData.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass rounded-xl p-6 relative overflow-hidden"
        >
          <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
            Routine Consistency
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--text-secondary)"
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="var(--text-secondary)"
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                  style={{ fontSize: '12px' }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-tertiary)', opacity: 0.2 }} />
                <Bar 
                  dataKey="completion" 
                  fill="var(--accent-secondary)"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProgressChart;
