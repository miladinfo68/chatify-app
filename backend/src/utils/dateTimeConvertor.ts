// src/utils/DateTimeCovertor.ts
import ms, { StringValue } from 'ms';

export class DateTimeCovertor implements IDateTimeCovertor {
  /**
   * Convert Date object to Unix timestamp (seconds since epoch)
   * @example toUnixTimestamp(new Date('2024-01-01')) → 1704067200
   */
  toUnixTimestamp(date: Date): number {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('Invalid Date object provided');
    }
    return Math.floor(date.getTime() / 1000);
  }

  /**
   * Convert Unix timestamp to Date object
   * @example fromUnixTimestamp(1704067200) → Date('2024-01-01')
   */
  fromUnixTimestamp(timestamp: number): Date {
    if (typeof timestamp !== 'number' || timestamp < 0) {
      throw new Error('Invalid Unix timestamp provided');
    }
    return new Date(timestamp * 1000);
  }

  /**
   * Get current time as Unix timestamp
   */
  nowUnix(): number {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * Add time duration to a date and return as Unix timestamp
   * @param date Starting date
   * @param timeString Time string like '15m', '2h', '7d'
   * @example addTimeAndConvert(new Date(), '7d') → 1704672000 (7 days from now)
   */
  addTimeAndConvert(date: Date, timeString: StringValue): number {
    const durationMs = ms(timeString);
    if (typeof durationMs !== 'number') {
      throw new Error(`Invalid time string: ${timeString}`);
    }
    
    const newDate = new Date(date.getTime() + durationMs);
    return this.toUnixTimestamp(newDate);
  }

  /**
   * Check if a Unix timestamp is expired (in the past)
   */
  isExpired(timestamp: number): boolean {
    return timestamp < this.nowUnix();
  }

  /**
   * Get time remaining until expiration in seconds
   * @returns Positive number if not expired, negative if expired
   */
  getTimeRemaining(expTimestamp: number): number {
    return expTimestamp - this.nowUnix();
  }

  /**
   * Format Unix timestamp for display
   * @param timestamp Unix timestamp
   * @param format Output format (default: ISO string)
   */
  formatUnix(timestamp: number, format: string = 'iso'): string {
    const date = this.fromUnixTimestamp(timestamp);
    
    switch (format.toLowerCase()) {
      case 'iso': return date.toISOString();
      case 'local': return date.toLocaleString();
      case 'date': return date.toLocaleDateString();
      case 'time': return date.toLocaleTimeString();
      default: return date.toISOString();
    }
  }

  /**
   * Convert milliseconds to Unix timestamp
   */
  fromMilliseconds(ms: number): number {
    return Math.floor(ms / 1000);
  }

  /**
   * Convert Unix timestamp to milliseconds
   */
  toMilliseconds(timestamp: number): number {
    return timestamp * 1000;
  }
}


// @@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@


export interface IDateTimeCovertor {
  // Convert Date to Unix timestamp (seconds)
  toUnixTimestamp(date: Date): number;
  
  // Convert Unix timestamp to Date
  fromUnixTimestamp(timestamp: number): Date;
  
  // Get current Unix timestamp
  nowUnix(): number;
  
  // Add time to a date and return Unix timestamp
  addTimeAndConvert(date: Date, timeString: string): number;
  
  // Check if a timestamp is expired
  isExpired(timestamp: number): boolean;
  
  // Get time remaining until expiration in seconds
  getTimeRemaining(expTimestamp: number): number;
  
  // Format Unix timestamp for display
  formatUnix(timestamp: number, format?: string): string;
  
  // Convert milliseconds to Unix timestamp
  fromMilliseconds(ms: number): number;

  // Convert Unix timestamp to milliseconds
  toMilliseconds(timestamp: number): number;
}