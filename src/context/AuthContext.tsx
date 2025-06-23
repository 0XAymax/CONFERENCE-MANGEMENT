"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/server/client";
import { toast } from "sonner";
import { setCookie, destroyCookie, parseCookies } from "nookies";


type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
};
interface User {
    id: string;
    name: string;
    email: string;
}
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!user;
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const cookies = parseCookies();
    const user = cookies.user;
    if (user) {
      const parsedUser = JSON.parse(user) as User;
      setUser(parsedUser);
    }
  },[])
  const signInMutation = trpc.auth.login.useMutation({
    onSuccess: ({ user, token }) => {
      setCookie(null, "auth_token", token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      setCookie(null, "user", JSON.stringify(user), {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      setUser(user);
      toast.success("Logged in successfully");
      router.push("/dashboard");
    },
    onError: (err) => toast.error(err.message || "Login failed"),
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: ({ user }) => {
      toast.success("Registered successfully");
      setUser(user);
    },
    onError: (err) => toast.error(err.message || "Registration failed"),
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInMutation.mutateAsync({ email, password });
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await registerMutation.mutateAsync({ name, email, password });
    } catch (error) {
      throw error;
    }
  };

  const signOut = () => {
    destroyCookie(null, "auth_token");
    destroyCookie(null, "user");
    setUser(null);
    router.push("/login");
  };
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading:
    isLoading || signInMutation.isPending || registerMutation.isPending,
    signIn,
    signOut,
    signUp,
  };

  return (
    <AuthContext.Provider
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
};
