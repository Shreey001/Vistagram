// Import necessary dependencies
import { User } from "@supabase/supabase-js";
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase-client";

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  signInWithGithub: () => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  authError: string | null;
  isLoading: boolean;
}

// Create the auth context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps app and makes auth available
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Hold user data in state
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check active sessions and update state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup subscription on unmount
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Handle Github OAuth sign in
  const signInWithGithub = async () => {
    setIsLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error("Error signing in with Github:", error);
      setAuthError(error.message);
    }
    setIsLoading(false);
  };

  // Handle email sign up
  const signUp = async (email: string, password: string, username?: string) => {
    setIsLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          user_name: username || email.split("@")[0],
        },
      },
    });

    if (error) {
      console.error("Error signing up:", error);
      setAuthError(error.message);
    }
    setIsLoading(false);
  };

  // Handle email sign in
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error signing in:", error);
      setAuthError(error.message);
    }
    setIsLoading(false);
  };

  // Handle password reset
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error("Error resetting password:", error);
      setAuthError(error.message);
    }
    setIsLoading(false);
  };

  // Handle sign out
  const signOut = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      // First check if we have an active session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // If we have a session, try to sign out
      if (session) {
        try {
          // Try to sign out with global scope to clear all sessions
          const { error } = await supabase.auth.signOut({ scope: "global" });

          if (error) {
            console.warn("Error signing out with global scope:", error);

            // If global scope fails, try with local scope
            const localResult = await supabase.auth.signOut({ scope: "local" });

            if (localResult.error) {
              console.warn(
                "Error signing out with local scope:",
                localResult.error
              );

              // If local scope fails, try without specifying scope
              const fallbackResult = await supabase.auth.signOut();

              if (fallbackResult.error) {
                console.error(
                  "Error signing out with fallback method:",
                  fallbackResult.error
                );
              }
            }
          }
        } catch (signOutError) {
          console.error("Exception during sign out:", signOutError);
        }
      }

      // Always clear the local user state
      setUser(null);

      // Clear ALL Supabase-related items from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-") || key.includes("supabase")) {
          localStorage.removeItem(key);
        }
      });

      // Clear any cookies related to authentication
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=");
        if (name.includes("sb-") || name.includes("supabase")) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });

      // Force refresh the page to ensure clean state
      window.location.href = "/";
    } catch (err) {
      console.error("Error during sign out process:", err);
      setAuthError("An unexpected error occurred. Please try again.");

      // Still attempt to clear local state
      setUser(null);

      // Force refresh even on error
      window.location.href = "/";
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signInWithGithub,
        signUp,
        signIn,
        resetPassword,
        signOut,
        refreshSession,
        authError,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
