"use client";

import Link from "next/link";

export const LoginForm = () => {
  return (
    <div className="space-y-4 w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
        Welcome Back
      </h2>
      <p className="text-xs sm:text-sm text-gray-300 text-center">
        Enter your credentials to access your account.
      </p>
      <form
        action=""
        className="w-full border border-gray-600 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6"
      >
        <div className="flex flex-col">
          <label
            htmlFor="username"
            className="text-sm font-medium text-gray-200 mb-1"
          >
            Username
          </label>
          <input
            type="text"
            name="username"
            id="username"
            className="w-full px-3 sm:px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm sm:text-base"
            placeholder="Enter your username"
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-200 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            className="w-full px-3 sm:px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm sm:text-base"
            placeholder="Enter your password"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm sm:text-base"
        >
          Login
        </button>
      </form>
      <p className="text-xs sm:text-sm text-gray-400 text-center">
        Dont have an account?{" "}
        <Link href="/sign-up" className="text-indigo-400 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};
