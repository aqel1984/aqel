'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface User {
  email?: string;
  name?: string;
}

interface SimpleUserProfileProps {
  user: User | null;
}

export function SimpleUserProfile({ user }: SimpleUserProfileProps): JSX.Element {
  const email = user?.email ?? 'No email provided';
  const name = user?.name ?? 'Anonymous';

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Email: <span className="font-medium">{email}</span>
        </p>
      </CardContent>
    </Card>
  );
}