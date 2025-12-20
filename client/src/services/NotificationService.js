class NotificationService {
  constructor() {
    this.permission = null;
    this.notifiedTasks = new Set(); // Track notified tasks to avoid duplicates
    this.checkInterval = null;
    this.routines = [];
    this.isActive = false;
    this.enabled = false; // User-controlled enable/disable toggle
  }

  // Request notification permission
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }

    if (Notification.permission === 'denied') {
      this.permission = 'denied';
      return false;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === 'granted';
  }

  // Check if permission is granted
  hasPermission() {
    return this.permission === 'granted' || Notification.permission === 'granted';
  }

  // Show notification
  showNotification(title, options = {}) {
    if (!this.hasPermission()) {
      return;
    }

    const notification = new Notification(title, {
      icon: '/vite.svg', // You can replace with your app icon
      badge: '/vite.svg',
      tag: options.tag || 'routine-task',
      requireInteraction: false,
      ...options
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }

  // Check if task is completed for today
  isTaskCompletedToday(task, todayStr) {
    return task.completedDates.some(d => {
      const dStr = new Date(d).toISOString().split('T')[0];
      return dStr === todayStr;
    });
  }

  // Get task notification key (to avoid duplicates)
  getNotificationKey(routineId, taskId, dateStr) {
    return `${routineId}-${taskId}-${dateStr}`;
  }

  // Check current time against task times
  checkTaskTimes() {
    if (!this.hasPermission() || !this.isActive || !this.enabled) {
      return;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const todayStr = now.toISOString().split('T')[0];

    this.routines.forEach(routine => {
      if (!routine.tasks || routine.tasks.length === 0) return;

      routine.tasks.forEach(task => {
        if (!task.startTime) return;

        // Check if task time matches current time (within 1 minute window)
        const taskTime = task.startTime;
        const [taskHour, taskMin] = taskTime.split(':').map(Number);
        const [currentHour, currentMin] = currentTime.split(':').map(Number);

        const taskMinutes = taskHour * 60 + taskMin;
        const currentMinutes = currentHour * 60 + currentMin;

        // Check if current time is within 1 minute of task time
        const timeDiff = Math.abs(currentMinutes - taskMinutes);

        if (timeDiff <= 1) {
          // Check if task is not completed for today
          if (!this.isTaskCompletedToday(task, todayStr)) {
            const notificationKey = this.getNotificationKey(
              routine._id,
              task._id || task.id,
              todayStr
            );

            // Only notify if we haven't notified for this task today
            if (!this.notifiedTasks.has(notificationKey)) {
              // Play alarm if appropriate (e.g. for "Wake up" tasks)
              // Matches: "Wake Up", "wakeup", "wake   up", "ALARM", "Alarm Clock", etc.
              const isWakeUp = /wake\s*up|alarm/i.test(task.name);

              if (isWakeUp) {
                this.playAlarm();
              }

              this.showNotification(
                `Time for: ${task.name}`,
                {
                  body: `${routine.title} - ${task.startTime}${task.endTime ? ' to ' + task.endTime : ''}`,
                  tag: notificationKey,
                  renotify: true,
                  requireInteraction: isWakeUp // Keep notification open for alarms
                }
              );

              // Mark as notified
              this.notifiedTasks.add(notificationKey);
            }
          }
        }
      });
    });
  }

  playAlarm() {
    try {
      // Longer alarm sound (~15s or looping)
      // Using a classic alarm clock sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 1.0; // Full volume
      audio.loop = true; // Loop it to ensure it plays long enough if short

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Stop after 15 seconds
            setTimeout(() => {
              audio.pause();
              audio.currentTime = 0;
            }, 15000);
          })
          .catch(error => {
            console.warn('Audio play failed (user interaction required):', error);
          });
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  // Enable notifications (user toggle)
  enable() {
    this.enabled = true;
    if (this.routines.length > 0 && this.hasPermission()) {
      this.startMonitoring(this.routines);
    }
  }

  // Disable notifications (user toggle)
  disable() {
    this.enabled = false;
    this.stopMonitoring();
  }

  // Check if notifications are enabled by user
  isEnabled() {
    return this.enabled;
  }

  // Start monitoring tasks
  startMonitoring(routines) {
    if (!this.hasPermission() || !this.enabled) {
      return;
    }

    this.routines = routines;
    this.isActive = true;

    // Clear old notifications for new day
    const todayStr = new Date().toISOString().split('T')[0];
    const todayKey = todayStr;
    const oldKeys = Array.from(this.notifiedTasks).filter(key => !key.includes(todayKey));
    oldKeys.forEach(key => this.notifiedTasks.delete(key));

    // Check immediately
    this.checkTaskTimes();

    // Check every minute
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkTaskTimes();
    }, 60000); // Check every minute
  }

  // Stop monitoring
  stopMonitoring() {
    this.isActive = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Update routines
  updateRoutines(routines) {
    this.routines = routines;
    // Restart monitoring if enabled
    if (this.enabled && this.hasPermission()) {
      this.stopMonitoring();
      this.startMonitoring(routines);
    }
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;

