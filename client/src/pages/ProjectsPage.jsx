import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { HiPlus } from 'react-icons/hi';

const COLORS = ['#7c5cfc', '#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    if (searchParams.get('new') === 'true') setShowModal(true);
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.projects);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/projects', { name, description });
      setName(''); setDescription(''); setShowModal(false);
      fetchProjects();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setCreating(false); }
  };

  const getStatus = (progress) => {
    if (progress >= 70) return { label: 'On Track', cls: 'on-track' };
    if (progress >= 40) return { label: 'Reviewing', cls: 'at-risk' };
    return { label: 'Active', cls: 'at-risk' };
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1>Active Projects</h1>
          <div className="page-desc">Monitoring {projects.length} live workstreams.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><HiPlus /> New Project</button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Project</button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((p, i) => {
            const color = COLORS[i % COLORS.length];
            const status = getStatus(p.progress);
            const doneCount = p.completedTasks;
            const totalCount = p.totalTasks;
            return (
              <div key={p.id} className="card card-clickable project-card" onClick={() => navigate(`/projects/${p.id}`)}>
                <div className="project-icon" style={{ background: `${color}18`, color }}>{p.name.charAt(0).toUpperCase()}</div>
                <span className={`project-status ${status.cls}`}>{status.label}</span>
                <h3>{p.name}</h3>
                <p className="project-desc">{p.description || 'No description'}</p>
                <div className="progress-row"><span>Progress</span><span>{p.progress}%</span></div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.progress}%`, background: color }} /></div>
                <div className="project-footer">
                  <div className="avatar-stack">
                    {p.members.slice(0, 3).map((m, j) => (
                      <div key={m.user.id} className="mini-avatar" style={{ background: COLORS[(i + j + 1) % COLORS.length] }}>
                        {m.user.name.charAt(0)}
                      </div>
                    ))}
                    {p.members.length > 3 && <div className="mini-avatar" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>+{p.members.length - 3}</div>}
                  </div>
                  <span className="due-date">{totalCount} tasks</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name</label>
                <input className="form-input" placeholder="e.g. Nova Core Redesign" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" placeholder="Brief project description..." value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
