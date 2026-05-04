import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineViewGrid, HiOutlineFolder, HiOutlineClipboardList, HiOutlineUserGroup, HiOutlineQuestionMarkCircle, HiOutlineLogout, HiPlus } from 'react-icons/hi';

export default function Sidebar({ onNewProject }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">E</div>
        <div>
          <div className="brand-name">Ethara AI</div>
          <div className="brand-tag">Enterprise</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          <HiOutlineViewGrid className="nav-icon" /> Dashboard
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => isActive ? 'active' : ''}>
          <HiOutlineFolder className="nav-icon" /> Projects
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => isActive ? 'active' : ''}>
          <HiOutlineClipboardList className="nav-icon" /> Tasks
        </NavLink>
        <NavLink to="/team" className={({ isActive }) => isActive ? 'active' : ''}>
          <HiOutlineUserGroup className="nav-icon" /> Team
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <button className="btn-new-project" onClick={onNewProject}>
          <HiPlus /> New Project
        </button>
        <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
          <HiOutlineLogout /> Logout
        </a>
      </div>
    </aside>
  );
}
