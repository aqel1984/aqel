export namespace ApplePayJS {
  export interface ApplePayPaymentToken {
    paymentData: {
      version: string;
      data: string;
      signature: string;
      header: {
        ephemeralPublicKey: string;
        publicKeyHash: string;
        transactionId: string;
      };
    };
    paymentMethod: {
      displayName: string;
      network: string;
      type: string;
    };
    transactionIdentifier: string;
  }

  export interface ApplePayPaymentRequest {
    countryCode: string;
    currencyCode: string;
    merchantCapabilities: string[];
    supportedNetworks: string[];
    total: {
      label: string;
      amount: string;
      type: 'final' | 'pending';
    };
  }

  export interface ValidateMerchantEvent extends Event {
    validationURL: string;
  }

  export interface PaymentAuthorizedEvent extends Event {
    payment: ApplePayPaymentToken;
  }

  export interface CancelEvent extends Event {
    type: 'cancel';
  }
}
