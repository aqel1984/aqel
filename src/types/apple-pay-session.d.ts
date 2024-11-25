interface ApplePaySessionConstructor {
  new(version: number, paymentRequest: ApplePayJS.ApplePayPaymentRequest): ApplePaySession;
  canMakePayments(): boolean;
  STATUS_SUCCESS: number;
  STATUS_FAILURE: number;
}

interface ApplePaySession {
  onvalidatemerchant: ((event: ApplePayJS.ValidateMerchantEvent) => void) | null;
  onpaymentauthorized: ((event: ApplePayJS.PaymentAuthorizedEvent) => void) | null;
  oncancel: ((event: Event) => void) | null;
  begin(): void;
  abort(): void;
  completeMerchantValidation(merchantSession: any): void;
  completePayment(status: number): void;
}

declare global {
  const ApplePaySession: ApplePaySessionConstructor;
  interface Window {
    ApplePaySession: ApplePaySessionConstructor;
  }
}
