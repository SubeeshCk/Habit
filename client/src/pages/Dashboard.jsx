import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowLeft, LayoutDashboard, Calendar, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { routineAPI } from '../services/api';
import Navigation from '../components/Navigation';
import RoutineSpreadsheet from '../components/RoutineSpreadsheet';
import RoutineForm from '../components/RoutineForm';
import Skeleton from '../components/Skeleton';
import notificationService from '../services/NotificationService';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);

  useEffect(() => {
    fetchRoutines();

    // Request notification permission on mount
    notificationService.requestPermission().then(granted => {
      if (granted) {
        console.log('Notification permission granted');
      }
    });

    return () => notificationService.stopMonitoring();
  }, []);

  const fetchRoutines = async () => {
    try {
      const res = await routineAPI.getAll();
      setRoutines(res.data);
      if (notificationService.hasPermission() || notificationService.isEnabled()) {
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

  const handleEditRoutine = (routine) => {
    setEditingRoutine(routine);
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

  const handleDeleteRoutine = async (id) => {
    try {
      await routineAPI.delete(id);
      fetchRoutines();
    } catch (error) {
      console.error('Error deleting routine:', error);
      alert('Failed to delete routine');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingRoutine(null);
  };

  return (
    <div className="dashboard min-h-screen pb-20">
      <Navigation />

      <main className="dashboard-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="dashboard-header-section mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="back-to-home inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
            </Link>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 mb-2">
              All Routines
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Manage and track all your daily routines</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <button
              onClick={handleCreateRoutine}
              className="btn-create-routine flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Routine</span>
            </button>
          </motion.div>
        </div>

        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-xl p-6 dark:bg-gray-900/40 dark:border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <Skeleton width="40%" height="24px" />
                  <Skeleton width="100px" height="36px" borderRadius="20px" />
                </div>
                <div className="space-y-4">
                  <Skeleton width="100%" height="48px" />
                  <Skeleton width="100%" height="48px" />
                  <Skeleton width="100%" height="48px" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {routines.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="empty-state glass rounded-2xl p-12 text-center"
              >
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                  <LayoutDashboard className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">No routines yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">Create your first routine to start tracking your daily habits and goals.</p>
                <button
                  onClick={handleCreateRoutine}
                  className="px-6 py-2 text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  Create one now
                </button>
              </motion.div>
            ) : (
              <motion.div layout className="routines-list grid gap-8">
                <AnimatePresence>
                  {routines.map((routine, index) => (
                    <motion.div
                      key={routine._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      layout
                    >
                      <RoutineSpreadsheet
                        routine={routine}
                        onUpdate={() => fetchRoutines()}
                        onDelete={handleDeleteRoutine}
                        onEdit={handleEditRoutine}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </main>

      <AnimatePresence>
        {showForm && (
          <RoutineForm
            routine={editingRoutine}
            onSave={handleSaveRoutine}
            onCancel={handleCancelForm}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
