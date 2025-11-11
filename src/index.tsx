import { serve } from "bun";
import index from "./index.html";
import { mockService } from "./services/mockService";

// In-memory storage for mock endpoints (in production, use a database)
const mockEndpoints = new Map();

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    // Projects API
    "/api/projects": {
      async GET(req) {
        return Response.json(Array.from(mockEndpoints.values()));
      },
      async POST(req) {
        try {
          const project = await req.json();
          const mockProject = {
            ...project,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          mockEndpoints.set(mockProject.id, mockProject);

          return Response.json(mockProject, { status: 201 });
        } catch (error) {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
      },
    },

    "/api/projects/:id": {
      async GET(req) {
        const project = mockEndpoints.get(req.params.id);
        if (!project) {
          return Response.json({ error: "Project not found" }, { status: 404 });
        }
        return Response.json(project);
      },
      async PUT(req) {
        try {
          const project = mockEndpoints.get(req.params.id);
          if (!project) {
            return Response.json({ error: "Project not found" }, { status: 404 });
          }

          const updates = await req.json();
          const updatedProject = {
            ...project,
            ...updates,
            id: req.params.id,
            updatedAt: new Date().toISOString()
          };

          mockEndpoints.set(req.params.id, updatedProject);
          return Response.json(updatedProject);
        } catch (error) {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
      },
      async DELETE(req) {
        const deleted = mockEndpoints.delete(req.params.id);
        if (!deleted) {
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
      const project = mockEndpoints.get(projectId);

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
            const updatedData = [...(project.mockData || []), newRecord];

            const updatedProject = {
              ...project,
              mockData: updatedData,
              updatedAt: new Date().toISOString()
            };

            mockEndpoints.set(projectId, updatedProject);

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

            const updatedProject = {
              ...project,
              mockData: updatedData,
              updatedAt: new Date().toISOString()
            };

            mockEndpoints.set(projectId, updatedProject);

            return Response.json(updatedRecord);
          } catch (error) {
            return Response.json({ error: "Invalid JSON" }, { status: 400 });
          }

        case "DELETE":
          // Clear all mock data
          const updatedProject = {
            ...project,
            mockData: [],
            updatedAt: new Date().toISOString()
          };

          mockEndpoints.set(projectId, updatedProject);

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
        version: "1.0.0"
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

console.log(`🚀 Mock Data Generator API running at ${server.url}`);
console.log(`📊 Dashboard: ${server.url}`);
console.log(`🔧 API Health: ${server.url}/api/health`);
