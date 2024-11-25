import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    const response = NextResponse.json({ success: true });
    
    // Clear the session cookie
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Sign-out error:', error);
    return NextResponse.json({ success: false, message: 'Error during sign-out' }, { status: 500 });
  }
}