import React, { useState } from 'react';
import { ProjectList } from './components/dashboard/ProjectList';
import { ProjectEditor } from './components/dashboard/ProjectEditor';
import { useProjects, useDataGeneration } from './hooks/useApi';
import { MockProject, Schema, GenerationConfig } from './types';
import "./index.css";

type View = 'list' | 'editor' | 'viewer';

export function App() {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const { generateData } = useDataGeneration();
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
      if (selectedProject) {
        await updateProject(project.id, project);
      } else {
        await createProject(project);
      }
      setCurrentView('list');
      setSelectedProject(null);
    } catch (error) {
      console.error('Failed to save project:', error);
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
    const endpointUrl = `${window.location.origin}/api/mock/${project.id}/${project.baseEndpoint.replace(/^\//, '')}`;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Mock Data Generator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mock Data Generator</h1>
              <p className="text-sm text-gray-600">Create and manage mock APIs with dynamic data generation</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/api/health"
                target="_blank"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                API Health
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
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
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>Mock Data Generator - Create realistic test data for your applications</p>
            <p className="mt-1">Built with Bun + React</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
