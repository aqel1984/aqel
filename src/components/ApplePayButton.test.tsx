import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ApplePayButton } from './ApplePayButton';

// Mock window.ApplePaySession
const mockCanMakePayments = jest.fn();

class MockApplePaySession {
  completePayment: jest.Mock;
  begin: jest.Mock;
  private callbacks: { [key: string]: Function } = {};

  constructor() {
    this.completePayment = jest.fn();
    this.begin = jest.fn();
  }

  addEventListener(event: string, callback: Function) {
    this.callbacks[event] = callback;
  }

  // Helper method to trigger events in tests
  triggerEvent(event: string, data: any) {
    if (this.callbacks[event]) {
      this.callbacks[event](data);
    }
  }
}

describe('ApplePayButton', () => {
  let mockSession: MockApplePaySession;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSession = new MockApplePaySession();
    (window as any).ApplePaySession = jest.fn(() => mockSession);
    (window as any).ApplePaySession.canMakePayments = mockCanMakePayments;
  });

  it('should not render button when Apple Pay is not available', () => {
    mockCanMakePayments.mockReturnValue(false);
    render(
      <ApplePayButton
        amount={100}
        currency="USD"
        description="Test Payment"
        onSuccess={jest.fn()}
        onError={jest.fn()}
      />
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render button when Apple Pay is available', () => {
    mockCanMakePayments.mockReturnValue(true);
    render(
      <ApplePayButton
        amount={100}
        currency="USD"
        description="Test Payment"
        onSuccess={jest.fn()}
        onError={jest.fn()}
      />
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle successful payment', () => {
    mockCanMakePayments.mockReturnValue(true);

    const mockPaymentResponse = {
      token: {
        paymentData: {
          version: '1.0.0',
          data: 'mock-payment-data',
          signature: 'mock-signature',
          header: {
            ephemeralPublicKey: 'mock-ephemeral-key',
            publicKeyHash: 'mock-public-key-hash',
            transactionId: 'mock-transaction-id'
          }
        },
        paymentMethod: {
          displayName: 'Test Card',
          network: 'Visa',
          type: 'credit'
        },
        transactionIdentifier: 'test123'
      }
    };

    const onSuccess = jest.fn();
    const onError = jest.fn();

    render(
      <ApplePayButton
        amount={100}
        currency="USD"
        description="Test Payment"
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    // Click the Apple Pay button
    fireEvent.click(screen.getByRole('button'));

    // Simulate payment authorized event
    mockSession.triggerEvent('paymentauthorized', mockPaymentResponse);

    expect(onSuccess).toHaveBeenCalledWith(mockPaymentResponse.token);
    expect(onError).not.toHaveBeenCalled();
  });

  it('should handle payment error', () => {
    mockCanMakePayments.mockReturnValue(true);
    const onSuccess = jest.fn();
    const onError = jest.fn();

    render(
      <ApplePayButton
        amount={100}
        currency="USD"
        description="Test Payment"
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    // Simulate error in payment processing
    mockSession.triggerEvent('paymentauthorized', {
      payment: {
        token: null
      }
    });

    expect(onError).toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should handle payment cancellation', () => {
    mockCanMakePayments.mockReturnValue(true);
    const onSuccess = jest.fn();
    const onError = jest.fn();

    render(
      <ApplePayButton
        amount={100}
        currency="USD"
        description="Test Payment"
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    mockSession.triggerEvent('cancel', {});

    expect(onError).toHaveBeenCalledWith(new Error('Payment was cancelled'));
    expect(onSuccess).not.toHaveBeenCalled();
  });
});