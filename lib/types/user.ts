import { User as FirebaseUser } from "firebase/auth";

export type UserRole = "admin" | "client";

export interface User extends FirebaseUser {
  role?: UserRole;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  phone?: string;
  company?: string;
  createdAt: Date;
  lastLogin?: Date;
}