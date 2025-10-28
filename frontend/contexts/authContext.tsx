"use client"

import { createContext, ReactNode, useContext } from "react";

export interface SignInPayload {
  username: string;
  password: string;
}

export interface SignUpPayload extends SignInPayload {
  user: string;
  age?: number;
}

export interface UserInfo {
  userId: string;
  name: string;
  email: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  signIn: (payload: SignInPayload) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const userInfo: UserInfo | null = null;
  const isAuthenticated = false;
  const signIn = async (payload: SignInPayload) => {};
  const signUp = async (payload: SignUpPayload) => {};
  const logout = () => {};

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userInfo,
        signIn,
        signUp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, useAuth, AuthProvider };
