import { MockProject, Schema, DataField } from '../types';

class DataStorage {
  private projects: MockProject[] = [];
  private currentProject: MockProject | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('mockProjects');
      if (stored) {
        this.projects = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load projects from storage:', error);
      this.projects = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('mockProjects', JSON.stringify(this.projects));
    } catch (error) {
      console.error('Failed to save projects to storage:', error);
    }
  }

  createProject(name: string, baseEndpoint: string): MockProject {
    const project: MockProject = {
      id: this.generateId(),
      name,
      baseEndpoint,
      schema: {
        id: this.generateId(),
        name: `${name} Schema`,
        fields: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.projects.push(project);
    this.currentProject = project;
    this.saveToStorage();

    return project;
  }

  getProjects(): MockProject[] {
    return this.projects;
  }

  getProject(id: string): MockProject | null {
    return this.projects.find(p => p.id === id) || null;
  }

  updateProject(id: string, updates: Partial<MockProject>): MockProject | null {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.projects[index] = {
      ...this.projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (this.currentProject?.id === id) {
      this.currentProject = this.projects[index];
    }

    this.saveToStorage();
    return this.projects[index];
  }

  deleteProject(id: string): boolean {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.projects.splice(index, 1);

    if (this.currentProject?.id === id) {
      this.currentProject = null;
    }

    this.saveToStorage();
    return true;
  }

  getCurrentProject(): MockProject | null {
    return this.currentProject;
  }

  setCurrentProject(project: MockProject): void {
    this.currentProject = project;
  }

  addFieldToProject(projectId: string, field: DataField): MockProject | null {
    const project = this.getProject(projectId);
    if (!project) return null;

    project.schema.fields.push(field);
    return this.updateProject(projectId, { schema: project.schema });
  }

  updateFieldInProject(projectId: string, fieldId: string, updates: Partial<DataField>): MockProject | null {
    const project = this.getProject(projectId);
    if (!project) return null;

    const fieldIndex = project.schema.fields.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) return null;

    project.schema.fields[fieldIndex] = {
      ...project.schema.fields[fieldIndex],
      ...updates
    };

    return this.updateProject(projectId, { schema: project.schema });
  }

  removeFieldFromProject(projectId: string, fieldId: string): MockProject | null {
    const project = this.getProject(projectId);
    if (!project) return null;

    project.schema.fields = project.schema.fields.filter(f => f.id !== fieldId);
    return this.updateProject(projectId, { schema: project.schema });
  }

  updateMockData(projectId: string, mockData: any[]): MockProject | null {
    return this.updateProject(projectId, { mockData });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const dataStorage = new DataStorage();