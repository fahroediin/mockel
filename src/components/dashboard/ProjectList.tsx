import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, Play, Copy, Eye } from 'lucide-react';
import { MockProject } from '../../types';

interface ProjectListProps {
  projects: MockProject[];
  onSelectProject: (project: MockProject) => void;
  onCreateProject: () => void;
  onEditProject: (project: MockProject) => void;
  onDeleteProject: (projectId: string) => void;
  onTestEndpoint: (project: MockProject) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onSelectProject,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  onTestEndpoint,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mock API Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mock APIs yet</h3>
            <p className="text-gray-500 mb-4">Create your first mock API project to get started</p>
            <Button onClick={onCreateProject}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Mock API
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Mock API Projects</CardTitle>
          <Button onClick={onCreateProject}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-lg mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Endpoint: <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {project.baseEndpoint || 'N/A'}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(project.baseEndpoint || '')}
                    title="Copy endpoint URL"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onTestEndpoint(project)}
                    title="Test endpoint"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditProject(project)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteProject(project.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-sm">
                  <span className="text-gray-500">Fields:</span>
                  <span className="ml-2 font-medium">{project.schema?.fields?.length || 0}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Records:</span>
                  <span className="ml-2 font-medium">{project.mockData?.length || 0}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-2">
                    {project.mockData && project.mockData.length > 0 ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        No Data
                      </Badge>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Created: {formatDate(project.createdAt)}</span>
                <span>Updated: {formatDate(project.updatedAt)}</span>
              </div>

              <div className="mt-3 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectProject(project)}
                  className="w-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Configure Schema & Generate Data
                </Button>
              </div>
            </div>
          ))}
        </div>

        {projects.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Quick Access URLs</h4>
              <div className="space-y-2 text-sm">
                {projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <span className="text-blue-700 truncate flex-1 mr-2">
                      {window.location.origin}/api/mock/{project.id}/{(project.baseEndpoint || '').replace(/^\//, '')}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(
                        `${window.location.origin}/api/mock/${project.id}/${(project.baseEndpoint || '').replace(/^\//, '')}`
                      )}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};