declare module '@/types/apple-pay' {
  export namespace ApplePayJS {
    interface ApplePayPaymentContact {
      phoneNumber?: string;
      emailAddress?: string;
      givenName?: string;
      familyName?: string;
      phoneticGivenName?: string;
      phoneticFamilyName?: string;
      addressLines?: string[];
      subLocality?: string;
      locality?: string;
      postalCode?: string;
      subAdministrativeArea?: string;
      administrativeArea?: string;
      country?: string;
      countryCode?: string;
    }

    interface ApplePayPaymentMethod {
      displayName: string;
      network: string;
      type: string;
      paymentPass?: {
        primaryAccountIdentifier: string;
        primaryAccountNumberSuffix: string;
      };
    }

    interface ApplePayPaymentToken {
      paymentData: any;
      paymentMethod: ApplePayPaymentMethod;
      transactionIdentifier: string;
    }

    interface ApplePayLineItem {
      label: string;
      amount: number;
      type?: 'final' | 'pending';
    }

    interface ApplePayPaymentRequest {
      countryCode: string;
      currencyCode: string;
      merchantCapabilities: string[];
      supportedNetworks: string[];
      total: ApplePayLineItem;
      lineItems?: ApplePayLineItem[];
      requiredBillingContactFields?: string[];
      requiredShippingContactFields?: string[];
      shippingMethods?: ApplePayShippingMethod[];
      shippingType?: string;
    }

    interface ApplePayShippingMethod {
      label: string;
      detail: string;
      amount: number;
      identifier: string;
    }

    interface ApplePayPaymentResponse {
      token: ApplePayPaymentToken;
      billingContact?: ApplePayPaymentContact;
      shippingContact?: ApplePayPaymentContact;
    }

    interface ApplePayError {
      code: number;
      contactField?: string;
      message: string;
    }

    interface ApplePayPaymentEvent {
      payment: ApplePayPaymentResponse;
    }

    interface ApplePayValidateMerchantEvent {
      validationURL: string;
    }

    interface ApplePayPaymentMethodSelectedEvent {
      paymentMethod: ApplePayPaymentMethod;
    }

    interface ApplePayShippingContactSelectedEvent {
      shippingContact: ApplePayPaymentContact;
    }

    interface ApplePayShippingMethodSelectedEvent {
      shippingMethod: ApplePayShippingMethod;
    }
  }
}

declare global {
  interface Window {
    ApplePaySession: ApplePaySessionConstructor;
  }

  interface ApplePaySessionConstructor {
    new (version: number, paymentRequest: ApplePayJS.ApplePayPaymentRequest): ApplePaySession;
    canMakePayments(): boolean;
    canMakePaymentsWithActiveCard(merchantIdentifier: string): Promise<boolean>;
    supportsVersion(version: number): boolean;
    readonly STATUS_FAILURE: number;
    readonly STATUS_SUCCESS: number;
    readonly STATUS_INVALID_BILLING_POSTAL_ADDRESS: number;
    readonly STATUS_INVALID_SHIPPING_POSTAL_ADDRESS: number;
    readonly STATUS_INVALID_SHIPPING_CONTACT: number;
    readonly STATUS_PIN_REQUIRED: number;
    readonly STATUS_PIN_INCORRECT: number;
    readonly STATUS_PIN_LOCKOUT: number;
  }

  interface ApplePaySession {
    onvalidatemerchant: ((event: ApplePayJS.ApplePayValidateMerchantEvent) => void) | null;
    onpaymentmethodselected: ((event: ApplePayJS.ApplePayPaymentMethodSelectedEvent) => void) | null;
    onshippingcontactselected: ((event: ApplePayJS.ApplePayShippingContactSelectedEvent) => void) | null;
    onshippingmethodselected: ((event: ApplePayJS.ApplePayShippingMethodSelectedEvent) => void) | null;
    onpaymentauthorized: ((event: ApplePayJS.ApplePayPaymentEvent) => void) | null;
    oncancel: (() => void) | null;

    begin(): void;
    abort(): void;
    completeMerchantValidation(merchantSession: any): void;
    completePayment(status: number): void;
    completePaymentMethodSelection(update: any): void;
    completeShippingContactSelection(status: number, newShippingMethods: ApplePayJS.ApplePayShippingMethod[], newTotal: ApplePayJS.ApplePayLineItem, newLineItems?: ApplePayJS.ApplePayLineItem[]): void;
    completeShippingMethodSelection(status: number, newTotal: ApplePayJS.ApplePayLineItem, newLineItems?: ApplePayJS.ApplePayLineItem[]): void;
  }
}

export {};