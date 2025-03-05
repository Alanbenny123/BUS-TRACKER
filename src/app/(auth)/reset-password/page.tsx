'use client';

import { useSearchParams } from 'next/navigation';
import ResetPasswordForm from './_components/ResetPasswordForm';
import Link from 'next/link';

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              This password reset link is invalid or has expired.
            </p>
            <div className="mt-4">
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Request a new password reset
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            alt="Your Company"
            src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white">
    
            Create new password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-white">
            Please enter your new password below.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <ResetPasswordForm />
          </div>
        </div>
      </div>
    </>
  );
} 