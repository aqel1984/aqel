import formData from 'form-data';
import Mailgun from 'mailgun.js';

interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  variables: Record<string, any>;
  attachments?: any[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

class EmailService {
  private mailgun: any;
  private domain: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    const mailgun = new Mailgun(formData);
    this.mailgun = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY || '',
      url: process.env.MAILGUN_HOST || 'https://api.eu.mailgun.net',
    });

    this.domain = process.env.MAILGUN_DOMAIN || '';
    this.fromEmail = process.env.MAILGUN_FROM_EMAIL || '';
    this.fromName = process.env.MAILGUN_FROM_NAME || '';
  }

  async sendEmail({
    to,
    subject,
    template,
    variables,
    attachments = [],
    cc,
    bcc,
    replyTo,
  }: EmailOptions) {
    try {
      const messageData = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: Array.isArray(to) ? to.join(',') : to,
        subject,
        template,
        'h:X-Mailgun-Variables': JSON.stringify(variables),
        ...(cc && { cc: Array.isArray(cc) ? cc.join(',') : cc }),
        ...(bcc && { bcc: Array.isArray(bcc) ? bcc.join(',') : bcc }),
        ...(replyTo && { 'h:Reply-To': replyTo }),
      };

      // Add attachments if any
      if (attachments.length > 0) {
        messageData.attachment = attachments;
      }

      const response = await this.mailgun.messages.create(this.domain, messageData);

      if (process.env.NODE_ENV !== 'production') {
        console.log('Email sent successfully:', {
          to,
          subject,
          template,
          messageId: response.id,
        });
      }

      return {
        success: true,
        messageId: response.id,
        response,
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendOrderConfirmation(
    to: string,
    orderDetails: {
      orderNumber: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      total: number;
      shippingAddress: string;
      estimatedDelivery: string;
    }
  ) {
    return this.sendEmail({
      to,
      subject: `Order Confirmation #${orderDetails.orderNumber}`,
      template: process.env.MAILGUN_ORDER_TEMPLATE || 'order-confirmation',
      variables: {
        orderNumber: orderDetails.orderNumber,
        items: orderDetails.items,
        total: orderDetails.total,
        shippingAddress: orderDetails.shippingAddress,
        estimatedDelivery: orderDetails.estimatedDelivery,
        customerSupport: 'support@aqeljehadltd.net',
      },
    });
  }

  async sendWelcomeEmail(to: string, name: string) {
    return this.sendEmail({
      to,
      subject: 'Welcome to Aqel Jehad Ltd!',
      template: process.env.MAILGUN_WELCOME_TEMPLATE || 'welcome-email',
      variables: {
        name,
        supportEmail: 'support@aqeljehadltd.net',
        websiteUrl: 'https://aqeljehadltd.net',
      },
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
      subject: `Shipping Update for Order #${details.orderNumber}`,
      template: process.env.MAILGUN_SHIPPING_TEMPLATE || 'shipping-update',
      variables: {
        orderNumber: details.orderNumber,
        trackingNumber: details.trackingNumber,
        carrier: details.carrier,
        estimatedDelivery: details.estimatedDelivery,
        trackingUrl: `https://aqeljehadltd.net/track/${details.trackingNumber}`,
      },
    });
  }
}

// Export a singleton instance
export const emailService = new EmailService();

// Export the class for testing purposes
export default EmailService;
