'use client';

import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import Link from 'next/link';
import { currentYear, type RegisterFormData, registerSchema } from './RegisterForm/schema';
import { useRouter } from 'next/navigation';
import PasswordInput from '@/components/ui/PasswordInput';

export default function RegisterForm() {
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: valibotResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError("root", { message: result.error || 'Registration failed' });
        return;
      }

      router.push('/login?registered=true');
    } catch (error) {
      setError("root", { message: 'An error occurred during registration' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errors.root && (
        <div className="text-red-500 text-sm text-center">{errors.root.message}</div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900">
          Full Name
        </label>
        <div className="mt-2">
          <input
            {...register('name')}
            type="text"
            id="name"
            autoComplete="name"
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
      </div>

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
        autoComplete="new-password"
        registration={register('password')}
        error={errors.password?.message}
      />

      <div>
        <label htmlFor="phoneNumber" className="block text-sm/6 font-medium text-gray-900">
          Phone Number
        </label>
        <div className="mt-2">
          <input
            {...register('phoneNumber')}
            type="tel"
            id="phoneNumber"
            autoComplete="tel"
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.phoneNumber.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="courseStream" className="block text-sm/6 font-medium text-gray-900">
          Course Stream
        </label>
        <div className="mt-2">
          <input
            {...register('courseStream')}
            type="text"
            id="courseStream"
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          />
          {errors.courseStream && (
            <p className="mt-1 text-sm text-red-500">{errors.courseStream.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="passoutYear" className="block text-sm/6 font-medium text-gray-900">
          Passout Year
        </label>
        <div className="mt-2">
          <input
            {...register('passoutYear', { valueAsNumber: true })}
            type="number"
            id="passoutYear"
            min={currentYear}
            max={currentYear + 5}
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          />
          {errors.passoutYear && (
            <p className="mt-1 text-sm text-red-500">{errors.passoutYear.message}</p>
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </div>

      <div className='text-center'>
        <span className='text-sm/6 text-gray-900'>Already have an account? <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">Sign in</Link></span>
      </div>
    </form>
  );
} 