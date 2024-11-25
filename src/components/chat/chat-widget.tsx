'use client'

import React from 'react';
import dynamic from 'next/dynamic';

const AppleBusinessChat = dynamic(() => import('@/components/AppleBusinessChat'), { ssr: false });

const ChatWidget: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <h2 className="text-lg font-semibold mb-2">Chat with us</h2>
      <AppleBusinessChat 
        style="default"
        variant="default"
        size="default"
        buttonText="Chat with us"
        className="mt-4"
      />
    </div>
  );
};

export default ChatWidget;