'use client';

import { useState } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { BiShow, BiHide } from 'react-icons/bi';

interface PasswordInputProps {
  id: string;
  label: string;
  error?: string;
  autoComplete?: string;
  registration: UseFormRegisterReturn;
}

export default function PasswordInput({
  id,
  label,
  error,
  autoComplete = 'current-password',
  registration
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-sm/6 font-medium text-gray-900">
        {label}
      </label>
      <div className="mt-2 relative">
        <input
          {...registration}
          type={showPassword ? 'text' : 'password'}
          id={id}
          autoComplete={autoComplete}
          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? (
            <BiHide className="w-5 h-5" aria-label="Hide password" />
          ) : (
            <BiShow className="w-5 h-5" aria-label="Show password" />
          )}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
} 