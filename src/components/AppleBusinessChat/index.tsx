'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AppleBusinessChatProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  productName?: string;
  quantity?: string;
  inquiryType?: 'product' | 'shipping' | 'bulk' | 'general';
  style?: 'button' | 'card' | 'inline';
  showIcon?: boolean;
}

const INQUIRY_TEMPLATES = {
  product: (productName?: string) => 
    `Hi, I'm interested in your ${productName || 'Shea Butter products'}. Can you provide more information?`,
  shipping: (productName?: string) => 
    `Hi, I'd like to know about shipping options for ${productName || 'your products'}. Can you help?`,
  bulk: (productName?: string, quantity?: string) => 
    `Hi, I'm interested in placing a bulk order for ${quantity || ''} ${productName || 'Shea Butter'}. Can we discuss pricing?`,
  general: () => 
    `Hi, I have a question about your products. Can someone assist me?`
};

export default function AppleBusinessChat({ 
  className = '',
  variant = 'default',
  size = 'default',
  productName,
  quantity,
  inquiryType = 'general',
  style = 'button',
  showIcon = true
}: AppleBusinessChatProps) {
  const [isAvailable, setIsAvailable] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if we're in test mode and get the test email
    const testEmail = process.env['NEXT_PUBLIC_APPLE_BUSINESS_CHAT_TEST_EMAIL'];
    setUserEmail(testEmail || null);
  }, []);

  const handleStartChat = () => {
    try {
      // Use the official test URL
      const baseUrl = 'https://bcrw.apple.com/urn:biz:b7165e13b-45ec-bbda-4ffee5c373ff';
      
      // Get the appropriate message template
      const messageTemplate = INQUIRY_TEMPLATES[inquiryType];
      const message = messageTemplate(productName, quantity);

      // Construct the URL with query parameters
      const url = new URL(baseUrl);
      url.searchParams.append('body', message);
      
      if (userEmail) {
        url.searchParams.append('email', userEmail);
      }

      // Open the Messages app
      window.location.href = url.toString();

      toast({
        title: 'Starting Chat',
        description: 'Opening Apple Business Chat...',
      });
    } catch (error) {
      console.error('Failed to open Apple Business Chat:', error);
      setIsAvailable(false);
      toast({
        title: 'Error',
        description: 'Failed to start Apple Business Chat. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!isAvailable) {
    return null;
  }

  const renderTestModeIndicator = () => {
    if (!process.env['NEXT_PUBLIC_APPLE_BUSINESS_CHAT_TEST_EMAIL']) return null;
    
    return (
      <div className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full mb-2">
        Test Mode {userEmail && `- Using ${userEmail}`}
      </div>
    );
  };

  if (style === 'card') {
    return (
      <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
        {renderTestModeIndicator()}
        <div className="flex items-start space-x-4 mb-4">
          <div className="bg-white p-2 rounded-full">
            <Image
              src="/apple-logo-white.png"
              alt="Apple Business Chat"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Chat with Our Team</h3>
            <p className="text-gray-600 text-sm mb-4">
              Get instant answers about our {productName || 'Shea Butter products'} on your iPhone or iPad
            </p>
          </div>
        </div>
        <Button
          onClick={handleStartChat}
          variant={variant}
          size={size}
          className={`w-full justify-center ${className}`}
        >
          {showIcon && <MessageCircle className="w-4 h-4 mr-2" />}
          Start Chat on Messages
        </Button>
      </div>
    );
  }

  if (style === 'inline') {
    return (
      <div>
        {renderTestModeIndicator()}
        <div className="flex items-center space-x-2">
          {showIcon && (
            <Image
              src="/apple-logo-white.png"
              alt="Apple Business Chat"
              width={20}
              height={20}
              className="w-5 h-5"
            />
          )}
          <button
            onClick={handleStartChat}
            className="text-primary hover:underline font-medium"
          >
            Chat with us on Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {renderTestModeIndicator()}
      <Button
        onClick={handleStartChat}
        variant={variant}
        size={size}
        className={`flex items-center space-x-2 ${className}`}
      >
        {showIcon && (
          <Image
            src="/apple-logo-white.png"
            alt="Apple Business Chat"
            width={20}
            height={20}
            className="w-5 h-5"
          />
        )}
        <span>Message us on Apple Business Chat</span>
      </Button>
    </div>
  );
}