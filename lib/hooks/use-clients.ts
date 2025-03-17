import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, doc, getDoc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { UserProfile } from "@/lib/types/user";

export function useClients() {
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchClients() {
      setIsLoading(true);
      setError(null);
      
      try {
        const clientsQuery = query(
          collection(db, "users"),
          where("role", "==", "client"),
          orderBy("createdAt", "desc")
        );
        
        const snapshot = await getDocs(clientsQuery);
        const clientsList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            uid: doc.id,
            createdAt: data.createdAt?.toDate(),
            lastLogin: data.lastLogin?.toDate(),
          } as UserProfile;
        });
        
        setClients(clientsList);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error("Error fetching clients:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchClients();
  }, []);

  const getClient = async (uid: string): Promise<UserProfile | null> => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          uid: docSnap.id,
          createdAt: data.createdAt?.toDate(),
          lastLogin: data.lastLogin?.toDate(),
        } as UserProfile;
      }
      
      return null;
    } catch (err) {
      console.error("Error fetching client:", err);
      return null;
    }
  };

  const updateClient = async (uid: string, data: Partial<UserProfile>): Promise<boolean> => {
    try {
      await updateDoc(doc(db, "users", uid), data);
      
      // Aktualizuj lokalny stan
      setClients(prevClients => 
        prevClients.map(client => 
          client.uid === uid ? { ...client, ...data } : client
        )
      );
      
      return true;
    } catch (err) {
      console.error("Error updating client:", err);
      return false;
    }
  };

  const deleteClient = async (uid: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, "users", uid));
      
      // Aktualizuj lokalny stan
      setClients(prevClients => 
        prevClients.filter(client => client.uid !== uid)
      );
      
      return true;
    } catch (err) {
      console.error("Error deleting client:", err);
      return false;
    }
  };

  return {
    clients,
    isLoading,
    error,
    getClient,
    updateClient,
    deleteClient,
  };
}