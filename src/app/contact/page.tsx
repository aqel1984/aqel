'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import AppleBusinessChat from '@/components/AppleBusinessChat';
import { Card } from '@/components/ui/card';
import { EnvelopeClosedIcon, MobileIcon, HomeIcon } from '@radix-ui/react-icons';

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    toast({
      title: "Message sent",
      description: "We'll get back to you as soon as possible.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                type="email" 
                id="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required 
              />
            </div>
            
            <Button type="submit">Send Message</Button>
          </form>
        </div>
        
        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <EnvelopeClosedIcon className="h-5 w-5 text-primary" />
                <span>info@aqeljehadltd.net</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <MobileIcon className="h-5 w-5 text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <HomeIcon className="h-5 w-5 text-primary" />
                <span>123 Business Street, Suite 100<br />City, State 12345</span>
              </div>
            </div>
          </Card>
          
          <Separator className="my-6" />
          
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Chat with us on Apple Business</h3>
            <AppleBusinessChat />
          </div>
        </div>
      </div>
    </div>
  );
}