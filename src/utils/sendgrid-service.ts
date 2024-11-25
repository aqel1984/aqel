import sgMail from '@sendgrid/mail';

interface EmailOptions {
  to: string | string[];
  templateId: string;
  dynamicTemplateData: Record<string, any>;
  categories?: string[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: 'attachment' | 'inline';
    contentId?: string;
  }>;
}

interface OrderDetails {
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  shippingAddress: string;
  estimatedDelivery: string;
}

class SendGridService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  }

  private async sendEmail({
    to,
    templateId,
    dynamicTemplateData,
    categories = [],
    cc,
    bcc,
    replyTo,
    attachments,
  }: EmailOptions) {
    try {
      const msg = {
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || '',
          name: process.env.SENDGRID_FROM_NAME || '',
        },
        to: Array.isArray(to) ? to : [to],
        templateId,
        dynamicTemplateData,
        categories,
        ...(cc && { cc: Array.isArray(cc) ? cc : [cc] }),
        ...(bcc && { bcc: Array.isArray(bcc) ? bcc : [bcc] }),
        ...(replyTo && { replyTo }),
        ...(attachments && { attachments }),
      };

      const response = await sgMail.send(msg);

      if (process.env.NODE_ENV !== 'production') {
        console.log('Email sent successfully:', {
          to,
          templateId,
          messageId: response[0]?.headers['x-message-id'],
        });
      }

      return {
        success: true,
        messageId: response[0]?.headers['x-message-id'],
        response,
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendOrderConfirmation(to: string, orderDetails: OrderDetails) {
    return this.sendEmail({
      to,
      templateId: process.env.SENDGRID_ORDER_TEMPLATE_ID || '',
      dynamicTemplateData: {
        order_number: orderDetails.orderNumber,
        customer_name: orderDetails.customerName,
        items: orderDetails.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price.toFixed(2),
          subtotal: (item.quantity * item.price).toFixed(2),
        })),
        total: orderDetails.total.toFixed(2),
        shipping_address: orderDetails.shippingAddress,
        estimated_delivery: orderDetails.estimatedDelivery,
        support_email: 'support@aqeljehadltd.net',
        company_name: process.env.SENDGRID_FROM_NAME,
        year: new Date().getFullYear(),
      },
      categories: [process.env.SENDGRID_CATEGORY_ORDERS || 'orders'],
    });
  }

  async sendWelcomeEmail(to: string, name: string) {
    return this.sendEmail({
      to,
      templateId: process.env.SENDGRID_WELCOME_TEMPLATE_ID || '',
      dynamicTemplateData: {
        name,
        company_name: process.env.SENDGRID_FROM_NAME,
        support_email: 'support@aqeljehadltd.net',
        login_url: 'https://aqeljehadltd.net/login',
        year: new Date().getFullYear(),
      },
      categories: [process.env.SENDGRID_CATEGORY_ACCOUNT || 'account'],
    });
  }

  async sendReceiptEmail(
    to: string,
    details: {
      name: string;
      productName: string;
      productUrl: string;
      receiptId: string;
      date: string;
      description: string;
      amount: number;
      creditCard: {
        brand: string;
        lastFour: string;
        statementName: string;
      };
      billingUrl: string;
      discountCode?: {
        code: string;
        expirationDate: string;
        percentage: number;
      };
    }
  ) {
    return this.sendEmail({
      to,
      templateId: process.env.SENDGRID_RECEIPT_TEMPLATE_ID || '',
      dynamicTemplateData: {
        name: details.name,
        product_name: details.productName,
        product_url: details.productUrl,
        receipt_id: details.receiptId,
        date: details.date,
        description: details.description,
        amount: details.amount.toFixed(2),
        credit_card_brand: details.creditCard.brand,
        credit_card_last_four: details.creditCard.lastFour,
        credit_card_statement_name: details.creditCard.statementName,
        billing_url: details.billingUrl,
        discount_code: details.discountCode?.code || 'WELCOME10',
        discount_expiration: details.discountCode?.expirationDate || '2024-12-31',
        discount_percentage: details.discountCode?.percentage || 10,
        company_name: process.env.SENDGRID_FROM_NAME,
        support_email: 'support@aqeljehadltd.net',
        year: new Date().getFullYear(),
      },
      categories: [process.env.SENDGRID_CATEGORY_PAYMENTS || 'payments'],
    });
  }

  async sendShippingUpdate(
    to: string,
    details: {
      orderNumber: string;
      trackingNumber: string;
      carrier: string;
      estimatedDelivery: string;
    }
  ) {
    return this.sendEmail({
      to,
      templateId: process.env.SENDGRID_SHIPPING_TEMPLATE_ID || '',
      dynamicTemplateData: {
        order_number: details.orderNumber,
        tracking_number: details.trackingNumber,
        carrier: details.carrier,
        estimated_delivery: details.estimatedDelivery,
        tracking_url: `https://aqeljehadltd.net/track/${details.trackingNumber}`,
        support_email: 'support@aqeljehadltd.net',
        company_name: process.env.SENDGRID_FROM_NAME,
        year: new Date().getFullYear(),
      },
      categories: [process.env.SENDGRID_CATEGORY_SHIPPING || 'shipping'],
    });
  }

  async sendPasswordReset(to: string, resetToken: string) {
    return this.sendEmail({
      to,
      templateId: process.env.SENDGRID_PASSWORD_RESET_TEMPLATE_ID || '',
      dynamicTemplateData: {
        reset_link: `https://aqeljehadltd.net/reset-password?token=${resetToken}`,
        company_name: process.env.SENDGRID_FROM_NAME,
        support_email: 'support@aqeljehadltd.net',
        year: new Date().getFullYear(),
      },
      categories: [process.env.SENDGRID_CATEGORY_ACCOUNT || 'account'],
    });
  }
}

// Export a singleton instance
export const sendGridService = new SendGridService();

// Export the class for testing purposes
export default SendGridService;
