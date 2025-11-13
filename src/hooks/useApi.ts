import { useState, useEffect } from 'react';
import type { MockProject, Schema, GenerationConfig } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { mockService } from '../services/mockService';

export const useProjects = () => {
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects', {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
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
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.statusText}`);
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
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update project: ${response.statusText}`);
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
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to delete project: ${response.statusText}`);
      }

      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token]);

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
  const { token } = useAuth();

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const fetchData = async (endpoint: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/mock/${projectId}/${endpoint}`, {
        headers: token ? getAuthHeaders() : {}
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
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
      const response = await fetch(`/api/mock/${projectId}/${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(record)
      });

      if (!response.ok) {
        throw new Error(`Failed to add record: ${response.statusText}`);
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
      const response = await fetch(`/api/mock/${projectId}/${endpoint}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(record)
      });

      if (!response.ok) {
        throw new Error(`Failed to update record: ${response.statusText}`);
      }

      const updatedRecord = await response.json();
      setData(prev => prev.map(r => r.id === record.id ? updatedRecord : r));
      return updatedRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const clearAllData = async (endpoint: string) => {
    try {
      const response = await fetch(`/api/mock/${projectId}/${endpoint}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to clear data: ${response.statusText}`);
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