import { useState, useEffect } from 'react';
import type { MockProject, Schema, GenerationConfig } from '../types';
import { dataStorage } from '../data/storage';
import { mockService } from '../services/mockService';

export const useProjects = () => {
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = dataStorage.getProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Omit<MockProject, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProject = dataStorage.createProject(
        projectData.name,
        projectData.baseEndpoint,
        projectData.schema,
        projectData.mockData
      );
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<MockProject>) => {
    try {
      const updatedProject = dataStorage.updateProject(id, updates);
      if (!updatedProject) {
        throw new Error('Project not found');
      }
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      return updatedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const success = dataStorage.deleteProject(id);
      if (!success) {
        throw new Error('Project not found');
      }
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};

export const useDataGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateData = async (schema: Schema, config: GenerationConfig) => {
    try {
      setLoading(true);
      setError(null);

      const data = mockService.generateMockData(schema, config);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateData,
    loading,
    error,
  };
};

export const useMockEndpoint = (projectId: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (endpoint: string) => {
    try {
      setLoading(true);
      setError(null);

      const project = dataStorage.getProject(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      setData(project.mockData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (endpoint: string, record: any) => {
    try {
      const project = dataStorage.getProject(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const newRecord = { ...record, id: Date.now().toString() };
      const updatedData = [...(project.mockData || []), newRecord];

      dataStorage.updateMockData(projectId, updatedData);
      setData(updatedData);
      return newRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const updateRecord = async (endpoint: string, record: any) => {
    try {
      const project = dataStorage.getProject(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const updatedData = (project.mockData || []).map(r =>
        r.id === record.id ? record : r
      );

      dataStorage.updateMockData(projectId, updatedData);
      setData(updatedData);
      return record;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const clearAllData = async (endpoint: string) => {
    try {
      dataStorage.updateMockData(projectId, []);
      setData([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    fetchData,
    addRecord,
    updateRecord,
    clearAllData,
  };
};