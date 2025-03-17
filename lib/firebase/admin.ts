import { db } from "./config";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp
} from "firebase/firestore";
import { startOfDay, endOfDay } from "date-fns";

export interface DashboardStats {
  totalOrders: number;
  newMessages: number;
  totalSurveys: number;
  totalUsers: number;
  recentOrders: Array<{
    id: string;
    userId: string;
    status: string;
    total: number;
    createdAt: Date;
  }>;
  dailyStats: {
    orders: number;
    revenue: number;
    newUsers: number;
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);

  // Pobierz zamówienia
  const ordersQuery = query(
    collection(db, "orders"),
    orderBy("createdAt", "desc"),
    limit(10)
  );
  const ordersSnapshot = await getDocs(ordersQuery);
  const orders = ordersSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId || "",
      status: data.status || "pending",
      total: data.total || 0,
      createdAt: data.createdAt?.toDate() || new Date(),
      ...data
    };
  });

  // Pobierz dzisiejsze zamówienia
  const todayOrdersQuery = query(
    collection(db, "orders"),
    where("createdAt", ">=", Timestamp.fromDate(startOfToday)),
    where("createdAt", "<=", Timestamp.fromDate(endOfToday))
  );
  const todayOrdersSnapshot = await getDocs(todayOrdersQuery);
  const todayOrders = todayOrdersSnapshot.docs.map(doc => doc.data());

  // Pobierz nowe wiadomości
  let messagesSnapshot;
  try {
    const messagesQuery = query(
      collection(db, "messages"),
      where("isRead", "==", false),
      where("senderId", "!=", "admin")
    );
    messagesSnapshot = await getDocs(messagesQuery);
  } catch (error) {
    console.error("Error fetching messages:", error);
    // Fallback w przypadku braku indeksu
    messagesSnapshot = { size: 0 };
  }

  // Pobierz użytkowników
  const usersQuery = query(collection(db, "users"));
  const usersSnapshot = await getDocs(usersQuery);

  // Oblicz dzienne statystyki
  const dailyStats = {
    orders: todayOrders.length,
    revenue: todayOrders.reduce((sum, order) => sum + (order.total || 0), 0),
    newUsers: 0 // TODO: Implement when user creation tracking is added
  };

  return {
    totalOrders: ordersSnapshot.size,
    newMessages: messagesSnapshot.size,
    totalSurveys: 0, // TODO: Implement when surveys are added
    totalUsers: usersSnapshot.size,
    recentOrders: orders,
    dailyStats
  };
} 