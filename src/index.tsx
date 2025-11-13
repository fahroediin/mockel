import { serve } from "bun";
import index from "./index.html";
import { mockService } from "./services/mockService";

// Configuration from environment variables
const config = {
  port: parseInt(process.env.PORT || "3001"),
  host: process.env.HOST || "localhost",
  nodeEnv: process.env.NODE_ENV || "development",
  apiVersion: process.env.API_VERSION || "1.0.0",
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "52428800"), // 50MB default
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(",") || ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"]
};

console.log(`📋 Server Configuration:`);
console.log(`   Port: ${config.port}`);
console.log(`   Host: ${config.host}`);
console.log(`   Environment: ${config.nodeEnv}`);
console.log(`   Max File Size: ${(config.maxFileSize / 1024 / 1024).toFixed(2)}MB`);
console.log(`   Allowed File Types: ${config.allowedFileTypes.join(", ")}`);

// In-memory storage that syncs with frontend localStorage
const projects = new Map();

// Helper functions for project storage
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const createProject = (name: string, baseEndpoint: string, schema?: any, mockData?: any[]) => {
  const project = {
    id: generateId(),
    name,
    baseEndpoint,
    schema: schema || {
      id: generateId(),
      name: `${name} Schema`,
      fields: []
    },
    mockData: mockData || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  projects.set(project.id, project);
  return project;
};

const getProject = (id: string) => projects.get(id);

const updateProject = (id: string, updates: any) => {
  const project = projects.get(id);
  if (!project) return null;

  const updatedProject = {
    ...project,
    ...updates,
    id,
    updatedAt: new Date().toISOString()
  };

  projects.set(id, updatedProject);
  return updatedProject;
};

const deleteProject = (id: string) => projects.delete(id);

const getAllProjects = () => Array.from(projects.values());

const server = serve({
  port: config.port,
  hostname: config.host,
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    // Projects API
    "/api/projects": {
      async GET(req) {
        return Response.json(getAllProjects());
      },
      async POST(req) {
        try {
          const projectData = await req.json();
          const newProject = createProject(projectData.name, projectData.baseEndpoint, projectData.schema, projectData.mockData);
          return Response.json(newProject, { status: 201 });
        } catch (error) {
          console.error('Create project error:', error);
          return Response.json({ error: "Failed to create project" }, { status: 500 });
        }
      },
    },

    "/api/projects/:id": {
      async GET(req) {
        const project = getProject(req.params.id);
        if (!project) {
          return Response.json({ error: "Project not found" }, { status: 404 });
        }
        return Response.json(project);
      },
      async PUT(req) {
        try {
          const updates = await req.json();
          const updatedProject = updateProject(req.params.id, updates);
          if (!updatedProject) {
            return Response.json({ error: "Project not found" }, { status: 404 });
          }
          return Response.json(updatedProject);
        } catch (error) {
          console.error('Update project error:', error);
          return Response.json({ error: "Failed to update project" }, { status: 500 });
        }
      },
      async DELETE(req) {
        const success = deleteProject(req.params.id);
        if (!success) {
          return Response.json({ error: "Project not found" }, { status: 404 });
        }
        return Response.json({ message: "Project deleted successfully" });
      },
    },

    // Generate mock data
    "/api/generate": {
      async POST(req) {
        try {
          const { schema, config } = await req.json();

          const mockData = mockService.generateMockData(schema, config);

          return Response.json({
            data: mockData,
            count: mockData.length,
            generatedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error('Generation error:', error);
          return Response.json({ error: "Failed to generate mock data" }, { status: 500 });
        }
      },
    },

    // Dynamic mock endpoints
    "/api/mock/:projectId/*": async req => {
      const projectId = req.params.projectId;
      const project = getProject(projectId);

      if (!project) {
        return Response.json({ error: "Mock endpoint not found" }, { status: 404 });
      }

      // Handle different HTTP methods
      switch (req.method) {
        case "GET":
          return Response.json({
            data: project.mockData || [],
            meta: {
              count: project.mockData?.length || 0,
              endpoint: project.baseEndpoint,
              projectId,
              generatedAt: project.updatedAt
            }
          });

        case "POST":
          try {
            const newRecord = await req.json();
            const updatedData = [...(project.mockData || []), { ...newRecord, id: Date.now().toString() }];

            const updatedProject = updateProject(projectId, {
              mockData: updatedData,
              updatedAt: new Date().toISOString()
            });

            if (!updatedProject) {
              return Response.json({ error: "Failed to update project" }, { status: 500 });
            }

            return Response.json(newRecord, { status: 201 });
          } catch (error) {
            return Response.json({ error: "Invalid JSON" }, { status: 400 });
          }

        case "PUT":
          try {
            const updatedRecord = await req.json();
            const recordId = updatedRecord.id;

            if (!recordId) {
              return Response.json({ error: "Record ID is required" }, { status: 400 });
            }

            const updatedData = (project.mockData || []).map(record =>
              record.id === recordId ? updatedRecord : record
            );

            const updatedProject = updateProject(projectId, {
              mockData: updatedData,
              updatedAt: new Date().toISOString()
            });

            if (!updatedProject) {
              return Response.json({ error: "Failed to update project" }, { status: 500 });
            }

            return Response.json(updatedRecord);
          } catch (error) {
            return Response.json({ error: "Invalid JSON" }, { status: 400 });
          }

        case "DELETE":
          // Clear all mock data
          const updatedProject = updateProject(projectId, {
            mockData: [],
            updatedAt: new Date().toISOString()
          });

          if (!updatedProject) {
            return Response.json({ error: "Failed to update project" }, { status: 500 });
          }

          return Response.json({ message: "All mock data cleared" });

        default:
          return Response.json({ error: "Method not allowed" }, { status: 405 });
      }
    },

    // Health check
    "/api/health": async () => {
      return Response.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        version: config.apiVersion,
        server: {
          port: config.port,
          host: config.host,
          environment: config.nodeEnv,
          uptime: process.uptime?.() || 0
        },
        config: {
          maxFileSize: config.maxFileSize,
          allowedFileTypes: config.allowedFileTypes
        }
      });
    },

    // Configuration endpoint
    "/api/config": async () => {
      return Response.json({
        server: {
          port: config.port,
          host: config.host,
          environment: config.nodeEnv
        },
        upload: {
          maxFileSize: config.maxFileSize,
          maxFileSizeMB: Math.round(config.maxFileSize / 1024 / 1024),
          allowedFileTypes: config.allowedFileTypes
        },
        api: {
          version: config.apiVersion,
          endpoints: {
            health: "/api/health",
            config: "/api/config",
            projects: "/api/projects",
            generate: "/api/generate"
          }
        }
      });
    },

    // Legacy hello endpoint
    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },

  // Error handling
  error(error) {
    console.error("Server error:", error);
    return new Response("Internal Server Error", { status: 500 });
  },
});

console.log(`\n🚀 Mock Data Generator API`);
console.log(`📊 Dashboard: http://${config.host}:${config.port}/`);
console.log(`🔧 API Health: http://${config.host}:${config.port}/api/health`);
console.log(`⚙️  Configuration: http://${config.host}:${config.port}/api/config`);
console.log(`\n📋 Environment: ${config.nodeEnv}`);
console.log(`🌐 Server running on ${config.host}:${config.port}`);
