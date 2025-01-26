'use client';

import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Navbar() {
  const [user] = useAuthState(auth);

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Bidding Platform
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/settings"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Settings
                </Link>
                <button
                  onClick={() => auth.signOut()}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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