"use client";

import Image from "next/image";
import { LoginForm } from "./LoginForm";

export default function Login() {
  return (
    <div className="flex flex-col sm:flex-row h-screen bg-[#172233]">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 w-full sm:w-[50%]">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
          <LoginForm />
        </div>
      </div>

      {/* Right Side - Image (Hidden on mobile) */}
      <div className="hidden sm:block flex-1 w-full sm:w-[50%] relative">
        <Image 
          src="/login2.png" 
          alt="login image cover" 
          fill 
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}