import { ServerClient } from 'postmark';

interface EmailOptions {
  to: string | string[];
  subject?: string;
  templateAlias: string;
  templateModel: Record<string, any>;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    Name: string;
    Content: string;
    ContentType: string;
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

class PostmarkService {
  private client: ServerClient;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.client = new ServerClient(process.env.POSTMARK_SERVER_TOKEN || '');
    this.fromEmail = process.env.POSTMARK_FROM_EMAIL || '';
    this.fromName = process.env.POSTMARK_FROM_NAME || '';
  }

  private async sendEmail({
    to,
    subject,
    templateAlias,
    templateModel,
    cc,
    bcc,
    replyTo,
    attachments,
  }: EmailOptions) {
    try {
      const toAddresses = Array.isArray(to) ? to.join(',') : to;
      const ccAddresses = cc ? (Array.isArray(cc) ? cc.join(',') : cc) : undefined;
      const bccAddresses = bcc ? (Array.isArray(bcc) ? bcc.join(',') : bcc) : undefined;

      const response = await this.client.sendEmailWithTemplate({
        From: `${this.fromName} <${this.fromEmail}>`,
        To: toAddresses,
        TemplateAlias: templateAlias,
        TemplateModel: templateModel,
        ...(subject && { Subject: subject }),
        ...(ccAddresses && { Cc: ccAddresses }),
        ...(bccAddresses && { Bcc: bccAddresses }),
        ...(replyTo && { ReplyTo: replyTo }),
        ...(attachments && { Attachments: attachments }),
      });

      if (process.env.NODE_ENV !== 'production') {
        console.log('Email sent successfully:', {
          to: toAddresses,
          template: templateAlias,
          messageId: response.MessageID,
        });
      }

      return {
        success: true,
        messageId: response.MessageID,
        response,
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendOrderConfirmation(to: string, orderDetails: OrderDetails) {
    const templateModel = {
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
      company_name: this.fromName,
      year: new Date().getFullYear(),
    };

    return this.sendEmail({
      to,
      templateAlias: process.env.POSTMARK_ORDER_TEMPLATE || 'order-confirmation',
      templateModel,
    });
  }

  async sendWelcomeEmail(to: string, name: string) {
    const templateModel = {
      name,
      company_name: this.fromName,
      support_email: 'support@aqeljehadltd.net',
      login_url: 'https://aqeljehadltd.net/login',
      year: new Date().getFullYear(),
    };

    return this.sendEmail({
      to,
      templateAlias: process.env.POSTMARK_WELCOME_TEMPLATE || 'welcome-email',
      templateModel,
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
    const templateModel = {
      order_number: details.orderNumber,
      tracking_number: details.trackingNumber,
      carrier: details.carrier,
      estimated_delivery: details.estimatedDelivery,
      tracking_url: `https://aqeljehadltd.net/track/${details.trackingNumber}`,
      support_email: 'support@aqeljehadltd.net',
      company_name: this.fromName,
      year: new Date().getFullYear(),
    };

    return this.sendEmail({
      to,
      templateAlias: process.env.POSTMARK_SHIPPING_TEMPLATE || 'shipping-update',
      templateModel,
    });
  }

  async sendPasswordReset(to: string, resetToken: string) {
    const templateModel = {
      reset_link: `https://aqeljehadltd.net/reset-password?token=${resetToken}`,
      company_name: this.fromName,
      support_email: 'support@aqeljehadltd.net',
      year: new Date().getFullYear(),
    };

    return this.sendEmail({
      to,
      templateAlias: process.env.POSTMARK_PASSWORD_RESET_TEMPLATE || 'password-reset',
      templateModel,
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
    const templateModel = {
      name_value: details.name,
      product_name_value: details.productName,
      product_url_value: details.productUrl,
      receipt_id_value: details.receiptId,
      date_value: details.date,
      description_value: details.description,
      amount_value: details.amount.toFixed(2),
      credit_card_brand_value: details.creditCard.brand,
      credit_card_last_four_value: details.creditCard.lastFour,
      credit_card_statement_name_value: details.creditCard.statementName,
      billing_url_value: details.billingUrl,
      // Set default values for discount fields
      discount_code_value: details.discountCode?.code || 'WELCOME10',
      expiration_date_value: details.discountCode?.expirationDate || '2024-12-31',
      discount_percentage_value: details.discountCode?.percentage || 10,
      company_name: this.fromName,
      support_email: 'support@aqeljehadltd.net',
      year: new Date().getFullYear(),
    };

    return this.sendEmail({
      to,
      subject: `Receipt for ${details.productName}`,
      templateAlias: process.env.POSTMARK_RECEIPT_TEMPLATE || 'payment-receipt',
      templateModel,
    });
  }
}

// Export a singleton instance
export const postmarkService = new PostmarkService();

// Export the class for testing purposes
export default PostmarkService;
