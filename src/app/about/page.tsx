import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Jehad Aqel Ltd',
  description: 'Learn about our story, mission, and commitment to quality products and customer service.',
};

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">About Us</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Our Story</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            We are a passionate team dedicated to providing high-quality products and excellent customer service.
            Our journey began in 2010 with a simple idea: to create a store that puts customers first.
          </p>
          <p className="mb-4">
            Over the years, we&apos;ve grown from a small local shop to an online retailer serving customers worldwide.
            We take pride in our carefully curated selection of products and our commitment to sustainability.
          </p>
          <p>
            Thank you for being a part of our story. We look forward to serving you and continuing to grow together.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}