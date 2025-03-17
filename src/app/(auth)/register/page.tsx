'use client';

import Image from 'next/image';
import RegisterForm from './_components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={48}
              height={48}
              className="h-12 w-auto"
              priority
            />
          </div>
          <div className="mt-8">
            <div className="mt-6">
              <RegisterForm />
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="/auth-bg.jpg"
          alt="Background"
          width={1920}
          height={1080}
          priority
        />
      </div>
    </div>
  );
}