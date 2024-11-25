'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { useApi } from '@/hooks/useApi';
import { ApiResponse } from '@/types/utils';

const formSchema = z.object({
  amount: z.string().refine((value) => !isNaN(Number(value)) && Number(value) > 0, 'Amount must be a positive number'),
  recipientName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  iban: z.string().refine((value) => /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(value.replace(/\s/g, '')), 'Invalid IBAN format'),
  paymentMethod: z.enum(['iban', 'applepay'], { required_error: 'Please select a payment method' }),
});

type FormData = z.infer<typeof formSchema>;

interface PaymentResponse {
  transactionId: string;
  status: 'success' | 'failed';
}

export default function PaymentForm() {
  const { toast } = useToast();
  const api = useApi<PaymentResponse>('/api');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      recipientName: '',
      iban: '',
      email: '',
      paymentMethod: 'iban',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response: ApiResponse<PaymentResponse> = await api.post('/payment', data);
      
      if (response.success) {
        toast({
          title: 'Payment Successful',
          description: 'Your payment has been processed successfully.',
        });
      } else {
        throw new Error(response.error?.message || 'Payment failed');
      }
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'An error occurred while processing your payment.',
        variant: 'destructive',
      });
    }
  };

  const paymentMethod = watch('paymentMethod');

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount')}
              aria-invalid={!!errors.amount}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientName">Recipient Name</Label>
            <Input
              id="recipientName"
              {...register('recipientName')}
              aria-invalid={!!errors.recipientName}
            />
            {errors.recipientName && (
              <p className="text-sm text-red-500">{errors.recipientName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setValue('paymentMethod', value as 'iban' | 'applepay')}
              aria-invalid={!!errors.paymentMethod}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="iban" id="iban" />
                <Label htmlFor="iban">Bank Transfer (IBAN)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="applepay" id="applepay" />
                <Label htmlFor="applepay">Apple Pay</Label>
              </div>
            </RadioGroup>
            {errors.paymentMethod && (
              <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
            )}
          </div>

          {paymentMethod === 'iban' && (
            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                {...register('iban')}
                aria-invalid={!!errors.iban}
              />
              {errors.iban && (
                <p className="text-sm text-red-500">{errors.iban.message}</p>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                Processing...
              </>
            ) : (
              'Submit Payment'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
