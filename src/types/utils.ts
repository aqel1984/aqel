// Generic response type for API endpoints
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Type for handling async operation states
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Type for handling form field validation
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface ValidationRule<T> {
  validate: (value: T) => ValidationResult;
  message: string;
}

// Type for handling pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Type for handling currency amounts
export interface MonetaryAmount {
  amount: number;
  currency: string;
}

// Type for handling date ranges
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Type for handling address information
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Type for handling phone numbers
export interface PhoneNumber {
  countryCode: string;
  number: string;
  type?: 'mobile' | 'home' | 'work' | 'other';
}

// Utility type for making all properties optional
export type Partial<T> = {
  [P in keyof T]?: T[P];
}

// Utility type for making all properties required
export type Required<T> = {
  [P in keyof T]-?: T[P];
}

// Utility type for making all properties readonly
export type Readonly<T> = {
  readonly [P in keyof T]: T[P];
}

// Type for handling API errors
export interface ApiError extends Error {
  code: string;
  statusCode: number;
  details?: unknown;
}
