import { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { getUserRole } from "@/lib/firebase/auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  role: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAdmin: false,
    role: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await getUserRole(user);
        setAuthState({
          user,
          isLoading: false,
          isAdmin: role === "admin",
          role,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAdmin: false,
          role: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return authState;
}