// Import necessary dependencies
import { User } from "@supabase/supabase-js";
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase-client";

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the auth context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps app and makes auth available
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Hold user data in state
  const [user, setUser] = useState<User | null>(null);

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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error("Error signing in with Github:", error);
    }
  };

  // Handle sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signInWithGithub, signOut }}>
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
