import { db } from "./database";
import { createHash, randomBytes } from "crypto";

export class AuthManager {
  // Password hashing
  static hashPassword(password: string): string {
    return createHash('sha256').update(password + 'mockel-salt').digest('hex');
  }

  static verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  // Token generation
  static generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  // Session management
  static async createSession(userId: number): Promise<string> {
    const token = this.generateToken();
    await db.createUserSession(userId, token);
    return token;
  }

  static async validateToken(token: string): Promise<any> {
    if (!token) return null;
    return await db.getUserByToken(token);
  }

  static async logout(token: string): Promise<void> {
    await db.deleteSession(token);
  }

  // User registration and login
  static async register(username: string, email: string, password: string) {
    // Check if user already exists
    const existingUser = await db.getUserByUsername(username) || await db.getUserByEmail(email);
    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    const passwordHash = this.hashPassword(password);
    const result = await db.createUser(username, email, passwordHash);

    const user = await db.getUserById(result.lastInsertRowid as number);
    if (!user) {
      throw new Error('Failed to create user');
    }

    return {
      user,
      token: await this.createSession(user.id)
    };
  }

  static async login(username: string, password: string) {
    const user = await db.getUserByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    if (!this.verifyPassword(password, user.password_hash)) {
      throw new Error('Invalid username or password');
    }

    const token = await this.createSession(user.id);

    // Remove password hash from user object
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }
}

// Middleware for authentication
export function createAuthMiddleware() {
  return async (req: any) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'No token provided' };
    }

    const token = authHeader.substring(7);
    const user = await AuthManager.validateToken(token);

    if (!user) {
      return { user: null, error: 'Invalid or expired token' };
    }

    return { user, error: null };
  };
}

// Helper to get user from request
export function getUserFromRequest(req: any): any {
  return req.user;
}