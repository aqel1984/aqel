'use client';

import { useEffect, useState } from 'react';
import { RefundRequest } from '@/lib/services/refund';
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

interface RefundRequestsProps {
  limit?: number;
}

export default function RefundRequests({ limit = 10 }: RefundRequestsProps) {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const response = await fetch(`/api/refunds?limit=${limit}`);
      const data = await response.json();
      if (data.success) {
        setRefunds(data.refunds);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch refunds',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch refunds',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async (paymentId: string) => {
    try {
      const response = await fetch('/api/refunds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Refund processed successfully',
        });
        fetchRefunds();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to process refund',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process refund',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recent Refund Requests</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {refunds.map((refund) => (
            <TableRow key={refund.paymentId}>
              <TableCell>{refund.paymentId}</TableCell>
              <TableCell>
                {refund.amount} {refund.currency}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    refund.status === 'processed'
                      ? 'secondary'
                      : refund.status === 'rejected'
                      ? 'destructive'
                      : 'default'
                  }
                >
                  {refund.status}
                </Badge>
              </TableCell>
              <TableCell>{refund.customerEmail}</TableCell>
              <TableCell>
                {new Date(refund.requestDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {refund.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => handleProcessRefund(refund.paymentId)}
                  >
                    Process
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
