import { NextResponse } from 'next/server';
import { User } from '@/models/User';
import connectDB from '@/lib/db';
import { object, string, pipe, email, parse } from 'valibot';
import crypto from 'crypto';
import { sendMail, generatePasswordResetEmail } from '@/lib/mail';

const forgotPasswordSchema = object({
  email: pipe(
    string(),
    email('Please enter a valid email address')
  ),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    try {
      parse(forgotPasswordSchema, body);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: body.email });

    // If user doesn't exist, still return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists with this email, you will receive password reset instructions.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Log token generation
    console.log('Generated reset token for user:', {
      email: user.email,
      resetToken,
      resetTokenExpiry: new Date(resetTokenExpiry)
    });

    // Save reset token to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Verify token was saved
    const updatedUser = await User.findById(user._id);
    console.log('Saved token verification:', {
      email: updatedUser.email,
      hasToken: !!updatedUser.resetToken,
      tokenMatch: updatedUser.resetToken === resetToken,
      expiry: new Date(updatedUser.resetTokenExpiry)
    });

    // Send password reset email
    const emailResult = await sendMail({
      to: user.email,
      subject: 'Reset Your Password',
      html: generatePasswordResetEmail(resetToken),
    });

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'If an account exists with this email, you will receive password reset instructions.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 