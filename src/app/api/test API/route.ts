import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ message: 'Test API is working', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error in Test API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}