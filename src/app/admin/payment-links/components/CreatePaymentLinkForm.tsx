'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const createPaymentLinkSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  currency: z.string().length(3, 'Please select a currency'),
  description: z.string().optional(),
  expiresIn: z.number().optional(),
});

export function CreatePaymentLinkForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    description: '',
    expiresIn: '604800', // 7 days in seconds
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      const validatedData = createPaymentLinkSchema.parse({
        ...formData,
        amount: Number(formData.amount),
        expiresIn: Number(formData.expiresIn),
      });

      // Create payment link
      const response = await fetch('/api/payment-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment link');
      }

      // Copy link to clipboard
      const paymentUrl = `${window.location.origin}/pay/${data.paymentLink.id}`;
      await navigator.clipboard.writeText(paymentUrl);

      // Show success message
      toast({
        title: 'Payment Link Created',
        description: 'The link has been copied to your clipboard',
      });

      // Close dialog and refresh list
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to create payment link:', error);
      
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast({
            title: 'Validation Error',
            description: err.message,
            variant: 'destructive',
          });
        });
      } else {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'An error occurred',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Payment Link</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Payment Link</DialogTitle>
          <DialogDescription>
            Create a new payment link that you can share with your customers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="amount"
                className="text-sm font-medium text-gray-700"
              >
                Amount
              </label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="currency"
                className="text-sm font-medium text-gray-700"
              >
                Currency
              </label>
              <Select
                name="currency"
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, currency: value }))
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Description (optional)
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="expiresIn"
              className="text-sm font-medium text-gray-700"
            >
              Expires In
            </label>
            <Select
              name="expiresIn"
              value={formData.expiresIn}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, expiresIn: value }))
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select expiration time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3600">1 hour</SelectItem>
                <SelectItem value="86400">24 hours</SelectItem>
                <SelectItem value="604800">7 days</SelectItem>
                <SelectItem value="2592000">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
