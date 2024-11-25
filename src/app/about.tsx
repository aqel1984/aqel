import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Metadata } from 'next';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'About Us | Aqel Jehad LTD',
  description: 'Learn about Aqel Jehad LTD, a leading supplier of high-quality shea butter and related products.',
};

export default function AboutPage() {
  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Navigation />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">About Us</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-4">
                We are a leading supplier of high-quality shea butter and related products. Our mission is to provide the best natural ingredients while supporting sustainable practices and fair trade.
              </p>
              <p className="text-lg mb-4">
                With years of experience in the industry, we have built strong relationships with local farmers and producers, ensuring that we deliver only the finest raw materials to our customers.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Our Values</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Quality: We never compromise on the quality of our products</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Sustainability: We support environmentally friendly practices</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Fair Trade: We ensure fair compensation for all our partners</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Innovation: We continuously seek to improve our processes and products</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}