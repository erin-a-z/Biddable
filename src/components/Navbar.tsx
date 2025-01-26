'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Navbar() {
  const [user] = useAuthState(auth);

  return (
    <nav className="bg-gray-900 fixed w-full top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/bidable.jpg.png"
              alt="Hush Bids Logo"
              width={48}
              height={48}
              className="w-8 sm:w-10 md:w-12 h-auto transition-all duration-300"
              priority
            />
            <span className="text-white font-bold text-lg sm:text-xl md:text-2xl">
              Biddable
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/settings"
                  className="text-gray-300 hover:text-gray-100"
                >
                  Settings
                </Link>
                <button
                  onClick={() => auth.signOut()}
                  className="text-gray-300 hover:text-gray-100"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-600"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}