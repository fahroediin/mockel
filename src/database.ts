import { Database } from "bun:sqlite";

export class DatabaseManager {
  private db: Database;

  constructor(dbPath: string = "./mockel.db") {
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  private initializeTables() {
    // Create users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME DEFAULT (datetime('now', '+24 hours')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create projects table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        base_endpoint TEXT NOT NULL,
        schema TEXT NOT NULL,
        mock_data TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects (user_id)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users (username)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (token)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id)`);
  }

  // User Management
  async createUser(username: string, email: string, passwordHash: string) {
    const stmt = this.db.prepare(`
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
    `);

    return stmt.run(username, email, passwordHash);
  }

  async getUserById(id: number) {
    const stmt = this.db.prepare(`
      SELECT id, username, email, created_at, updated_at
      FROM users WHERE id = ?
    `);

    return stmt.get(id) as any;
  }

  async getUserByUsername(username: string) {
    const stmt = this.db.prepare(`
      SELECT id, username, email, password_hash, created_at, updated_at
      FROM users WHERE username = ?
    `);

    return stmt.get(username) as any;
  }

  async getUserByEmail(email: string) {
    const stmt = this.db.prepare(`
      SELECT id, username, email, password_hash, created_at, updated_at
      FROM users WHERE email = ?
    `);

    return stmt.get(email) as any;
  }

  // Project Management
  async createProject(userId: number, projectData: {
    id: string;
    name: string;
    baseEndpoint: string;
    schema: any;
    mockData?: any[];
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO projects (id, user_id, name, base_endpoint, schema, mock_data)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      projectData.id,
      userId,
      projectData.name,
      projectData.baseEndpoint,
      JSON.stringify(projectData.schema),
      JSON.stringify(projectData.mockData || [])
    );
  }

  async getProjectsByUserId(userId: number) {
    const stmt = this.db.prepare(`
      SELECT id, name, base_endpoint, schema, mock_data, created_at, updated_at
      FROM projects WHERE user_id = ? ORDER BY updated_at DESC
    `);

    const projects = stmt.all(userId) as any[];

    // Parse JSON fields with error handling
    return projects.map(project => {
      try {
        const schema = JSON.parse(project.schema);
        return {
          ...project,
          schema: {
            id: schema.id || 'default',
            name: schema.name || 'Default Schema',
            fields: schema.fields || []
          },
          mockData: JSON.parse(project.mock_data || '[]')
        };
      } catch (error) {
        console.error('Error parsing project schema:', error);
        return {
          ...project,
          schema: {
            id: 'default',
            name: 'Default Schema',
            fields: []
          },
          mockData: []
        };
      }
    });
  }

  async getProjectById(id: string, userId?: number) {
    let query = `
      SELECT id, name, base_endpoint, schema, mock_data, created_at, updated_at
      FROM projects WHERE id = ?
    `;
    const params = [id];

    if (userId) {
      query += ` AND user_id = ?`;
      params.push(userId.toString());
    }

    const stmt = this.db.prepare(query);
    const project = stmt.get(...params) as any;

    if (!project) return null;

    // Parse JSON fields with error handling
    try {
      const schema = JSON.parse(project.schema);
      return {
        ...project,
        schema: {
          id: schema.id || 'default',
          name: schema.name || 'Default Schema',
          fields: schema.fields || []
        },
        mockData: JSON.parse(project.mock_data || '[]')
      };
    } catch (error) {
      console.error('Error parsing project schema:', error);
      return {
        ...project,
        schema: {
          id: 'default',
          name: 'Default Schema',
          fields: []
        },
        mockData: []
      };
    }
  }

  async updateProject(id: string, userId: number, updates: {
    name?: string;
    baseEndpoint?: string;
    schema?: any;
    mockData?: any[];
  }) {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }

    if (updates.baseEndpoint !== undefined) {
      fields.push('base_endpoint = ?');
      values.push(updates.baseEndpoint);
    }

    if (updates.schema !== undefined) {
      fields.push('schema = ?');
      values.push(JSON.stringify(updates.schema));
    }

    if (updates.mockData !== undefined) {
      fields.push('mock_data = ?');
      values.push(JSON.stringify(updates.mockData));
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id, userId);

    const stmt = this.db.prepare(`
      UPDATE projects SET ${fields.join(', ')}
      WHERE id = ? AND user_id = ?
    `);

    return stmt.run(...values);
  }

  async deleteProject(id: string, userId: number) {
    const stmt = this.db.prepare(`
      DELETE FROM projects WHERE id = ? AND user_id = ?
    `);

    return stmt.run(id, userId);
  }

  // Session Management (simple token-based)
  async createUserSession(userId: number, token: string) {
    const insertStmt = this.db.prepare(`
      INSERT INTO sessions (token, user_id) VALUES (?, ?)
    `);

    return insertStmt.run(token, userId);
  }

  async getUserByToken(token: string) {
    const stmt = this.db.prepare(`
      SELECT u.id, u.username, u.email, u.created_at, u.updated_at
      FROM users u
      JOIN sessions s ON u.id = s.user_id
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `);

    return stmt.get(token) as any;
  }

  async deleteSession(token: string) {
    const stmt = this.db.prepare(`DELETE FROM sessions WHERE token = ?`);
    return stmt.run(token);
  }

  close() {
    this.db.close();
  }
}

// Singleton instance
export const db = new DatabaseManager();