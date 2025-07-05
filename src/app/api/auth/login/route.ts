import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    // Check if username is admin
    if (username !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Kullanıcı adı hatalı' },
        { status: 401 }
      );
    }
    
    // Get password from environment variable via our env config
    const adminPassword = env.ADMIN_PASSWORD;
    
    // Check if password matches
    if (password === adminPassword) {
      return NextResponse.json(
        { success: true, message: 'Giriş başarılı' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: 'Parola hatalı' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 