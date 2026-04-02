import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ViewType } from './components/Sidebar';
import { DashboardView } from './pages/Dashboard';
import { TasksView } from './pages/Tasks';
import { LearningHubView } from './pages/LearningHub';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {currentView === 'dashboard' && <DashboardView />}
      {currentView === 'tasks' && <TasksView />}
      {currentView === 'learning' && <LearningHubView />}
    </Layout>
  );
}
