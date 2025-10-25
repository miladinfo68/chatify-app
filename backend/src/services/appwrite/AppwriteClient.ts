import { Client, TablesDB } from 'node-appwrite';

export class AppwriteClient {
  private static instance: AppwriteClient;
  private client: Client;
  private tablesDB: TablesDB;

  private constructor() {
    this.client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || '')
      .setKey(process.env.APPWRITE_API_KEY || '');

    this.tablesDB = new TablesDB(this.client);
  }

  public static getInstance(): AppwriteClient {
    if (!AppwriteClient.instance) {
      AppwriteClient.instance = new AppwriteClient();
    }
    return AppwriteClient.instance;
  }

  public getTablesDB(): TablesDB {
    return this.tablesDB;
  }

  // Helper method to get database ID from environment or use default
  public getDatabaseId(): string {
    return process.env.APPWRITE_DATABASE_ID || 'default';
  }
}

export default AppwriteClient;