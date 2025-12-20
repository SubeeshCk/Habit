import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { routineAPI } from '../services/api';
import Navigation from '../components/Navigation';
import SummaryStats from '../components/SummaryStats';
import ProgressChart from '../components/ProgressChart';
import RoutineOverviewCard from '../components/RoutineOverviewCard';
import RoutineForm from '../components/RoutineForm';
import TodoList from '../components/TodoList';
import notificationService from '../services/NotificationService';
import '../styles/Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);

  useEffect(() => {
    fetchRoutines();

    // Request notification permission
    notificationService.requestPermission().then(granted => {
      if (granted) {
        console.log('Notification permission granted');
      }
    });

    return () => {
      notificationService.stopMonitoring();
    };
  }, []);

  const fetchRoutines = async () => {
    try {
      const res = await routineAPI.getAll();
      setRoutines(res.data);

      // Update notification service
      if (notificationService.hasPermission() && notificationService.isEnabled()) {
        notificationService.updateRoutines(res.data);
      } else {
        notificationService.updateRoutines(res.data);
      }
    } catch (error) {
      console.error('Error fetching routines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoutine = () => {
    setEditingRoutine(null);
    setShowForm(true);
  };

  const handleSaveRoutine = async (routineData) => {
    try {
      if (editingRoutine) {
        await routineAPI.update(editingRoutine._id, routineData);
      } else {
        await routineAPI.create(routineData);
      }
      setShowForm(false);
      setEditingRoutine(null);
      fetchRoutines();
    } catch (error) {
      console.error('Error saving routine:', error);
      alert('Failed to save routine');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingRoutine(null);
  };

  const handleViewAllRoutines = () => {
    navigate('/routines');
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="home-loading">
          <div className="loading-spinner"></div>
          <p>Loading your routines...</p>
        </div>
      </>
    );
  }

  return (
    <div className="home-page min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="home-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="home-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Track your daily progress and stay on top of your routines</p>
          </div>
          <div className="home-actions flex gap-3">
            <button
              onClick={handleCreateRoutine}
              className="btn-create-routine-home flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105"
            >
              + Create Routine
            </button>
            {routines.length > 0 && (
              <button
                onClick={handleViewAllRoutines}
                className="btn-view-all px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                View All Routines →
              </button>
            )}
          </div>
        </div>

        {routines.length === 0 ? (
          <div className="text-center py-20 px-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl max-w-2xl mx-auto">
            <div className="text-6xl mb-6 animate-bounce">📋</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">No routines yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">Create your first routine to start tracking your daily tasks and progress!</p>
            <button
              onClick={handleCreateRoutine}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105"
            >
              Create Your First Routine
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <SummaryStats routines={routines} />

            {/* Recent Routines or Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96">
                <TodoList />
              </div>
              {/* StepsTracker removed */}
            </div>

            <div className="mt-8 mb-12">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Weekly Progress</h2>
              <ProgressChart routines={routines} />
            </div>

            <div className="routines-section mt-12">
              <div className="section-header flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Your Routines</h2>
                <button
                  onClick={handleViewAllRoutines}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-4 py-2 rounded-lg transition-colors"
                >
                  View All →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {routines.slice(0, 6).map((routine) => (
                  <RoutineOverviewCard key={routine._id} routine={routine} />
                ))}
              </div>

              {routines.length > 6 && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleViewAllRoutines}
                    className="px-6 py-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                  >
                    View {routines.length - 6} More Routines →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showForm && (
        <RoutineForm
          routine={editingRoutine}
          onSave={handleSaveRoutine}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
};

export default Home;
