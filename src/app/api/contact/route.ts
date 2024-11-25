import { NextRequest, NextResponse } from 'next/server';
import { ContactFormResponse } from '@/types/contact';
import { z } from 'zod';

// Zod schema for runtime validation
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  phone: z.string().optional(),
  preferredContact: z.enum(['email', 'phone', 'chat']),
});

export async function POST(
  request: NextRequest
): Promise<NextResponse<ContactFormResponse>> {
  try {
    // Parse and validate the request data
    const data = await request.json();
    const validatedData = contactFormSchema.safeParse(data);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid form data',
            details: validatedData.error.errors,
          },
        },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification
    // 3. Trigger any other necessary workflows

    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
    });
  } catch (error) {
    console.error('Contact form submission error:', error);

    // Return generic error for other types of errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
