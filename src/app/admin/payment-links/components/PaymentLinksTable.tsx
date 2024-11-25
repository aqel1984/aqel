'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentLink } from '@/lib/services/payment-link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { CopyIcon, DotsVerticalIcon, ExternalLinkIcon, Cross2Icon } from '@radix-ui/react-icons';

interface PaymentLinksTableProps {
  paymentLinks: PaymentLink[];
}

export function PaymentLinksTable({ paymentLinks }: PaymentLinksTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function copyPaymentLink(id: string) {
    const url = `${window.location.origin}/pay/${id}`;
    await navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied',
      description: 'Payment link has been copied to clipboard',
    });
  }

  async function cancelPaymentLink(id: string) {
    setLoading(id);

    try {
      const response = await fetch(`/api/payment-links?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel payment link');
      }

      toast({
        title: 'Payment Link Cancelled',
        description: 'The payment link has been cancelled successfully',
      });

      router.refresh();
    } catch (error) {
      console.error('Failed to cancel payment link:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel payment link',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  }

  function getStatusColor(status: PaymentLink['status']) {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paymentLinks.map((link) => (
            <TableRow key={link.id}>
              <TableCell className="font-medium">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: link.currency,
                }).format(link.amount)}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(link.status)}>
                  {link.status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(link.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(link.expiresAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      disabled={loading === link.id}
                    >
                      <span className="sr-only">Open menu</span>
                      <DotsVerticalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => copyPaymentLink(link.id)}
                      disabled={link.status !== 'active'}
                    >
                      <CopyIcon className="mr-2 h-4 w-4" />
                      <span>Copy Link</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => window.open(`/pay/${link.id}`, '_blank')}
                      disabled={link.status !== 'active'}
                    >
                      <ExternalLinkIcon className="mr-2 h-4 w-4" />
                      <span>View</span>
                    </DropdownMenuItem>
                    {link.status === 'active' && (
                      <DropdownMenuItem
                        onClick={() => cancelPaymentLink(link.id)}
                        className="text-red-600"
                        disabled={loading === link.id}
                      >
                        <Cross2Icon className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {paymentLinks.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-gray-500"
              >
                No payment links found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
