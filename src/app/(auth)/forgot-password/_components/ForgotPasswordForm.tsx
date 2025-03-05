'use client';

import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { object, string, pipe, email } from 'valibot';
import { useState } from 'react';
import Link from 'next/link';

const forgotPasswordSchema = object({
  email: pipe(
    string(),
    email('Please enter a valid email address')
  ),
});

type ForgotPasswordFormData = {
  email: string;
};

export default function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: valibotResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Something went wrong');
        return;
      }

      setIsEmailSent(true);
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  if (isEmailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-500">
          Password reset instructions have been sent to your email.
        </div>
        <p className="text-sm text-gray-600">
          Please check your inbox/spam folder and follow the instructions to reset your password.
        </p>
        <div className="mt-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="text-red-500 text-sm text-center">{error}</div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
          Email address
        </label>
        <div className="mt-2">
          <input
            {...register('email')}
            type="email"
            id="email"
            autoComplete="email"
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
        </button>
      </div>

      <div className="text-center">
        <Link
          href="/login"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Back to login
        </Link>
      </div>
    </form>
  );
} 