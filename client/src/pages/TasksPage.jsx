import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HiOutlineClock, HiPlus } from 'react-icons/hi';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '', projectId: '' });
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchAllTasks(); }, []);

  const fetchAllTasks = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjectList(data.projects);
      const allTasks = [];
      for (const project of data.projects) {
        const tRes = await api.get(`/projects/${project.id}/tasks`);
        tRes.data.tasks.forEach(t => allTasks.push({ ...t, projectName: project.name }));
      }
      setTasks(allTasks);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.projectId) return alert("Please select a project first");
    setCreating(true);
    try {
      await api.post(`/projects/${taskForm.projectId}/tasks`, { ...taskForm, status: 'TODO' });
      setShowModal(false);
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', projectId: '' });
      fetchAllTasks();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setCreating(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const myTasks = tasks.filter(t => t.assignedToId === user.id);
  const otherTasks = tasks.filter(t => t.assignedToId !== user.id);

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1>All Tasks</h1>
          <div className="page-desc">View all tasks across your projects.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={projectList.length === 0}>
          <HiPlus /> Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No tasks yet</h3>
          <p>Tasks will appear here once created in a project</p>
        </div>
      ) : (
        <>
          {myTasks.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 12, fontWeight: 700 }}>Assigned to Me ({myTasks.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {myTasks.map(t => (
                  <div key={t.id} className="task-card" onClick={() => navigate(`/projects/${t.projectId}`)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className={`task-priority ${t.priority.toLowerCase()}`}>{t.priority}</span>
                        <h4>{t.title}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.projectName}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`role-badge ${t.status === 'DONE' ? 'admin' : 'member'}`} style={{ fontSize: '0.65rem' }}>
                          {t.status.replace('_', ' ')}
                        </span>
                        {t.dueDate && (
                          <span className={`task-date ${new Date(t.dueDate) < new Date() && t.status !== 'DONE' ? 'overdue' : ''}`}>
                            <HiOutlineClock style={{ marginRight: 2 }} />
                            {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {otherTasks.length > 0 && (
            <div>
              <h3 style={{ marginBottom: 12, fontWeight: 700 }}>Other Tasks ({otherTasks.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {otherTasks.map(t => (
                  <div key={t.id} className="task-card" onClick={() => navigate(`/projects/${t.projectId}`)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className={`task-priority ${t.priority.toLowerCase()}`}>{t.priority}</span>
                        <h4>{t.title}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.projectName}</span>
                      </div>
                      <span className={`role-badge ${t.status === 'DONE' ? 'admin' : 'member'}`} style={{ fontSize: '0.65rem' }}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Project</label>
                <select className="form-input" value={taskForm.projectId} onChange={e => setTaskForm({...taskForm, projectId: e.target.value})} required>
                  <option value="">Select a project...</option>
                  {projectList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input className="form-input" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Priority</label>
                  <select className="form-input" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input className="form-input" type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
