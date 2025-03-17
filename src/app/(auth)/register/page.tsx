import Image from 'next/image';
import RegisterForm from './_components/RegisterForm';

export default function Register() {
  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Image
            alt="Your Company"
            src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
            width={40}
            height={40}
            className="mx-auto w-auto"
            priority
          />
          <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white">
            Create your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <RegisterForm />
          </div>
        </div>
      </div>
    </>
  );
}