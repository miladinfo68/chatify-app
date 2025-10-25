// src/services/BaseService.ts

import { Model, Document, FilterQuery, UpdateQuery } from "mongoose";

export abstract class BaseService<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  // 👉 Public method: Insert many documents
  async insertMany(data: Array<Partial<T>>): Promise<T[]> {
    try {
      const result = await this.model.insertMany(data, { ordered: false });
      return result as unknown as T[]; // 🔥 Fix: Type assertion
    } catch (error) {
      throw new Error(
        `Error inserting multiple documents: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  // 👉 Public method: Remove many documents (by filter)
  async deleteMany(filters: FilterQuery<T> = {}): Promise<number> {
    try {
      const result = await this.model.deleteMany(filters).exec();
      return result.deletedCount ?? 0;
    } catch (error) {
      throw new Error(
        `Error deleting multiple documents: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  // 👉 Existing: Single create
  async create(data: Partial<T>): Promise<T> {
    try {
      return await this.model.create(data);
    } catch (error) {
      throw new Error(
        `Error creating document: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  // 👉 Existing: Find all
  async findAll(
    filters: FilterQuery<T> = {},
    limit: number = 50,
    sort?: Record<string, 1 | -1>
  ): Promise<T[]> {
    try {
      const safeLimit = Math.min(Math.max(limit, 1), 100);
      const sortOption = sort || { createdAt: -1 };
      return this.model
        .find(filters)
        .sort(sortOption)
        .limit(safeLimit)
        .exec();
    } catch (error) {
      throw new Error(
        `Error fetching documents: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  // 👉 Existing: Find by ID
  async findById(id: string): Promise<T | null> {
    try {
      return await this.model.findById(id).exec();
    } catch (error) {
      throw new Error(
        `Error finding document by ID: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  // 👉 Existing: Find one by filter
  async findOne(filters: FilterQuery<T>): Promise<T | null> {
    try {
      return await this.model.findOne(filters).exec();
    } catch (error) {
      throw new Error(
        `Error finding one document: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  // 👉 Existing: Update by ID
  async updateById(id: string, data: UpdateQuery<T>): Promise<T | null> {
    try {
      return await this.model
        .findByIdAndUpdate(id, data, {
          new: true,
          runValidators: true,
        })
        .exec();
    } catch (error) {
      throw new Error(
        `Error updating document: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  // 👉 Existing: Delete by ID
  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      throw new Error(
        `Error deleting document: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }
}
