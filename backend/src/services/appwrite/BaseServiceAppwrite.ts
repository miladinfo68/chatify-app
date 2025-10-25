import { TablesDB, ID, type Models, Query } from 'node-appwrite';
import AppwriteClient from './AppwriteClient.js';

export interface IBaseServiceAppwrite<T extends Models.Row> {
  create(data: Omit<T, keyof Models.Row>): Promise<T>;
  get(rowId: string): Promise<T>;
  list(queries?: string[]): Promise<Models.RowList<T>>;
  update(rowId: string, data: Partial<Omit<T, keyof Models.Row>>): Promise<T>;
  delete(rowId: string): Promise<boolean>;
  listWithPagination(queries?: string[], cursor?: string, limit?: number): Promise<Models.RowList<T>>;
}

export abstract class BaseServiceAppwrite<T extends Models.Row> 
implements IBaseServiceAppwrite<T> {
  
  protected readonly databaseId: string;
  protected readonly tableId: string; 
  protected tablesDB: TablesDB; 

  constructor(tableId: string, databaseId?: string) {
    const appwriteClient = AppwriteClient.getInstance();
    this.tablesDB = appwriteClient.getTablesDB();
    this.databaseId = databaseId || appwriteClient.getDatabaseId();
    this.tableId = tableId;
  }

  async create(data: Omit<T, keyof Models.Row>): Promise<T> {
    try {
      const row = await this.tablesDB.createRow<T>({
        databaseId: this.databaseId,
        tableId: this.tableId,
        rowId: ID.unique(),
        data: data as any
      });
      return row;
    } catch (error) {
      console.error('Create error:', error);
      throw error;
    }
  }

  async get(rowId: string): Promise<T> {
    try {
      const row = await this.tablesDB.getRow<T>({
        databaseId: this.databaseId,
        tableId: this.tableId,
        rowId
      });
      return row;
    } catch (error) {
      console.error('Get error:', error);
      throw error;
    }
  }

  async list(queries: string[] = []): Promise<Models.RowList<T>> {
    try {
      const result = await this.tablesDB.listRows<T>({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries
      });
      return result;
    } catch (error) {
      console.error('List error:', error);
      throw error;
    }
  }

  async update(rowId: string, data: Partial<Omit<T, keyof Models.Row>>): Promise<T> {
    try {
      const row = await this.tablesDB.updateRow<T>({
        databaseId: this.databaseId,
        tableId: this.tableId,
        rowId,
        data: data as any
      });
      return row;
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  }

  async delete(rowId: string): Promise<boolean> {
    try {
      await this.tablesDB.deleteRow({
        databaseId: this.databaseId,
        tableId: this.tableId,
        rowId
      });
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }

  async listWithPagination(
    queries: string[] = [], 
    cursor?: string, 
    limit: number = 25
  ): Promise<Models.RowList<T>> {
    try {
      const paginationQueries = [
        ...queries,
        Query.limit(limit),
        ...(cursor ? [Query.cursorAfter(cursor)] : [])
      ];

      const result = await this.tablesDB.listRows<T>({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries: paginationQueries
      });
      return result;
    } catch (error) {
      console.error('List with pagination error:', error);
      throw error;
    }
  }

  // Helper method to create query for filtering
  protected createEqualQuery(attribute: string, value: any): string {
    return Query.equal(attribute, value);
  }

  protected createNotEqualQuery(attribute: string, value: any): string {
    return Query.notEqual(attribute, value);
  }

  protected createLessThanQuery(attribute: string, value: any): string {
    return Query.lessThan(attribute, value);
  }

  protected createGreaterThanQuery(attribute: string, value: any): string {
    return Query.greaterThan(attribute, value);
  }
}


// @@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@


// Deprecated (Databases API)	New (TablesDB API)
// Collection	                Table
// Document	                    Row
// Attribute	                Column
// createDocument()	            createRow()
// listDocuments()	            listRows()
// updateDocument()	            updateRow()
// deleteDocument()	            deleteRow()
// getDocument()	            getRow()


// @@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@



// import { Databases, ID, type Models } from 'node-appwrite';

// export abstract class AppWriteBaseService<T extends Models.Document> 
// implements IAppWriteBaseService<T> {
//   protected readonly databaseId: string;
//   protected readonly collectionId: string;
//   protected databases: Databases;

//   constructor(databases: Databases, databaseId: string, collectionId: string) {
//     this.databases = databases;
//     this.databaseId = databaseId;
//     this.collectionId = collectionId;
//   }

//   async create(data: Omit<T, keyof Models.Document>): Promise<T> {
//     try {
//       const document = await this.databases.createDocument<T>(
//         this.databaseId,
//         this.collectionId,
//         ID.unique(),
//         data as any
//       );
//       return document;
//     } catch (error) {
//       console.error('Create error:', error);
//       throw error;
//     }
//   }

//   async get(documentId: string): Promise<T> {
//     try {
//       const document = await this.databases.getDocument<T>(
//         this.databaseId,
//         this.collectionId,
//         documentId
//       );
//       return document;
//     } catch (error) {
//       console.error('Get error:', error);
//       throw error;
//     }
//   }

//   async list(queries: string[] = []): Promise<Models.DocumentList<T>> {
//     try {
//       const result = await this.databases.listDocuments<T>(
//         this.databaseId,
//         this.collectionId,
//         queries
//       );
//       return result;
//     } catch (error) {
//       console.error('List error:', error);
//       throw error;
//     }
//   }

//   async update(documentId: string, data: Partial<Omit<T, keyof Models.Document>>): Promise<T> {
//     try {
//       const document = await this.databases.updateDocument<T>(
//         this.databaseId,
//         this.collectionId,
//         documentId,
//         data as any
//       );
//       return document;
//     } catch (error) {
//       console.error('Update error:', error);
//       throw error;
//     }
//   }

//   async delete(documentId: string): Promise<boolean> {
//     try {
//       await this.databases.deleteDocument(this.databaseId, this.collectionId, documentId);
//       return true;
//     } catch (error) {
//       console.error('Delete error:', error);
//       throw error;
//     }
//   }
// }

// //@@@@@@@@@@@@@@@@@@@
// //@@@@@@@@@@@@@@@@@@@
// //@@@@@@@@@@@@@@@@@@@

// export interface IAppWriteBaseService<T extends Models.Document> {
//   create(data: Omit<T, keyof Models.Document>): Promise<T>;
//   get(documentId: string): Promise<T>;
//   list(queries?: string[]): Promise<Models.DocumentList<T>>;
//   update(documentId: string, data: Partial<Omit<T, keyof Models.Document>>): Promise<T>;
//   delete(documentId: string): Promise<boolean>;
// }