import Stripe from 'stripe';

if (!process.env['STRIPE_SECRET_KEY']) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'], {
  apiVersion: '2023-10-16',
  typescript: true,
});

export async function createPaymentIntent(amount: number, currency: string = 'usd') {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      payment_method_types: ['card'],
      capture_method: 'automatic',
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

export async function confirmCardPayment(
  paymentIntentId: string,
  paymentMethod: string
) {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethod,
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error confirming card payment:', error);
    throw error;
  }
}
