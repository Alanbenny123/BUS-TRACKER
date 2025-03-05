import { NextResponse } from 'next/server';
import { User } from '@/models/User';
import connectDB from '@/lib/db';
import { object, string, pipe, minLength, parse } from 'valibot';

const resetPasswordSchema = object({
  token: string(),
  password: pipe(
    string(),
    minLength(6, 'Password must be at least 6 characters')
  ),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    try {
      parse(resetPasswordSchema, body);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Log the token we're searching for
    console.log('Searching for user with token:', body.token);

    // Find user by reset token and check if token is not expired
    const user = await User.findOne({
      resetToken: body.token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    // Log if user was found
    console.log('User found:', !!user);
    if (user) {
      console.log('Token expiry:', new Date(user.resetTokenExpiry));
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Update password and clear reset token
    user.password = body.password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return NextResponse.json(
      { message: 'Password reset successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 