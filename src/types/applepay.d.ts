declare namespace ApplePayJS {
  declare global {
    interface Window {
      ApplePaySession?: {
        new (version: number, paymentRequest: ApplePayPaymentRequest): ApplePaySession;
        canMakePayments(): boolean;
        STATUS_SUCCESS: number;
        STATUS_FAILURE: number;
      };
    }
  }

  interface ApplePayPaymentRequest {
    countryCode: string;
    currencyCode: string;
    supportedNetworks: readonly ('visa' | 'masterCard' | 'amex')[];
    merchantCapabilities: readonly ('supports3DS')[];
    total: {
      label: string;
      amount: string;
      type: 'final';
    };
  }

  interface ApplePaySession {
    onvalidatemerchant: (event: { validationURL: string }) => void;
    onpaymentauthorized: (event: {
      payment: {
        token: {
          paymentData: any;
          paymentMethod: {
            displayName: string;
            network: string;
            type: string;
          };
          transactionIdentifier: string;
        };
        billingContact?: {
          addressLines?: string[];
          locality?: string;
          postalCode?: string;
          country?: string;
          countryCode?: string;
          emailAddress?: string;
          familyName?: string;
          givenName?: string;
          phoneNumber?: string;
        };
        shippingContact?: {
          addressLines?: string[];
          locality?: string;
          postalCode?: string;
          country?: string;
          countryCode?: string;
          emailAddress?: string;
          familyName?: string;
          givenName?: string;
          phoneNumber?: string;
        };
      };
    }) => void;
    completeMerchantValidation(merchantSession: any): void;
    completePayment(status: number): void;
    abort(): void;
    begin(): void;
  }
}

export {};
