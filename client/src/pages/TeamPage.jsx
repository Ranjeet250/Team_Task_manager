import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { HiPlus } from 'react-icons/hi';

export default function TeamPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.projects);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  // Collect unique members across all projects
  const memberMap = new Map();
  projects.forEach(p => {
    p.members.forEach(m => {
      if (!memberMap.has(m.user.id)) {
        memberMap.set(m.user.id, { ...m.user, roles: [] });
      }
      memberMap.get(m.user.id).roles.push({ project: p.name, role: m.role });
    });
  });
  const allMembers = Array.from(memberMap.values());

  return (
    <div>
      <div className="page-header">
        <h1>Team Ecosystem</h1>
        <div className="page-desc">Manage roles, permissions, and operational bandwidth.</div>
      </div>

      {allMembers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No team members</h3>
          <p>Add members to your projects to see them here</p>
        </div>
      ) : (
        <table className="team-table">
          <thead>
            <tr><th>Member</th><th>Role</th><th>Projects</th></tr>
          </thead>
          <tbody>
            {allMembers.map(m => (
              <tr key={m.id}>
                <td>
                  <div className="member-cell">
                    <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{m.name.charAt(0)}</div>
                    <div><div>{m.name}</div><div className="member-email">{m.email}</div></div>
                  </div>
                </td>
                <td>
                  {m.roles.map((r, i) => (
                    <span key={i} className={`role-badge ${r.role.toLowerCase()}`} style={{ marginRight: 4 }}>{r.role.toLowerCase()}</span>
                  ))}
                </td>
                <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {m.roles.map(r => r.project).join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
