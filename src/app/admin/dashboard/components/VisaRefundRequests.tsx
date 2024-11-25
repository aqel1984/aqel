import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { VisaRefundData } from '@/lib/services/visa-refund';

export default function VisaRefundRequests() {
  const [refunds, setRefunds] = useState<VisaRefundData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const response = await fetch('/api/visa-direct/refund');
      if (!response.ok) throw new Error('Failed to fetch refunds');
      const data = await response.json();
      setRefunds(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load refund requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async (refund: VisaRefundData) => {
    try {
      const response = await fetch('/api/visa-direct/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: refund.transactionId,
          amount: refund.amount,
          currency: refund.currency,
          reason: refund.reason,
          merchantId: refund.merchantId,
          customerEmail: refund.customerEmail,
        }),
      });

      if (!response.ok) throw new Error('Failed to process refund');

      toast({
        title: 'Success',
        description: 'Refund processed successfully',
      });

      // Refresh the refunds list
      fetchRefunds();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process refund',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "destructive" | "secondary" | "outline" } = {
      pending: 'default',
      processing: 'secondary',
      completed: 'outline',
      failed: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return <div>Loading refund requests...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Visa Refund Requests</h2>
        <Button onClick={fetchRefunds}>Refresh</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {refunds.map((refund) => (
            <TableRow key={refund.transactionId}>
              <TableCell className="font-mono">
                {refund.transactionId}
              </TableCell>
              <TableCell>
                {formatCurrency(refund.amount, refund.currency)}
              </TableCell>
              <TableCell>{refund.customerEmail}</TableCell>
              <TableCell>{getStatusBadge(refund.status)}</TableCell>
              <TableCell>
                {formatDate(refund.createdAt)}
              </TableCell>
              <TableCell>
                {refund.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => handleProcessRefund(refund)}
                  >
                    Process Refund
                  </Button>
                )}
                {refund.status === 'failed' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleProcessRefund(refund)}
                  >
                    Retry
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {refunds.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                No refund requests found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
