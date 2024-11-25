'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function EmailTestPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  const handleTestEmail = async () => {
    try {
      setLoading(true);
      setStatus({ type: null, message: '' });

      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email');
      }

      setStatus({
        type: 'success',
        message: `Test email sent successfully! Message ID: ${data.messageId}`,
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to send test email',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Email Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Test Email Address
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="w-full"
          />
        </div>

        <Button
          onClick={handleTestEmail}
          disabled={!email || loading}
          className="w-full"
        >
          {loading ? 'Sending...' : 'Send Test Email'}
        </Button>

        {status.message && (
          <div
            className={`p-4 rounded-md ${
              status.type === 'success'
                ? 'bg-green-50 text-green-800'
                : status.type === 'error'
                ? 'bg-red-50 text-red-800'
                : ''
            }`}
          >
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
