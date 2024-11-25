import sgMail from '@sendgrid/mail';
import { paymentConfig } from '@/config/payment.config';

export class EmailService {
  private static instance: EmailService;

  private constructor() {
    if (paymentConfig.email.sendgrid.apiKey) {
      sgMail.setApiKey(paymentConfig.email.sendgrid.apiKey);
    } else {
      throw new Error('SendGrid API key is not configured');
    }
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async sendPaymentLink({
    to,
    amount,
    currency,
    description,
    paymentMethods,
    expiresIn,
  }: {
    to: string;
    amount: number;
    currency: string;
    description: string;
    paymentMethods: Array<'applePay' | 'visaDirect'>;
    expiresIn?: number; // hours
  }): Promise<boolean> {
    try {
      const paymentLink = await this.generatePaymentLink({
        amount,
        currency,
        description,
        paymentMethods,
        expiresIn,
      });

      const msg = {
        to,
        from: paymentConfig.email.sendgrid.fromEmail,
        templateId: paymentConfig.email.sendgrid.templates.paymentLink,
        dynamicTemplateData: {
          amount: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
          }).format(amount),
          description,
          paymentLink,
          expiresIn: expiresIn || 24,
          supportEmail: paymentConfig.email.sendgrid.fromEmail,
        },
      };

      const response = await sgMail.send(msg);
      return response[0].statusCode >= 200 && response[0].statusCode < 300;
    } catch (error) {
      console.error('Error sending payment link email:', error);
      return false;
    }
  }

  private async generatePaymentLink({
    amount,
    currency,
    description,
    paymentMethods,
    expiresIn,
  }: {
    amount: number;
    currency: string;
    description: string;
    paymentMethods: Array<'applePay' | 'visaDirect'>;
    expiresIn?: number;
  }): Promise<string> {
    // Generate a secure, signed payment link
    const params = new URLSearchParams({
      amount: amount.toString(),
      currency,
      description: encodeURIComponent(description),
      methods: paymentMethods.join(','),
      expires: (Date.now() + (expiresIn || 24) * 60 * 60 * 1000).toString(),
    });

    // In a real implementation, you would:
    // 1. Generate a unique payment ID
    // 2. Store the payment details in your database
    // 3. Sign the parameters with a secret key
    // 4. Return a link to your payment page with the signed parameters

    return `${process.env.NEXT_PUBLIC_APP_URL}/pay?${params.toString()}`;
  }

  public async sendPaymentConfirmation({
    to,
    amount,
    currency,
    transactionId,
    paymentMethod,
  }: {
    to: string;
    amount: number;
    currency: string;
    transactionId: string;
    paymentMethod: string;
  }): Promise<boolean> {
    try {
      const msg = {
        to,
        from: paymentConfig.email.sendgrid.fromEmail,
        templateId: paymentConfig.email.sendgrid.templates.paymentConfirmation,
        dynamicTemplateData: {
          amount: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
          }).format(amount),
          transactionId,
          paymentMethod,
          paymentDate: new Date().toLocaleDateString(),
          supportEmail: paymentConfig.email.sendgrid.fromEmail,
        },
      };

      const response = await sgMail.send(msg);
      return response[0].statusCode >= 200 && response[0].statusCode < 300;
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
      return false;
    }
  }
}
