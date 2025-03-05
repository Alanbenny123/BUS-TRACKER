'use client';

import { signOut } from 'next-auth/react';
import { BiLogOut } from 'react-icons/bi';

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ 
      redirect: true,
      callbackUrl: '/login'
    });
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-white/70 hover:bg-white/5 hover:text-white w-full"
    >
      <BiLogOut className="w-5 h-5" />
      <span className="text-sm font-medium">Logout</span>
    </button>
  );
} 