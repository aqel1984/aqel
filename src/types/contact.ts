import { ApiResponse, ValidationRule, Address, PhoneNumber } from './utils';
import { ReactNode } from 'react';

// Form data types
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  subject?: string;
  phone?: PhoneNumber;
  address?: Address;
  company?: string;
  preferredContact?: 'email' | 'phone' | 'chat';
  attachments?: File[];
  metadata?: Record<string, unknown>;
}

export interface ContactFormErrors {
  name?: string;
  email?: string;
  message?: string;
  subject?: string;
  phone?: string;
  general?: string;
}

// API response types
export interface ContactFormResponse extends ApiResponse {
  data?: {
    ticketId: string;
    status: 'received' | 'processing' | 'responded';
    createdAt: string;
    updatedAt: string;
  };
}

// Apple Business Chat types
export interface AppleBusinessChatProps {
  businessId: string;
  buttonId: string;
  className?: string;
  children?: ReactNode;
  mode?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

// Contact validation types
export interface ContactValidationRules {
  name: ValidationRule<string>;
  email: ValidationRule<string>;
  message: ValidationRule<string>;
  phone?: ValidationRule<PhoneNumber>;
}

// Support ticket types
export interface SupportTicket {
  id: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  subject: string;
  description: string;
  customer: {
    name: string;
    email: string;
    phone?: PhoneNumber;
  };
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  metadata?: Record<string, unknown>;
}
