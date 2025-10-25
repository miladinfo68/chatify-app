import { BaseServiceAppwrite } from './BaseServiceAppwrite.js';
import { Models, Query } from 'node-appwrite';

export interface User extends Models.Row {
  name: string;
  email: string;
  mobile: number;
  status: 'active' | 'inactive';
  role: 'admin' | 'user' | 'moderator';
  createdAt: string;
}

export class UserService extends BaseServiceAppwrite<User> {
  constructor() {
    super('users'); // 'users' is the table ID
  }

  async getByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.list([
        this.createEqualQuery('email', email)
      ]);
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Get by email error:', error);
      throw error;
    }
  }

  async getActiveUsers(): Promise<User[]> {
    try {
      const result = await this.list([
        this.createEqualQuery('status', 'active')
      ]);
      
      return result.rows;
    } catch (error) {
      console.error('Get active users error:', error);
      throw error;
    }
  }

  async getUsersByRole(role: User['role']): Promise<User[]> {
    try {
      const result = await this.list([
        this.createEqualQuery('role', role)
      ]);
      
      return result.rows;
    } catch (error) {
      console.error('Get users by role error:', error);
      throw error;
    }
  }

  async searchUsersByName(name: string): Promise<User[]> {
    try {
      const result = await this.list([
        Query.search('name', name)
      ]);
      
      return result.rows;
    } catch (error) {
      console.error('Search users by name error:', error);
      throw error;
    }
  }
}