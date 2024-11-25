import fs from 'fs';
import path from 'path';
import { paymentConfig } from '@/config/payment.config';

export class PaymentCertificates {
  private static instance: PaymentCertificates;
  private certificates: Map<string, Buffer> = new Map();

  private constructor() {
    this.loadCertificates();
  }

  public static getInstance(): PaymentCertificates {
    if (!PaymentCertificates.instance) {
      PaymentCertificates.instance = new PaymentCertificates();
    }
    return PaymentCertificates.instance;
  }

  private loadCertificates() {
    try {
      // Load Apple Pay certificates
      if (paymentConfig.applePay.merchantCertificatePath) {
        this.certificates.set(
          'applePay.merchantCertificate',
          fs.readFileSync(paymentConfig.applePay.merchantCertificatePath)
        );
      }
      if (paymentConfig.applePay.merchantKeyPath) {
        this.certificates.set(
          'applePay.merchantKey',
          fs.readFileSync(paymentConfig.applePay.merchantKeyPath)
        );
      }

      // Load Visa Direct certificates
      if (paymentConfig.visaDirect.certificatePath) {
        this.certificates.set(
          'visaDirect.certificate',
          fs.readFileSync(paymentConfig.visaDirect.certificatePath)
        );
      }
      if (paymentConfig.visaDirect.privateKeyPath) {
        this.certificates.set(
          'visaDirect.privateKey',
          fs.readFileSync(paymentConfig.visaDirect.privateKeyPath)
        );
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
      throw new Error('Failed to load payment certificates');
    }
  }

  public getCertificate(name: string): Buffer | undefined {
    return this.certificates.get(name);
  }

  public validateCertificates(): {
    isValid: boolean;
    missing: string[];
  } {
    const requiredCertificates = [
      'applePay.merchantCertificate',
      'applePay.merchantKey',
      'visaDirect.certificate',
      'visaDirect.privateKey',
    ];

    const missing = requiredCertificates.filter(
      (cert) => !this.certificates.has(cert)
    );

    return {
      isValid: missing.length === 0,
      missing,
    };
  }
}
