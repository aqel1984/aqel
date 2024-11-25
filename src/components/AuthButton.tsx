'use client';

import { useEffect, useState } from 'react';
import { User, createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const supabase = createClientComponentClient({
    supabaseUrl,
    supabaseKey,
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env['NEXT_PUBLIC_WEBSITE_URL']}/auth/callback`,
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return user ? (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleSignOut}
    >
      Sign Out
    </Button>
  ) : (
    <Button
      variant="outline"
      className="w-full flex items-center gap-2"
      onClick={handleSignIn}
    >
      <Icons.google className="w-4 h-4" />
      <span>Sign In with Google</span>
    </Button>
  );
}