import React, { useState } from 'react';
import { ProjectList } from './components/dashboard/ProjectList';
import { ProjectEditor } from './components/dashboard/ProjectEditor';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { useProjects, useDataGeneration } from './hooks/useApi';
import { useAuth } from './contexts/AuthContext';
import { dataStorage } from './data/storage';
import type { MockProject, Schema, GenerationConfig } from './types';
import "./index.css";

type View = 'list' | 'editor' | 'viewer' | 'login' | 'register';

export function App() {
  const { projects, loading, createProject, updateProject, deleteProject, fetchProjects } = useProjects();
  const { generateData } = useDataGeneration();
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedProject, setSelectedProject] = useState<MockProject | null>(null);

  const handleCreateProject = () => {
    setSelectedProject(null);
    setCurrentView('editor');
  };

  const handleEditProject = (project: MockProject) => {
    setSelectedProject(project);
    setCurrentView('editor');
  };

  const handleSaveProject = async (project: MockProject) => {
    try {
      let savedProject: MockProject;

      if (selectedProject) {
        // Update existing project
        savedProject = await updateProject(project.id, project);
      } else {
        // Create new project with all data in one call
        savedProject = await createProject({
          name: project.name,
          baseEndpoint: project.baseEndpoint,
          schema: project.schema,
          mockData: project.mockData || []
        });
      }

      setCurrentView('list');
      setSelectedProject(null);
      return savedProject;
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleGenerateData = async (projectId: string, schema: Schema, config: GenerationConfig) => {
    try {
      const mockData = await generateData(schema, config);
      await updateProject(projectId, { mockData });
    } catch (error) {
      console.error('Failed to generate data:', error);
      throw error;
    }
  };

  const handleTestEndpoint = (project: MockProject) => {
    const endpointUrl = `${window.location.origin}/api/mock/${project.id}/${(project.baseEndpoint || '').replace(/^\//, '')}`;
    window.open(endpointUrl, '_blank');
  };

  const handleSelectProject = (project: MockProject) => {
    setSelectedProject(project);
    setCurrentView('editor');
  };

  const handleCancelEdit = () => {
    setCurrentView('list');
    setSelectedProject(null);
  };

  const handleLogout = () => {
    logout();
    setCurrentView('list');
    setSelectedProject(null);
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold mb-2">Mockel</h2>
          <p className="text-blue-100">Loading Professional Mock Data Generator...</p>
        </div>
      </div>
    );
  }

  // Show login/register pages if not authenticated
  if (!isAuthenticated) {
    if (window.location.pathname === '/register') {
      return <RegisterPage />;
    }
    return <LoginPage />;
  }

  // Main app content for authenticated users
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold mb-2">Mockel</h2>
          <p className="text-blue-100">Loading Projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="app-container min-h-screen">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">M</span>
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Mockel</h1>
                </div>
                <p className="text-gray-600 font-medium">Professional Mock Data Generator & API Builder</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <a
                  href="/api/health"
                  target="_blank"
                  className="text-sm bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200/50 text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  API Health
                </a>
                <button
                  onClick={handleLogout}
                  className="text-sm bg-red-500/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-red-200/50 text-white hover:bg-red-600 transition-colors duration-200 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {currentView === 'list' && (
          <ProjectList
            projects={projects}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
            onTestEndpoint={handleTestEndpoint}
          />
        )}

        {currentView === 'editor' && (
          <ProjectEditor
            project={selectedProject}
            onSave={handleSaveProject}
            onCancel={handleCancelEdit}
            onGenerateData={handleGenerateData}
            onTestEndpoint={handleTestEndpoint}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-sm border-t border-gray-200/50 mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
              <span className="font-semibold text-gray-700">Mockel</span>
            </div>
            <p className="text-sm mb-2">Professional Mock Data Generator & API Builder</p>
            <p className="text-xs text-gray-500">Built with Bun + React + TypeScript</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}

export default App;
