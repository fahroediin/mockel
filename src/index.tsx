import { serve } from "bun";
import index from "./index.html";
import { mockService } from "./services/mockService";
import { db } from "./database";
import { AuthManager, createAuthMiddleware, getUserFromRequest } from "./auth";

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

console.log(`🗄️ Database: SQLite with User Management`);
console.log(`🔐 Authentication: Token-based Auth System`);

// Helper functions for project storage using database
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const createProject = async (userId: number, name: string, baseEndpoint: string, schema?: any, mockData?: any[]) => {
  const project = {
    id: generateId(),
    name,
    baseEndpoint,
    schema: schema || {
      id: generateId(),
      name: `${name} Schema`,
      fields: []
    },
    mockData: mockData || []
  };

  await db.createProject(userId, project);
  return project;
};

const getProject = async (id: string, userId: number) => {
  return await db.getProjectById(id, userId);
};

const updateProject = async (id: string, userId: number, updates: any) => {
  return await db.updateProject(id, userId, updates);
};

const deleteProject = async (id: string, userId: number) => {
  return await db.deleteProject(id, userId);
};

const getAllProjects = async (userId: number) => {
  return await db.getProjectsByUserId(userId);
};

const server = serve({
  port: config.port,
  hostname: config.host,
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    // Authentication endpoints
    "/api/auth/register": {
      async POST(req) {
        try {
          const { username, email, password } = await req.json();

          if (!username || !email || !password) {
            return Response.json({ error: "Username, email, and password are required" }, { status: 400 });
          }

          const result = await AuthManager.register(username, email, password);
          return Response.json(result, { status: 201 });
        } catch (error: any) {
          console.error('Registration error:', error);
          return Response.json({ error: error.message || "Failed to register user" }, { status: 400 });
        }
      },
    },

    "/api/auth/login": {
      async POST(req) {
        try {
          const { username, password } = await req.json();

          if (!username || !password) {
            return Response.json({ error: "Username and password are required" }, { status: 400 });
          }

          const result = await AuthManager.login(username, password);
          return Response.json(result);
        } catch (error: any) {
          console.error('Login error:', error);
          return Response.json({ error: error.message || "Failed to login" }, { status: 401 });
        }
      },
    },

    "/api/auth/logout": {
      async POST(req) {
        try {
          const authHeader = req.headers.get('authorization');
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return Response.json({ error: "No token provided" }, { status: 401 });
          }

          const token = authHeader.substring(7);
          await AuthManager.logout(token);
          return Response.json({ message: "Logged out successfully" });
        } catch (error: any) {
          console.error('Logout error:', error);
          return Response.json({ error: "Failed to logout" }, { status: 500 });
        }
      },
    },

    "/api/auth/me": {
      async GET(req) {
        try {
          const authHeader = req.headers.get('authorization');
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return Response.json({ error: "No token provided" }, { status: 401 });
          }

          const token = authHeader.substring(7);
          const user = await AuthManager.validateToken(token);

          if (!user) {
            return Response.json({ error: "Invalid or expired token" }, { status: 401 });
          }

          return Response.json({ user });
        } catch (error: any) {
          console.error('Get user error:', error);
          return Response.json({ error: "Failed to get user" }, { status: 500 });
        }
      },
    },

    // Protected Projects API
    "/api/projects": {
      async GET(req) {
        try {
          const authHeader = req.headers.get('authorization');
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return Response.json({ error: "Authentication required" }, { status: 401 });
          }

          const token = authHeader.substring(7);
          const user = await AuthManager.validateToken(token);

          if (!user) {
            return Response.json({ error: "Invalid or expired token" }, { status: 401 });
          }

          const projects = await getAllProjects(user.id);
          return Response.json(projects);
        } catch (error: any) {
          console.error('Get projects error:', error);
          return Response.json({ error: "Failed to get projects" }, { status: 500 });
        }
      },

      async POST(req) {
        try {
          const authHeader = req.headers.get('authorization');
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return Response.json({ error: "Authentication required" }, { status: 401 });
          }

          const token = authHeader.substring(7);
          const user = await AuthManager.validateToken(token);

          if (!user) {
            return Response.json({ error: "Invalid or expired token" }, { status: 401 });
          }

          const projectData = await req.json();
          const newProject = await createProject(user.id, projectData.name, projectData.baseEndpoint, projectData.schema, projectData.mockData);
          return Response.json(newProject, { status: 201 });
        } catch (error: any) {
          console.error('Create project error:', error);
          return Response.json({ error: "Failed to create project" }, { status: 500 });
        }
      },
    },

    "/api/projects/:id": {
      async GET(req) {
        try {
          const authHeader = req.headers.get('authorization');
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return Response.json({ error: "Authentication required" }, { status: 401 });
          }

          const token = authHeader.substring(7);
          const user = await AuthManager.validateToken(token);

          if (!user) {
            return Response.json({ error: "Invalid or expired token" }, { status: 401 });
          }

          const project = await getProject(req.params.id, user.id);
          if (!project) {
            return Response.json({ error: "Project not found" }, { status: 404 });
          }
          return Response.json(project);
        } catch (error: any) {
          console.error('Get project error:', error);
          return Response.json({ error: "Failed to get project" }, { status: 500 });
        }
      },

      async PUT(req) {
        try {
          const authHeader = req.headers.get('authorization');
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return Response.json({ error: "Authentication required" }, { status: 401 });
          }

          const token = authHeader.substring(7);
          const user = await AuthManager.validateToken(token);

          if (!user) {
            return Response.json({ error: "Invalid or expired token" }, { status: 401 });
          }

          const updates = await req.json();
          const updatedProject = await updateProject(req.params.id, user.id, updates);
          if (!updatedProject) {
            return Response.json({ error: "Project not found" }, { status: 404 });
          }
          return Response.json(updatedProject);
        } catch (error: any) {
          console.error('Update project error:', error);
          return Response.json({ error: "Failed to update project" }, { status: 500 });
        }
      },

      async DELETE(req) {
        try {
          const authHeader = req.headers.get('authorization');
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return Response.json({ error: "Authentication required" }, { status: 401 });
          }

          const token = authHeader.substring(7);
          const user = await AuthManager.validateToken(token);

          if (!user) {
            return Response.json({ error: "Invalid or expired token" }, { status: 401 });
          }

          const result = await deleteProject(req.params.id, user.id);
          if (!result.changes) {
            return Response.json({ error: "Project not found" }, { status: 404 });
          }
          return Response.json({ message: "Project deleted successfully" });
        } catch (error: any) {
          console.error('Delete project error:', error);
          return Response.json({ error: "Failed to delete project" }, { status: 500 });
        }
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

    // Dynamic mock endpoints (Public read access, Authenticated write access)
    "/api/mock/:projectId/*": async req => {
      const projectId = req.params.projectId;

      try {
        // First try to get project without auth for public read access
        let project = await db.getProjectById(projectId);

        if (!project) {
          return Response.json({ error: "Mock endpoint not found" }, { status: 404 });
        }

        // For write operations, require authentication and ownership
        if (req.method !== "GET") {
          const authHeader = req.headers.get('authorization');
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return Response.json({ error: "Authentication required" }, { status: 401 });
          }

          const token = authHeader.substring(7);
          const user = await AuthManager.validateToken(token);

          if (!user) {
            return Response.json({ error: "Invalid or expired token" }, { status: 401 });
          }

          // Verify ownership
          const userProject = await db.getProjectById(projectId, user.id);
          if (!userProject) {
            return Response.json({ error: "Project not found or access denied" }, { status: 403 });
          }

          project = userProject;
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
                generatedAt: project.updatedAt || project.updated_at
              }
            });

          case "POST":
            try {
              const authHeader = req.headers.get('authorization');
              const token = authHeader.substring(7);
              const user = await AuthManager.validateToken(token);

              const newRecord = await req.json();
              const updatedData = [...(project.mockData || []), { ...newRecord, id: Date.now().toString() }];

              const updatedProject = await updateProject(projectId, user.id, {
                mockData: updatedData
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
              const authHeader = req.headers.get('authorization');
              const token = authHeader.substring(7);
              const user = await AuthManager.validateToken(token);

              const updatedRecord = await req.json();
              const recordId = updatedRecord.id;

              if (!recordId) {
                return Response.json({ error: "Record ID is required" }, { status: 400 });
              }

              const updatedData = (project.mockData || []).map(record =>
                record.id === recordId ? updatedRecord : record
              );

              const updatedProject = await updateProject(projectId, user.id, {
                mockData: updatedData
              });

              if (!updatedProject) {
                return Response.json({ error: "Failed to update project" }, { status: 500 });
              }

              return Response.json(updatedRecord);
            } catch (error) {
              return Response.json({ error: "Invalid JSON" }, { status: 400 });
            }

          case "DELETE":
            try {
              const authHeader = req.headers.get('authorization');
              const token = authHeader.substring(7);
              const user = await AuthManager.validateToken(token);

              // Clear all mock data
              const updatedProject = await updateProject(projectId, user.id, {
                mockData: []
              });

              if (!updatedProject) {
                return Response.json({ error: "Failed to update project" }, { status: 500 });
              }

              return Response.json({ message: "All mock data cleared" });
            } catch (error) {
              return Response.json({ error: "Failed to clear data" }, { status: 500 });
            }

          default:
            return Response.json({ error: "Method not allowed" }, { status: 405 });
        }
      } catch (error: any) {
        console.error('Mock endpoint error:', error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
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
