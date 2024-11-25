'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  email?: string;
  name?: string;
}

interface UserProfileProps {
  user: User | null;
}

export function UserProfile({ user }: UserProfileProps): JSX.Element {
  const email = user?.email ?? 'No email provided';
  const name = user?.name ?? 'Anonymous';
  const initials = React.useMemo(() => 
    name.split(' ').map(n => n[0]).join('').toUpperCase(),
    [name]
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${initials}`} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
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