import { createClient } from '@supabase/supabase-js'
import { logger } from './logger'

const log = logger('payment-links')

const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
)

export interface PaymentLink {
  id: string
  amount: number
  currency: string
  description: string
  status: 'pending' | 'completed' | 'failed'
  recipientEmail: string
  createdAt: string
  updatedAt: string
}

export async function getPaymentLink(id: string): Promise<PaymentLink | null> {
  try {
    const { data, error } = await supabase
      .from('payment_links')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      log.error('Error fetching payment link', { error, id })
      throw error
    }

    if (!data) {
      log.warn('Payment link not found', { id })
      return null
    }

    return {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
      status: data.status,
      recipientEmail: data.recipient_email,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    log.error('Failed to get payment link', error)
    throw error
  }
}

export async function createPaymentLink(data: Omit<PaymentLink, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<PaymentLink> {
  try {
    const { data: result, error } = await supabase
      .from('payment_links')
      .insert([{
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        recipient_email: data.recipientEmail,
        status: 'pending'
      }])
      .select()
      .single()

    if (error) {
      log.error('Error creating payment link', { error, data })
      throw error
    }

    return {
      id: result.id,
      amount: result.amount,
      currency: result.currency,
      description: result.description,
      status: result.status,
      recipientEmail: result.recipient_email,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    }
  } catch (error) {
    log.error('Failed to create payment link', error)
    throw error
  }
}

export async function updatePaymentLinkStatus(id: string, status: PaymentLink['status']): Promise<void> {
  try {
    const { error } = await supabase
      .from('payment_links')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      log.error('Error updating payment link status', { error, id, status })
      throw error
    }

    log.info('Payment link status updated', { id, status })
  } catch (error) {
    log.error('Failed to update payment link status', error)
    throw error
  }
}

export async function listPaymentLinks(limit = 10, offset = 0): Promise<{ data: PaymentLink[], count: number }> {
  try {
    const [{ data, error }, { count, error: countError }] = await Promise.all([
      supabase
        .from('payment_links')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
      supabase
        .from('payment_links')
        .select('*', { count: 'exact', head: true })
    ])

    if (error || countError) {
      log.error('Error fetching payment links', { error, countError })
      throw error || countError
    }

    return {
      data: data?.map(item => ({
        id: item.id,
        amount: item.amount,
        currency: item.currency,
        description: item.description,
        status: item.status,
        recipientEmail: item.recipient_email,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) || [],
      count: count || 0
    }
  } catch (error) {
    log.error('Failed to list payment links', error)
    throw error
  }
}
