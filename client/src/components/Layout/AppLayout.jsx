import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useState } from 'react';

export default function AppLayout() {
  const navigate = useNavigate();

  const handleNewProject = () => {
    navigate('/projects?new=true');
  };

  return (
    <div className="app-layout">
      <Sidebar onNewProject={handleNewProject} />
      <div className="main-content">
        <Header />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
