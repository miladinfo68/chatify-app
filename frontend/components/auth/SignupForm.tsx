"use client";

import Link from "next/link";

export const SignupForm = () => {
  return (
    <div className="space-y-3 w-full">
      <h2 className="text-lg sm:text-xl font-bold text-white text-center">
        Create Account
      </h2>
      <p className="text-xs text-gray-300 text-center">
        Sign up to get started with your account.
      </p>
      <form
        action=""
        className="w-full border border-gray-600 rounded-lg p-3 sm:p-4 space-y-3"
      >
        <div className="flex flex-col">
          <label
            htmlFor="name"
            className="text-xs font-medium text-gray-200 mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            className="w-full px-2 sm:px-3 py-1 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            placeholder="Enter your full name"
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="text-xs font-medium text-gray-200 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className="w-full px-2 sm:px-3 py-1 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            placeholder="Enter your email"
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="password"
            className="text-xs font-medium text-gray-200 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            className="w-full px-2 sm:px-3 py-1 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            placeholder="Create a password"
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-medium text-gray-200 mb-1"
          >
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            className="w-full px-2 sm:px-3 py-1 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            placeholder="Confirm your password"
          />
        </div>
        <button
          type="submit"
          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
        >
          Sign Up
        </button>
      </form>
      <p className="text-xs text-gray-400 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-400 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};