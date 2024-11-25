declare global {
  interface ApplePaySession {
    begin(): void;
    completeMerchantValidation(merchantSession: unknown): void;
    completePayment(status: number): void;
    onmerchantvalidation: (event: unknown) => void;
    onpaymentauthorized: (event: unknown) => void;
  }

  interface ApplePaySessionConstructor {
    new (version: number, paymentRequest: ApplePayJS.ApplePayPaymentRequest): ApplePaySession;
    canMakePayments(): boolean;
    STATUS_SUCCESS: number;
    STATUS_FAILURE: number;
  }

  interface Window {
    ApplePaySession: ApplePaySessionConstructor;
  }
}

export {};