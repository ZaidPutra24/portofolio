import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');

    // Hardcoded check or proxy logic
    if (username === 'admin@portfolio.com' && password === 'admin123') {
      return NextResponse.json({
        access_token: 'fake-admin-jwt-token-for-demo',
        token_type: 'bearer',
      });
    }

    return NextResponse.json(
      { detail: 'Invalid email or password' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { detail: (error as Error).message },
      { status: 500 }
    );
  }
}
