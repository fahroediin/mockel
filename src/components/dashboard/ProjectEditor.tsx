import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { SchemaBuilder } from '../schema-builder/SchemaBuilder';
import { ArrowLeft, Save, Trash2, Play, FileText } from 'lucide-react';
import type { MockProject, Schema, GenerationConfig } from '../../types';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  baseEndpoint: z.string().min(1, 'Base endpoint is required').regex(/^\/.*/, 'Endpoint must start with /'),
});

interface ProjectEditorProps {
  project?: MockProject;
  onSave: (project: MockProject) => Promise<MockProject>;
  onCancel: () => void;
  onGenerateData: (projectId: string, schema: Schema, config: GenerationConfig) => Promise<void>;
  onTestEndpoint: (project: MockProject) => void;
}

export const ProjectEditor: React.FC<ProjectEditorProps> = ({
  project,
  onSave,
  onCancel,
  onGenerateData,
  onTestEndpoint,
}) => {
  // Get initial values from draft for new projects
  const getInitialValues = () => {
    if (project) {
      return {
        name: project.name,
        baseEndpoint: project.baseEndpoint,
      };
    }

    // Try to load draft for new projects
    try {
      const savedDraft = localStorage.getItem('projectEditorDraft');
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        return {
          name: draftData.name || '',
          baseEndpoint: draftData.baseEndpoint || '/api/',
        };
      }
    } catch (error) {
      console.error('Failed to load draft form data:', error);
    }

    return {
      name: '',
      baseEndpoint: '/api/',
    };
  };

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: getInitialValues(),
  });

  const [schema, setSchema] = useState<Schema>(
    project?.schema || {
      id: Date.now().toString(),
      name: 'Default Schema',
      fields: [],
    }
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>({
    recordCount: 10,
    includeNulls: false,
  });

  const projectName = watch('name') || 'Untitled';
  const baseEndpoint = watch('baseEndpoint') || '/api/custom';

  const [hasDraft, setHasDraft] = useState(false);

  // Create a stable identifier for fields to prevent unnecessary re-renders
  const fieldsIdentifier = useMemo(() => {
    return schema.fields.map(f => `${f.id}:${f.name}:${f.type}`).join('|');
  }, [schema.fields]);

  // Debounced auto-save to prevent excessive writes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only save if there's actual data to save (not default values)
      const hasRealData = projectName !== 'Untitled' || baseEndpoint !== '/api/custom' || schema.fields.length > 0;

      if (hasRealData) {
        try {
          const formData = {
            name: projectName,
            baseEndpoint,
            schema: {
              id: schema.id,
              name: schema.name,
              description: schema.description,
              fields: schema.fields
            },
            generationConfig
          };
          localStorage.setItem('projectEditorDraft', JSON.stringify(formData));
          setHasDraft(true);
        } catch (error) {
          console.error('Failed to save draft:', error);
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [projectName, baseEndpoint, fieldsIdentifier, generationConfig.recordCount, generationConfig.includeNulls]);

  // Load draft data on mount (only for new projects)
  useEffect(() => {
    if (!project) { // Only for new projects
      const savedDraft = localStorage.getItem('projectEditorDraft');
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);

          // Restore schema if it has fields
          if (draftData.schema && draftData.schema.fields && draftData.schema.fields.length > 0) {
            setSchema(draftData.schema);
          }

          // Restore generation config
          if (draftData.generationConfig) {
            setGenerationConfig(draftData.generationConfig);
          }
        } catch (error) {
          console.error('Failed to load draft data:', error);
        }
      }
    }
  }, [project]);

  const handleSave = async (data: z.infer<typeof projectSchema>) => {
    const updatedProject: MockProject = {
      id: project?.id || Date.now().toString(),
      name: data.name,
      baseEndpoint: data.baseEndpoint,
      schema,
      mockData: project?.mockData || [],
      createdAt: project?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await onSave(updatedProject);

    // Clear draft after successful save
    localStorage.removeItem('projectEditorDraft');
    setHasDraft(false);
  };

  const handleGenerateData = async () => {
    if (schema.fields.length === 0) {
      alert('Please add at least one field to the schema before generating data.');
      return;
    }

    setIsGenerating(true);
    try {
      let projectId = project?.id;

      // If this is a new project, save it first to get an ID
      if (!projectId) {
        // Validate form first
        const formValues = {
          name: watch('name') || 'Untitled Project',
          baseEndpoint: watch('baseEndpoint') || '/api/custom',
        };

        // Validate required fields
        if (!formValues.name || !formValues.baseEndpoint) {
          alert('Please fill in project name and base endpoint before generating data.');
          return;
        }

        const projectToSave: MockProject = {
          id: '', // Will be assigned by createProject
          name: formValues.name,
          baseEndpoint: formValues.baseEndpoint,
          schema,
          mockData: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const savedProject = await onSave(projectToSave);
        projectId = savedProject.id;
      }

      await onGenerateData(projectId, schema, generationConfig);
    } catch (error) {
      console.error('Failed to generate data:', error);
      alert('Failed to generate mock data. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getFullEndpointUrl = () => {
    const projectId = project?.id || 'new';
    const endpoint = (baseEndpoint || '').replace(/^\//, '');
    return `${window.location.origin}/api/mock/${projectId}/${endpoint}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {project ? 'Edit Project' : 'Create New Project'}
            </h1>
            {!project && hasDraft && (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                <FileText className="w-3 h-3" />
                Draft Saved
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {project && (
            <Button variant="outline" onClick={() => onTestEndpoint(project)}>
              <Play className="w-4 h-4 mr-2" />
              Test Endpoint
            </Button>
          )}
          <Button onClick={handleSubmit(handleSave)}>
            <Save className="w-4 h-4 mr-2" />
            Save Project
          </Button>
        </div>
      </div>

      {/* Project Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Project Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., E-commerce Products API"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="baseEndpoint">Base Endpoint</Label>
              <Input
                id="baseEndpoint"
                {...register('baseEndpoint')}
                placeholder="/api/products"
              />
              {errors.baseEndpoint && (
                <p className="text-red-500 text-sm mt-1">{errors.baseEndpoint.message}</p>
              )}
            </div>
          </div>

          {project && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Mock Endpoint URL:</h4>
              <div className="flex items-center gap-2">
                <code className="bg-white px-3 py-1 rounded border flex-1 text-sm">
                  {getFullEndpointUrl()}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(getFullEndpointUrl())}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schema Builder */}
      <SchemaBuilder schema={schema} onSchemaChange={setSchema} />

      {/* Data Generation */}
      {schema.fields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generate Mock Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="recordCount">Number of Records</Label>
                <Input
                  id="recordCount"
                  type="number"
                  min="1"
                  max="1000"
                  value={generationConfig.recordCount}
                  onChange={(e) =>
                    setGenerationConfig(prev => ({
                      ...prev,
                      recordCount: parseInt(e.target.value) || 10,
                    }))
                  }
                />
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  id="includeNulls"
                  checked={generationConfig.includeNulls}
                  onChange={(e) =>
                    setGenerationConfig(prev => ({
                      ...prev,
                      includeNulls: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <Label htmlFor="includeNulls">Include occasional null values</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleGenerateData}
                disabled={isGenerating || schema.fields.length === 0}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Generate {generationConfig.recordCount} Records
                  </>
                )}
              </Button>
            </div>

            {project?.mockData && project.mockData.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">
                  Data Generated Successfully
                </h4>
                <p className="text-green-700 text-sm">
                  {project.mockData.length} records are available at your mock endpoint.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data Preview */}
      {project?.mockData && project.mockData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Data Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-sm">
                {JSON.stringify(project.mockData.slice(0, 3), null, 2)}
                {project.mockData.length > 3 && (
                  <span className="text-gray-500">
                    {"\n\n... and " + (project.mockData.length - 3) + " more records"}
                  </span>
                )}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};