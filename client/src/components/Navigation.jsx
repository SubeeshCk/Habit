import { Link, useLocation } from 'react-router-dom';
import { Layout, Home, LogOut, ClipboardList, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationButton from './NotificationButton';
import '../styles/Navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 font-semibold' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/habit-logo.svg" alt="Logo" className="w-8 h-8 rounded-lg shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105" />
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 tracking-wider">
                HABIT
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive('/')}`}
            >
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link
              to="/routines"
              className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isActive('/routines')}`}
            >
              <ClipboardList className="w-4 h-4" /> Routines
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-4">
              <NotificationButton />
            </div>

            <div className="flex items-center gap-3 pl-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                {user?.name}
              </span>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
