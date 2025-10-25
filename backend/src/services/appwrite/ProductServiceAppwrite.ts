import { BaseServiceAppwrite } from './BaseServiceAppwrite.js';
import { Models, Query } from 'node-appwrite';

export interface Product extends Models.Row {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export class ProductServiceAppwite extends BaseServiceAppwrite<Product> {
  constructor() {
    super('products');
  }

  async getByCategory(category: string): Promise<Product[]> {
    try {
      const result = await this.list([
        this.createEqualQuery('category', category),
        this.createEqualQuery('isActive', true)
      ]);
      
      return result.rows;
    } catch (error) {
      console.error('Get by category error:', error);
      throw error;
    }
  }

  async getProductsInPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    try {
      const result = await this.list([
        this.createGreaterThanQuery('price', minPrice),
        this.createLessThanQuery('price', maxPrice),
        this.createEqualQuery('isActive', true)
      ]);
      
      return result.rows;
    } catch (error) {
      console.error('Get products in price range error:', error);
      throw error;
    }
  }

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    try {
      const result = await this.list([
        this.createLessThanQuery('stock', threshold),
        this.createEqualQuery('isActive', true)
      ]);
      
      return result.rows;
    } catch (error) {
      console.error('Get low stock products error:', error);
      throw error;
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const result = await this.list([
        Query.or([
          Query.search('name', query),
          Query.search('description', query),
          Query.search('category', query)
        ]),
        this.createEqualQuery('isActive', true)
      ]);
      
      return result.rows;
    } catch (error) {
      console.error('Search products error:', error);
      throw error;
    }
  }
}