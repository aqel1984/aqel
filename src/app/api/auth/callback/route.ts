import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
    } catch (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL('/auth/signin?error=Unable to authenticate', request.url));
    }
  } else {
    console.error('No code provided in the callback');
    return NextResponse.redirect(new URL('/auth/signin?error=No authentication code provided', request.url));
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', request.url));
}