import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';
import { logger } from '@/lib/utils/logger';
import { 
  generatePaymentCSV, 
  generatePaymentReport,
  getReport,
  saveReport,
  ReportFilters 
} from '@/lib/services/payment-reports';

// Report filters schema
const ReportSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  currency: z.string().length(3).optional(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  format: z.enum(['json', 'csv']).optional(),
  reportId: z.string().optional(),
  name: z.string()
    .min(1, { message: "Report name cannot be empty" })
    .max(100, { message: "Report name cannot exceed 100 characters" })
    .optional(),
}).refine(
  (data) => {
    if (data.minAmount && data.maxAmount) {
      return data.minAmount <= data.maxAmount;
    }
    return true;
  },
  {
    message: "Minimum amount must be less than or equal to maximum amount",
    path: ["minAmount"],
  }
);

async function handleGetReport(request: NextRequest): Promise<NextResponse> {
  try {
    // Check rate limit
    const rateLimitResult = await rateLimitMiddleware(request);
    if (rateLimitResult) return rateLimitResult;

    const searchParams = request.nextUrl.searchParams;
    const validatedData = ReportSchema.parse({
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      currency: searchParams.get('currency'),
      status: searchParams.get('status'),
      minAmount: searchParams.get('minAmount') ? Number(searchParams.get('minAmount')) : undefined,
      maxAmount: searchParams.get('maxAmount') ? Number(searchParams.get('maxAmount')) : undefined,
      format: searchParams.get('format'),
      reportId: searchParams.get('reportId'),
    });

    if (validatedData.reportId) {
      const report = await getReport(validatedData.reportId);
      if (!report) {
        throw new AppError('Report not found', 404);
      }
      return NextResponse.json({ success: true, report });
    }

    const filters: ReportFilters = {
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
      ...(validatedData.currency && { currency: validatedData.currency }),
      ...(validatedData.status && { status: validatedData.status }),
      ...(validatedData.minAmount !== undefined && { minAmount: validatedData.minAmount }),
      ...(validatedData.maxAmount !== undefined && { maxAmount: validatedData.maxAmount })
    };

    // Log request
    logger.info({
      message: 'Generating payment report',
      filters: validatedData,
      user: request.headers.get('x-user-id'),
    });

    // Validate date range
    const maxDateRange = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
    if (filters.endDate.getTime() - filters.startDate.getTime() > maxDateRange) {
      throw new AppError('Date range cannot exceed 90 days', 400);
    }

    if (validatedData.format === 'csv') {
      const csv = await generatePaymentCSV(filters);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="payment-report-${filters.startDate.toISOString().split('T')[0]}-${filters.endDate.toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    const report = await generatePaymentReport(filters);
    return NextResponse.json({ success: true, report });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    logger.error('Failed to generate report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handlePostReport(request: NextRequest): Promise<NextResponse> {
  try {
    // Check rate limit
    const rateLimitResult = await rateLimitMiddleware(request);
    if (rateLimitResult) return rateLimitResult;

    const validatedData = ReportSchema.parse(await request.json());

    if (!validatedData.name) {
      throw new AppError('Report name is required', 400);
    }

    const filters: ReportFilters = {
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
      ...(validatedData.currency && { currency: validatedData.currency }),
      ...(validatedData.status && { status: validatedData.status }),
      ...(validatedData.minAmount !== undefined && { minAmount: validatedData.minAmount }),
      ...(validatedData.maxAmount !== undefined && { maxAmount: validatedData.maxAmount })
    };

    const report = await generatePaymentReport(filters);
    await saveReport(report, validatedData.name);

    return NextResponse.json({ 
      success: true, 
      message: 'Report saved successfully',
      reportId: validatedData.name 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    logger.error('Failed to save report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export { handleGetReport as GET, handlePostReport as POST };
