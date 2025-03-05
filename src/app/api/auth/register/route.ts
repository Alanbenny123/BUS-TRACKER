  import { NextResponse } from 'next/server';
import { User } from '@/models/User';
import connectDB from '@/lib/db';
import { registerSchema } from '@/app/(auth)/register/_components/RegisterForm/schema';
import { parse } from 'valibot';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    try {
      parse(registerSchema, body);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = await User.create(body);

    return NextResponse.json(
      { message: 'User registered successfully', userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 