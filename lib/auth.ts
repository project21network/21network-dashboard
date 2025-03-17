import { auth as firebaseAuth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase/config";

interface AuthSession {
  user?: {
    uid: string;
    email: string;
    displayName: string;
    isAdmin: boolean;
  } | null;
}

export async function auth(): Promise<AuthSession> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      unsubscribe();
      
      if (!user) {
        resolve({ user: null });
        return;
      }
      
      try {
        // Pobierz dodatkowe dane użytkownika z Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : null;
        
        resolve({
          user: {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
            isAdmin: userData?.role === "admin",
          },
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        resolve({ user: null });
      }
    });
  });
} 