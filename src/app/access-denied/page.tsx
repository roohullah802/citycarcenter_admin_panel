"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-center backdrop-blur-sm max-w-md w-full">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20">
          <svg className="h-8 w-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-rose-500">Access Denied</h1>
        <p className="mb-8 text-surface-400">
          You do not have permission to view this page. This area is restricted to administrators only. 
          If your permissions were recently updated, please sign out and sign in again.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            className="w-full rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-surface-900"
          >
            Sign in with a different account
          </button>
        </div>
      </div>
    </div>
  );
}
