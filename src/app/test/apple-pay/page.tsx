'use client';

import { useState } from 'react';
import { ApplePayButton } from '@/components/ApplePayButton';
import { useToast } from '@/components/ui/use-toast';

export default function ApplePayTestPage() {
  const [result, setResult] = useState<string>('');
  const { toast } = useToast();

  const handleSuccess = (response: any) => {
    setResult(JSON.stringify(response, null, 2));
    toast({
      title: "Success",
      description: "Payment processed successfully",
    });
  };

  const handleError = (error: Error) => {
    setResult(error.message);
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Apple Pay Test</h1>
      <div className="space-y-4">
        <ApplePayButton
          amount={10.99}
          description="Test Payment"
          currency="GBP"
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded-lg overflow-auto">
          {result}
        </pre>
      )}
    </div>
  );
}
