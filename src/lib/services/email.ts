import * as postmark from 'postmark';

// Initialize Postmark client
const client = new postmark.ServerClient(process.env['POSTMARK_SERVER_TOKEN'] || '');

// Error types
export class EmailError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'EmailError';
  }
}

interface SendInvoiceEmailParams {
  to: string;
  amount: number;
  currency: string;
  invoiceNumber: string;
  applePayLink: string;
  items?: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
}

interface SendEmailParams {
  to: string;
  template: string;
  data: Record<string, any>;
}

// Validate email parameters
function validateEmailParams(params: SendInvoiceEmailParams): void {
  if (!params.to || !params.to.includes('@')) {
    throw new EmailError('Invalid recipient email address', null);
  }
  if (params.amount <= 0) {
    throw new EmailError('Amount must be greater than 0', null);
  }
  if (!params.currency || params.currency.length !== 3) {
    throw new EmailError('Invalid currency code', null);
  }
  if (!params.invoiceNumber) {
    throw new EmailError('Invoice number is required', null);
  }
  if (!params.applePayLink || !params.applePayLink.startsWith('http')) {
    throw new EmailError('Invalid Apple Pay link', null);
  }
}

// Validate recipient domain during pending approval
function validateRecipientDomain(to: string, from: string): void {
  const toDomain = to.split('@')[1];
  const fromDomain = from.split('@')[1];

  if (toDomain !== fromDomain) {
    throw new EmailError('Recipient domain does not match sender domain', null);
  }
}

export async function sendEmail({
  to,
  template,
  data,
}: SendEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const from = process.env['EMAIL_FROM'] || 'noreply@aqeljehadltd.net';
    validateRecipientDomain(to, from);

    const result = await client.sendEmailWithTemplate({
      From: from,
      To: to,
      TemplateAlias: template,
      TemplateModel: {
        ...data,
        companyAddress: process.env['COMPANY_ADDRESS'],
        companyEmail: process.env['COMPANY_EMAIL'],
      },
      MessageStream: 'outbound',
    });

    return {
      success: true,
      messageId: result.MessageID,
    };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

export async function sendInvoiceEmail({
  to,
  amount,
  currency,
  invoiceNumber,
  applePayLink,
  items = [],
}: SendInvoiceEmailParams): Promise<{
  success: boolean;
  messageId: string;
  errorCode: number;
  message: string;
  error?: string;
}> {
  try {
    // Validate parameters
    validateEmailParams({ to, amount, currency, invoiceNumber, applePayLink, items });

    // Format items for email
    const formattedItems = items.map(item => ({
      ...item,
      total: (item.quantity * item.price).toFixed(2),
    }));

    // Calculate total
    const total = formattedItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    // Send email using template
    const result = await client.sendEmailWithTemplate({
      From: process.env['EMAIL_FROM'] || 'invoices@aqeljehadltd.net',
      To: to,
      TemplateAlias: 'invoice',
      TemplateModel: {
        invoiceNumber,
        amount: amount.toFixed(2),
        currency,
        items: formattedItems,
        total: total.toFixed(2),
        applePayLink,
        companyName: 'Aqel Jehad Ltd',
        companyAddress: process.env['COMPANY_ADDRESS'],
        companyEmail: process.env['COMPANY_EMAIL'],
        date: new Date().toLocaleDateString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      },
      MessageStream: 'outbound',
    });

    return {
      success: true,
      messageId: result.MessageID,
      errorCode: 0,
      message: 'Email sent successfully',
    };
  } catch (error: any) {
    console.error('Failed to send invoice email:', error);

    let errorCode = 500;
    if (error instanceof EmailError) {
      errorCode = 400;
    }

    return {
      success: false,
      messageId: '',
      errorCode,
      message: error.message || 'Failed to send invoice email',
      error: error.message,
    };
  }
}

// Test email function
export async function sendTestEmail(
  to: string
): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const result = await client.sendEmailWithTemplate({
      From: process.env['EMAIL_FROM'] || 'noreply@aqeljehadltd.net',
      To: to,
      TemplateAlias: 'test-email',
      TemplateModel: {
        name: 'Test User',
        date: new Date().toLocaleDateString(),
      },
      MessageStream: 'outbound',
    });

    return {
      success: true,
      messageId: result.MessageID,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send test email',
    };
  }
}
