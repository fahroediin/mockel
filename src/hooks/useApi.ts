import { useState, useEffect } from 'react';
import { MockProject, Schema, GenerationConfig } from '../types';

const API_BASE = '/api';

export const useProjects = () => {
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/projects`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
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
      const response = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const newProject = await response.json();
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<MockProject>) => {
    try {
      const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const updatedProject = await response.json();
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      return updatedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
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

      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schema, config }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate data');
      }

      const result = await response.json();
      return result.data;
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

      const response = await fetch(`${API_BASE}/mock/${projectId}/${endpoint.replace(/^\//, '')}`);

      if (!response.ok) {
        throw new Error('Failed to fetch mock data');
      }

      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (endpoint: string, record: any) => {
    try {
      const response = await fetch(`${API_BASE}/mock/${projectId}/${endpoint.replace(/^\//, '')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      });

      if (!response.ok) {
        throw new Error('Failed to add record');
      }

      const newRecord = await response.json();
      setData(prev => [...prev, newRecord]);
      return newRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const updateRecord = async (endpoint: string, record: any) => {
    try {
      const response = await fetch(`${API_BASE}/mock/${projectId}/${endpoint.replace(/^\//, '')}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      });

      if (!response.ok) {
        throw new Error('Failed to update record');
      }

      const updatedRecord = await response.json();
      setData(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
      return updatedRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const clearAllData = async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE}/mock/${projectId}/${endpoint.replace(/^\//, '')}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear data');
      }

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