import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile, User } from "firebase/auth";
import { db } from "@/lib/firebase/config";
import { UserProfile } from "@/lib/types/user";
import { useAuth } from "./use-auth";

interface UseUserProfileReturn {
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<boolean>;
}

export function useUserProfile(): UseUserProfileReturn {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      if (!user) {
        setUserProfile(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserProfile({
            ...data,
            uid: docSnap.id,
            createdAt: data.createdAt?.toDate(),
            lastLogin: data.lastLogin?.toDate(),
          } as UserProfile);
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error("Error fetching user profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [user]);

  const updateUserProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!user || !userProfile) return false;
    
    try {
      // Aktualizuj dane w Firestore
      await updateDoc(doc(db, "users", user.uid), data);
      
      // Aktualizuj dane w Auth, jeśli zmieniono displayName lub photoURL
      if (data.displayName || data.photoURL) {
        await updateProfile(user as User, {
          displayName: data.displayName || user.displayName,
          photoURL: data.photoURL || user.photoURL,
        });
      }
      
      // Aktualizuj lokalny stan
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error("Error updating user profile:", err);
      return false;
    }
  };

  return {
    userProfile,
    isLoading,
    error,
    updateUserProfile,
  };
} 