import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { HiOutlineClipboardList, HiOutlineExclamationCircle, HiOutlineCheckCircle, HiOutlineFolder, HiOutlineClock } from 'react-icons/hi';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/dashboard');
      setStats(data.stats);
      setOverdueTasks(data.overdueTasks);
      setMyTasks(data.myTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const efficiency = stats.totalTasks > 0 ? Math.round((stats.done / stats.totalTasks) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <div className="page-subtitle">Enterprise Overview</div>
        <h1>Project Health Hub</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><HiOutlineClipboardList /></div>
          <div className="stat-label">Total Tasks</div>
          <div className="stat-value">{stats.totalTasks}</div>
          <div className="stat-sub">{stats.inProgress} in progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><HiOutlineExclamationCircle /></div>
          <div className="stat-label">Overdue</div>
          <div className="stat-value">{stats.overdue}</div>
          <div className="stat-sub warn">Requires attention</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><HiOutlineCheckCircle /></div>
          <div className="stat-label">Completed</div>
          <div className="stat-value">{stats.done}</div>
          <div className="stat-sub">{efficiency}% efficiency</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><HiOutlineFolder /></div>
          <div className="stat-label">Active Projects</div>
          <div className="stat-value">{stats.activeProjects}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* My Tasks */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>My Assigned Tasks</h3>
          {myTasks.length === 0 ? (
            <div className="empty-state"><p>No tasks assigned to you</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myTasks.map(task => (
                <div key={task.id} className="task-card" onClick={() => navigate(`/projects/${task.projectId}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span className={`task-priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <h4>{task.title}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.project?.name}</span>
                    </div>
                    {task.dueDate && (
                      <span className={`task-date ${new Date(task.dueDate) < new Date() ? 'overdue' : ''}`}>
                        <HiOutlineClock style={{ marginRight: 4 }} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue Tasks */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Overdue Tasks</h3>
          {overdueTasks.length === 0 ? (
            <div className="empty-state"><p>No overdue tasks 🎉</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {overdueTasks.map(task => (
                <div key={task.id} className="task-card" onClick={() => navigate(`/projects/${task.projectId}`)} style={{ borderLeft: '3px solid var(--rose)' }}>
                  <span className="task-priority high">Overdue</span>
                  <h4>{task.title}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.project?.name}</span>
                    <span className="task-date overdue">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
