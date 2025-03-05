'use client';

import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { object, string, pipe, email, minLength } from 'valibot';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import PasswordInput from '@/components/ui/PasswordInput';

const loginSchema = object({
  email: pipe(
    string(),
    email('Please enter a valid email address')
  ),
  password: pipe(
    string(),
    minLength(6, 'Password must be at least 6 characters')
  ),
});

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(
    searchParams.get('registered') === 'true' || searchParams.get('reset') === 'true'
  );
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: valibotResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError('Invalid email or password');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      setError('An error occurred during login');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {showSuccess && searchParams.get('registered') === 'true' && (
        <div className="text-green-500 text-sm text-center">
          Registration successful! Please sign in with your credentials.
        </div>
      )}

      {showSuccess && searchParams.get('reset') === 'true' && (
        <div className="text-green-500 text-sm text-center">
          Password reset successful! Please sign in with your new password.
        </div>
      )}
      
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

      <PasswordInput
        id="password"
        label="Password"
        registration={register('password')}
        error={errors.password?.message}
      />

      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="flex h-6 shrink-0 items-center">
            <div className="group grid size-4 grid-cols-1">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
              />
              <svg
                fill="none"
                viewBox="0 0 14 14"
                className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
              >
                <path
                  d="M3 8L6 11L11 3.5"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-0 group-has-[:checked]:opacity-100"
                />
              </svg>
            </div>
          </div>
          <label htmlFor="remember-me" className="block text-sm/6 text-gray-900">
            Remember me
          </label>
        </div>

        <div className="text-sm/6">
          <Link
            href="/forgot-password"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </div>

      <div className='text-center'>
        <span className='text-sm/6 text-gray-900'>Not a member? <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">Register now</Link></span>
      </div>
    </form>
  );
} 