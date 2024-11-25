import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;

    if (session) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata['full_name'] || null,
        }
      });
    } else {
      return NextResponse.json({ authenticated: false });
    }
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Error checking authentication status' },
      { status: 500 }
    );
  }
}