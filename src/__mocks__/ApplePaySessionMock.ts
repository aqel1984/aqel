/* eslint-disable @typescript-eslint/no-unused-vars */

class ApplePaySessionMock {
  static canMakePayments(): boolean {
    return true;
  }

  static supportsVersion(version: number): boolean {
    return version === 3;
  }

  constructor(
    private _version: number,
    private _paymentRequest: ApplePayJS.ApplePayPaymentRequest
  ) {}

  begin(): void {
    // Mock implementation
  }

  onvalidatemerchant(_: ApplePayJS.ApplePayValidateMerchantEvent): void {
    // Mock implementation
  }

  onpaymentauthorized(_: ApplePayJS.ApplePayPaymentAuthorizedEvent): void {
    // Mock implementation
  }

  completeMerchantValidation(_: unknown): void {
    // Mock implementation
  }

  completePayment(_: number): void {
    // Mock implementation
  }
}

export default ApplePaySessionMock;