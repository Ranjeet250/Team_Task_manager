import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { HiPlus, HiOutlineDotsHorizontal, HiOutlineClock, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi';

const STATUS_MAP = {
  TODO: { label: 'To Do', color: '#8b8b9e', dot: '#8b8b9e' },
  IN_PROGRESS: { label: 'In Progress', color: '#f59e0b', dot: '#f59e0b' },
  DONE: { label: 'Completed', color: '#22c55e', dot: '#22c55e' },
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedToId: '', status: 'TODO' });
  const [memberEmail, setMemberEmail] = useState('');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`),
      ]);
      setProject(pRes.data.project);
      setTasks(tRes.data.tasks);
      const membership = pRes.data.project.members.find(m => m.userId === user.id);
      setUserRole(membership?.role || null);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const isAdmin = userRole === 'ADMIN';

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/projects/${id}/tasks/${editingTask.id}`, taskForm);
      } else {
        await api.post(`/projects/${id}/tasks`, taskForm);
      }
      setShowTaskModal(false);
      setEditingTask(null);
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedToId: '', status: 'TODO' });
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/projects/${id}/tasks/${taskId}/status`, { status: newStatus });
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/projects/${id}/tasks/${taskId}`);
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      setMemberEmail('');
      setShowMemberModal(false);
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title, description: task.description || '',
      priority: task.priority, dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedToId: task.assignedToId || '', status: task.status,
    });
    setShowTaskModal(true);
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!project) return <div className="empty-state"><h3>Project not found</h3></div>;

  const grouped = { TODO: [], IN_PROGRESS: [], DONE: [] };
  tasks.forEach(t => { if (grouped[t.status]) grouped[t.status].push(t); });

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1 style={{ color: 'var(--accent)' }}>{project.name}</h1>
          <div className="page-desc">{project.description || 'No description'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="avatar-stack">
            {project.members.slice(0, 4).map((m, i) => (
              <div key={m.user.id} className="mini-avatar" style={{ background: ['#7c5cfc','#22c55e','#f59e0b','#3b82f6'][i % 4] }}>
                {m.user.name.charAt(0)}
              </div>
            ))}
            {project.members.length > 4 && <div className="mini-avatar" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>+{project.members.length - 4}</div>}
          </div>
          {isAdmin && <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)}>+ Add Member</button>}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {Object.entries(STATUS_MAP).map(([status, meta]) => (
          <div className="kanban-column" key={status}>
            <div className="kanban-header">
              <div className="col-title">
                <span className="col-dot" style={{ background: meta.dot }} />
                {meta.label}
                <span className="col-count">{grouped[status].length}</span>
              </div>
              <HiOutlineDotsHorizontal style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
            </div>
            <div className="kanban-body">
              {isAdmin && (
                <button className="kanban-add-btn" onClick={() => {
                  setEditingTask(null);
                  setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedToId: '', status });
                  setShowTaskModal(true);
                }}>+ Add Task</button>
              )}
              {grouped[status].map(task => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
                return (
                  <div key={task.id} className="task-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 4 }}>
                      <span className={`task-priority ${task.priority.toLowerCase()}`}>{task.priority === 'HIGH' ? 'High Priority' : task.priority}</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {isAdmin && <button className="btn-icon" style={{ width: 24, height: 24, fontSize: '0.7rem' }} onClick={() => openEditTask(task)}><HiOutlinePencil /></button>}
                        {isAdmin && <button className="btn-icon" style={{ width: 24, height: 24, fontSize: '0.7rem', color: 'var(--rose)' }} onClick={() => handleDeleteTask(task.id)}><HiOutlineTrash /></button>}
                      </div>
                    </div>
                    <h4>{task.title}</h4>
                    {task.description && <p className="task-desc">{task.description}</p>}
                    <div className="task-meta">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {task.assignedTo && (
                          <div className="mini-avatar" style={{ width: 22, height: 22, fontSize: '0.5rem', background: '#7c5cfc', marginLeft: 0 }}>
                            {task.assignedTo.name.charAt(0)}
                          </div>
                        )}
                        {task.dueDate && (
                          <span className={`task-date ${isOverdue ? 'overdue' : ''}`}>
                            <HiOutlineClock style={{ marginRight: 2 }} />
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {/* Status change dropdown for members */}
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 4, color: 'var(--text-secondary)', fontSize: '0.68rem', padding: '2px 4px', cursor: 'pointer' }}
                      >
                        <option value="TODO">Todo</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Team Section */}
      {project.members.length > 0 && (
        <div className="team-section">
          <div className="team-header-row">
            <div>
              <h2>Team Ecosystem</h2>
              <p className="team-desc">Manage roles, permissions, and operational bandwidth.</p>
            </div>
          </div>
          <table className="team-table">
            <thead><tr><th>Member</th><th>Role</th><th>Action</th></tr></thead>
            <tbody>
              {project.members.map(m => (
                <tr key={m.id}>
                  <td>
                    <div className="member-cell">
                      <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{m.user.name.charAt(0)}</div>
                      <div><div>{m.user.name}</div><div className="member-email">{m.user.email}</div></div>
                    </div>
                  </td>
                  <td><span className={`role-badge ${m.role.toLowerCase()}`}>{m.role.toLowerCase()}</span></td>
                  <td>
                    {isAdmin && m.userId !== project.ownerId && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(m.userId)}>Remove</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => { setShowTaskModal(false); setEditingTask(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingTask ? 'Edit Task' : 'Create Task'}</h2>
            <form onSubmit={handleCreateTask}>
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
              <div className="form-group">
                <label>Assign To</label>
                <select className="form-input" value={taskForm.assignedToId} onChange={e => setTaskForm({...taskForm, assignedToId: e.target.value})}>
                  <option value="">Unassigned</option>
                  {project.members.map(m => <option key={m.userId} value={m.userId}>{m.user.name}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowTaskModal(false); setEditingTask(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTask ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Email Address</label>
                <input className="form-input" type="email" placeholder="member@company.com" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
