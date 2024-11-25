import { Json } from './utils';
import { PaymentMethod, PaymentStatus } from './payment';

// Define the JSON type, which can be a string, number, boolean, null, object, or array of JSON
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Tables {
  payment_methods: {
    Row: {
      id: string;
      user_id: string;
      type: PaymentMethod;
      details: Json;
      is_default: boolean;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      user_id: string;
      type: PaymentMethod;
      details: Json;
      is_default?: boolean;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      type?: PaymentMethod;
      details?: Json;
      is_default?: boolean;
      created_at?: string;
      updated_at?: string;
    };
  };
  transactions: {
    Row: {
      id: string;
      user_id: string;
      payment_method_id: string;
      amount: number;
      currency: string;
      status: PaymentStatus;
      metadata: Json;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      user_id: string;
      payment_method_id: string;
      amount: number;
      currency: string;
      status?: PaymentStatus;
      metadata?: Json;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      payment_method_id?: string;
      amount?: number;
      currency?: string;
      status?: PaymentStatus;
      metadata?: Json;
      created_at?: string;
      updated_at?: string;
    };
  };
  users: {
    Row: {
      id: string;
      email: string;
      name: string | null;
      avatar_url: string | null;
      phone: string | null;
      address: Json | null;
      preferences: Json | null;
      metadata: Json | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      email: string;
      name?: string | null;
      avatar_url?: string | null;
      phone?: string | null;
      address?: Json | null;
      preferences?: Json | null;
      metadata?: Json | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      email?: string;
      name?: string | null;
      avatar_url?: string | null;
      phone?: string | null;
      address?: Json | null;
      preferences?: Json | null;
      metadata?: Json | null;
      created_at?: string;
      updated_at?: string;
    };
  };
  support_tickets: {
    Row: {
      id: string;
      user_id: string;
      status: 'open' | 'in-progress' | 'resolved' | 'closed';
      priority: 'low' | 'medium' | 'high' | 'urgent';
      category: string | null;
      subject: string;
      description: string;
      assigned_to: string | null;
      attachments: Json | null;
      metadata: Json | null;
      created_at: string;
      updated_at: string;
      resolved_at: string | null;
    };
    Insert: {
      id?: string;
      user_id: string;
      status?: 'open' | 'in-progress' | 'resolved' | 'closed';
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      category?: string | null;
      subject: string;
      description: string;
      assigned_to?: string | null;
      attachments?: Json | null;
      metadata?: Json | null;
      created_at?: string;
      updated_at?: string;
      resolved_at?: string | null;
    };
    Update: {
      id?: string;
      user_id?: string;
      status?: 'open' | 'in-progress' | 'resolved' | 'closed';
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      category?: string | null;
      subject?: string;
      description?: string;
      assigned_to?: string | null;
      attachments?: Json | null;
      metadata?: Json | null;
      created_at?: string;
      updated_at?: string;
      resolved_at?: string | null;
    };
  };
}

export interface Database {
  public: {
    Tables: Tables;
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: unknown;
    };
    Enums: {
      [key: string]: unknown;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T];