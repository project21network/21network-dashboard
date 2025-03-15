import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    User,
    UserCredential,
    GoogleAuthProvider,
    signInWithPopup,
    OAuthProvider,
  } from "firebase/auth";
  import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
  import { auth, db } from "./config";
  
  type UserRole = "admin" | "client";
  
  interface CreateUserData {
    email: string;
    password: string;
    displayName: string;
    role?: UserRole;
  }
  
  export async function registerUser({ email, password, displayName, role = "client" }: CreateUserData): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
  
      // Aktualizuj profil użytkownika
      await updateProfile(user, { displayName });
  
      // Zapisz dodatkowe dane użytkownika w Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        displayName,
        role,
        createdAt: serverTimestamp(),
      });
  
      return userCredential;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  }
  
  export async function loginUser(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  }
  
  export async function logoutUser(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  }
  
  export async function resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  }
  
  export async function getUserRole(user: User | null): Promise<UserRole | null> {
    if (!user) return null;
    
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      return userDoc.exists() ? (userDoc.data().role as UserRole) : null;
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  }
  
  export async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("Error logging in with Google:", error);
      throw error;
    }
  }
  
  export async function loginWithApple() {
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("Error logging in with Apple:", error);
      throw error;
    }
  }
  
  export function getCurrentUser(): User | null {
    return auth.currentUser;
  }