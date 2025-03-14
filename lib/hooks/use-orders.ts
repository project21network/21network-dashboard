import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, doc, getDoc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Order, OrderStatus } from "@/lib/types/order";
import { useAuth } from "./use-auth";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    async function fetchOrders() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Jeśli admin, pobierz wszystkie zamówienia, w przeciwnym razie tylko dla danego użytkownika
        const ordersQuery = isAdmin
          ? query(collection(db, "orders"), orderBy("createdAt", "desc"))
          : query(
              collection(db, "orders"),
              where("userId", "==", user?.uid),
              orderBy("createdAt", "desc")
            );
        
        const snapshot = await getDocs(ordersQuery);
        const ordersList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            completedAt: data.completedAt?.toDate(),
          } as Order;
        });
        
        setOrders(ordersList);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error("Error fetching orders:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchOrders();
  }, [user, isAdmin]);

  const getOrder = async (id: string): Promise<Order | null> => {
    try {
      const docRef = doc(db, "orders", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          completedAt: data.completedAt?.toDate(),
        } as Order;
      }
      
      return null;
    } catch (err) {
      console.error("Error fetching order:", err);
      return null;
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus): Promise<boolean> => {
    try {
      await updateDoc(doc(db, "orders", id), {
        status,
        updatedAt: new Date(),
        ...( status === "completed" ? { completedAt: new Date() } : {} )
      });
      return true;
    } catch (err) {
      console.error("Error updating order status:", err);
      return false;
    }
  };

  return {
    orders,
    isLoading,
    error,
    getOrder,
    updateOrderStatus,
  };
}