import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const response = NextResponse.json({ success: true });
    
    // Set a session cookie
    response.cookies.set('session', JSON.stringify(data.session), {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Sign-in error:', error);
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  }
}