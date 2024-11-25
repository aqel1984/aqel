import * as postmark from 'postmark';
import PDFDocument from 'pdfkit';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const postmarkClient = new postmark.ServerClient(process.env['POSTMARK_SERVER_TOKEN'] || '');
const redis = new Redis({
  url: process.env['UPSTASH_REDIS_URL'] || '',
  token: process.env['UPSTASH_REDIS_TOKEN'] || '',
});

interface ReceiptData {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentDate: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  companyDetails: {
    name: string;
    address: string;
    email: string;
    phone: string;
    vatNumber?: string;
  };
}

export async function generateReceipt(receiptData: ReceiptData): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  // Collect PDF chunks
  doc.on('data', (chunk) => chunks.push(chunk));

  // Company Logo and Header
  doc
    .fontSize(20)
    .text('Aqel Jehad Ltd.', { align: 'center' })
    .fontSize(10)
    .moveDown()
    .text(receiptData.companyDetails.address, { align: 'center' })
    .text(`Tel: ${receiptData.companyDetails.phone}`, { align: 'center' })
    .text(`Email: ${receiptData.companyDetails.email}`, { align: 'center' })
    .moveDown(2);

  // Receipt Details
  doc
    .fontSize(16)
    .text('Payment Receipt', { align: 'center' })
    .moveDown()
    .fontSize(10)
    .text(`Receipt Number: ${receiptData.invoiceNumber}`)
    .text(`Date: ${new Date(receiptData.paymentDate).toLocaleDateString()}`)
    .text(`Payment Method: ${receiptData.paymentMethod}`)
    .moveDown();

  // Customer Details
  doc
    .text('Bill To:')
    .text(receiptData.customerName)
    .text(receiptData.customerEmail)
    .moveDown();

  // Items Table
  const tableTop = doc.y;
  doc
    .text('Description', 50, tableTop)
    .text('Qty', 300, tableTop)
    .text('Unit Price', 350, tableTop)
    .text('Total', 450, tableTop)
    .moveDown();

  let tableY = doc.y;
  receiptData.items.forEach(item => {
    doc
      .text(item.description, 50, tableY)
      .text(item.quantity.toString(), 300, tableY)
      .text(`$${item.unitPrice.toFixed(2)}`, 350, tableY)
      .text(`$${item.total.toFixed(2)}`, 450, tableY);
    tableY += 20;
  });

  // Totals
  doc
    .moveDown(2)
    .text(`Subtotal: $${receiptData.subtotal.toFixed(2)}`, { align: 'right' })
    .text(`Tax: $${receiptData.tax.toFixed(2)}`, { align: 'right' })
    .text(`Total: $${receiptData.total.toFixed(2)}`, { align: 'right' })
    .moveDown(2);

  // Digital Signature
  const signature = generateDigitalSignature(receiptData);
  doc
    .fontSize(8)
    .text('Digital Signature:', { align: 'left' })
    .text(signature, { align: 'left' })
    .moveDown();

  // Footer
  doc
    .fontSize(10)
    .text('Thank you for your business!', { align: 'center' })
    .moveDown()
    .fontSize(8)
    .text('This is a computer-generated document. No signature is required.', { align: 'center' });

  // Finalize PDF
  doc.end();

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

export function generateDigitalSignature(data: ReceiptData): string {
  const hmac = crypto.createHmac(
    'sha256',
    process.env['RECEIPT_SIGNATURE_KEY'] || ''
  );
  hmac.update(JSON.stringify(data));
  return hmac.digest('hex');
}

export async function storeReceipt(invoiceNumber: string, receipt: Buffer): Promise<void> {
  try {
    // Store receipt in Redis (with 30-day expiry)
    await redis.set(
      `receipt:${invoiceNumber}`,
      receipt.toString('base64'),
      { ex: 30 * 24 * 60 * 60 }
    );
  } catch (error) {
    console.error('Failed to store receipt:', error);
    throw error;
  }
}

export async function getReceipt(invoiceNumber: string): Promise<Buffer | null> {
  const data = await redis.get<string>(`receipt:${invoiceNumber}`);
  if (!data) return null;

  return Buffer.from(data, 'base64');
}

export async function sendReceiptEmail(
  receiptData: ReceiptData,
  receipt: Buffer
): Promise<void> {
  await postmarkClient.sendEmail({
    From: process.env['EMAIL_FROM'] || '',
    To: receiptData.customerEmail,
    Subject: `Receipt for Invoice #${receiptData.invoiceNumber}`,
    HtmlBody: `
      <h1>Thank you for your payment</h1>
      <p>Dear ${receiptData.customerName},</p>
      <p>Please find attached your receipt for Invoice #${receiptData.invoiceNumber}.</p>
      <br />
      <p>Best regards,</p>
      <p>
        ${process.env['COMPANY_NAME'] || 'Company Name'}<br />
        ${process.env['COMPANY_ADDRESS'] || ''}<br />
        ${process.env['COMPANY_EMAIL'] || ''}
      </p>
    `,
    Attachments: [
      {
        Name: `receipt-${receiptData.invoiceNumber}.pdf`,
        Content: receipt.toString('base64'),
        ContentType: 'application/pdf',
        ContentID: `receipt-${receiptData.invoiceNumber}`
      }
    ]
  });
}
