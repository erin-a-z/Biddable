'use client';

import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Navbar() {
  const [user] = useAuthState(auth);

  return (
    <nav className="bg-gradient-to-r from-gray-800 via-gray-900 to-black shadow-lg border-b border-gray-700">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Increased margin to shift "Biddify" further to the right */}
          <Link href="/" className="text-xl font-bold text-white ml-10">
            Biddable
          </Link>
          <div className="flex items-center gap-6">
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