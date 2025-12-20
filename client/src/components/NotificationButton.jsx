import { useState, useEffect } from 'react';
import notificationService from '../services/NotificationService';
import '../styles/NotificationButton.css';

const NotificationButton = () => {
  const [permission, setPermission] = useState(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    checkPermission();
    // Check if notifications are enabled
    setEnabled(notificationService.isEnabled());
  }, []);

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    } else {
      setPermission('unsupported');
    }
  };

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermission(granted ? 'granted' : 'denied');
    if (granted) {
      notificationService.enable();
      setEnabled(true);
    }
  };

  const handleToggle = () => {
    if (enabled) {
      notificationService.disable();
      setEnabled(false);
    } else {
      if (notificationService.hasPermission()) {
        notificationService.enable();
        setEnabled(true);
      } else {
        handleRequestPermission();
      }
    }
  };

  if (permission === 'unsupported') {
    return null;
  }

  if (permission === 'granted') {
    return (
      <button
        onClick={handleToggle}
        className={`notification-toggle ${enabled ? 'enabled' : 'disabled'}`}
        title={enabled ? 'Click to disable notifications' : 'Click to enable notifications'}
      >
        {enabled ? '🔔' : '🔕'}
      </button>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="notification-status denied" title="Notifications blocked by browser">
        🔕
      </div>
    );
  }

  return (
    <button
      onClick={handleRequestPermission}
      className="btn-notification-request"
      title="Enable notifications for task reminders"
    >
      🔔 Enable Notifications
    </button>
  );
};

export default NotificationButton;

