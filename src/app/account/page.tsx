import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account Management | Jehad Aqel Ltd',
  description: 'Manage your account settings and preferences.',
};

export default function AccountPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Account</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Welcome to your account management page. Here you can:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Update your personal information</li>
            <li>Change your password</li>
            <li>View your order history</li>
            <li>Manage your preferences</li>
          </ul>
          <p>Please note: Account management features are currently under development.</p>
        </CardContent>
      </Card>
    </main>
  )
}