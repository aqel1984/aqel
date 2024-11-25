import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!
);

export interface TransactionLog {
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  cardLast4?: string;
  errorMessage?: string;
  metadata?: any;
}

export class PaymentLogger {
  static async logTransaction(data: TransactionLog) {
    try {
      const { error } = await supabase
        .from('payment_logs')
        .insert({
          transaction_id: data.transactionId,
          amount: data.amount,
          currency: data.currency,
          payment_method: data.paymentMethod,
          status: data.status,
          card_last4: data.cardLast4,
          error_message: data.errorMessage,
          metadata: data.metadata,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      console.log(`[Payment Log] Transaction ${data.transactionId} logged successfully`);
    } catch (error) {
      console.error('[Payment Log] Error logging transaction:', error);
    }
  }

  static async getTransactionLog(transactionId: string) {
    try {
      const { data, error } = await supabase
        .from('payment_logs')
        .select('*')
        .eq('transaction_id', transactionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Payment Log] Error retrieving transaction:', error);
      return null;
    }
  }
}
