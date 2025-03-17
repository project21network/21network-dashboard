"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";
import { useOrders } from "@/lib/hooks/use-orders";
import { useChat } from "@/lib/hooks/use-chat";
import { collection, query, where, getDocs, orderBy, QueryDocumentSnapshot, DocumentData, limit, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientFormSubmissionDetails } from "@/components/client-form-submission-details";
import { ClientSeoSubmissionDetails } from "@/components/client-seo-submission-details";
import { 
  BarChart3, 
  MessageSquare, 
  FileText, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  ShoppingCart, 
  FileQuestion,
  ArrowRight,
  Loader2
} from "lucide-react";

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">
        {isAdmin ? "Panel administratora" : "Panel klienta"}
      </h1>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Przegląd</TabsTrigger>
          <TabsTrigger value="activity">Aktywność</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isAdmin ? <AdminDashboardCards /> : <ClientDashboardCards />}
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <QuickActions isAdmin={isAdmin} />
            <RecentActivity isAdmin={isAdmin} />
          </div>
        </TabsContent>
        
        <TabsContent value="activity">
          <ActivityFeed isAdmin={isAdmin} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdminDashboardCards() {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeOrders: 0,
    newSurveys: 0,
    unreadMessages: 0,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch real data from Firestore
  useEffect(() => {
    async function fetchAdminStats() {
      try {
        // Get total clients
        const usersQuery = query(
          collection(db, "users"),
          where("role", "==", "client")
        );
        const usersSnapshot = await getDocs(usersQuery);
        
        // Get active orders
        const ordersQuery = query(
          collection(db, "orders"),
          where("status", "in", ["new", "processing"])
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        
        // Get unread messages
        const chatsQuery = query(
          collection(db, "chats"),
          where("unreadAdmin", ">", 0)
        );
        const chatsSnapshot = await getDocs(chatsQuery);
        
        // Get total unread messages
        const totalUnread = chatsSnapshot.docs.reduce(
          (total, doc) => total + doc.data().unreadAdmin, 0
        );
        
        // Get new form submissions
        const seoQuery = query(
          collection(db, "seoFormSubmissions"),
          where("status", "==", "new")
        );
        const formQuery = query(
          collection(db, "formSubmissions"),
          where("status", "==", "new")
        );
        
        const [seoSnapshot, formSnapshot] = await Promise.all([
          getDocs(seoQuery),
          getDocs(formQuery)
        ]);
        
        const newSurveys = seoSnapshot.size + formSnapshot.size;
        
        setStats({
          totalClients: usersSnapshot.size,
          activeOrders: ordersSnapshot.size,
          newSurveys,
          unreadMessages: totalUnread,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAdminStats();
  }, []);
  
  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Klienci
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">{stats.totalClients}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Aktywni użytkownicy platformy
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Aktywne zamówienia
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <div className="flex items-center">
                <ShoppingCart className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">{stats.activeOrders}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Zamówienia w realizacji
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Nowe ankiety
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <div className="flex items-center">
                <FileQuestion className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">{stats.newSurveys}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Oczekujące na przegląd
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Nieprzeczytane wiadomości
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <div className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">{stats.unreadMessages}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Od klientów
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function ClientDashboardCards() {
  const { orders, isLoading: isOrdersLoading } = useOrders();
  const { chats, isLoading: isChatsLoading } = useChat();
  const { user } = useAuth();
  const [formSubmissions, setFormSubmissions] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [seoSubmissions, setSeoSubmissions] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  
  // Fetch form submissions
  useEffect(() => {
    async function fetchSubmissions() {
      if (!user?.email) {
        setFormSubmissions([]);
        setSeoSubmissions([]);
        setIsLoadingSubmissions(false);
        return;
      }
      
      try {
        // Fetch SEO form submissions
        const seoQuery = query(
          collection(db, "seoFormSubmissions"),
          where("email", "==", user.email),
          orderBy("createdAt", "desc")
        );
        
        // Fetch website form submissions
        const formQuery = query(
          collection(db, "formSubmissions"),
          where("email", "==", user.email),
          orderBy("createdAt", "desc")
        );
        
        const [seoSnapshot, formSnapshot] = await Promise.all([
          getDocs(seoQuery),
          getDocs(formQuery)
        ]);
        
        setSeoSubmissions(seoSnapshot.docs);
        setFormSubmissions(formSnapshot.docs);
      } catch (error) {
        console.error("Error fetching form submissions:", error);
      } finally {
        setIsLoadingSubmissions(false);
      }
    }
    
    fetchSubmissions();
  }, [user]);
  
  // Calculate stats from real data
  const activeOrders = orders.filter(order => 
    order.status === "new" || order.status === "processing"
  ).length;
  
  // Calculate total unread messages
  const unreadMessages = chats.reduce((total, chat) => 
    total + (chat.unreadClient || 0), 0
  );
  
  // Calculate total orders including form submissions
  const totalOrders = orders.length + formSubmissions.length + seoSubmissions.length;
  
  // Calculate active submissions
  const activeSubmissions = [
    ...formSubmissions.filter(doc => {
      const data = doc.data();
      return data.status === "new" || data.status === "processing";
    }),
    ...seoSubmissions.filter(doc => {
      const data = doc.data();
      return data.status === "new" || data.status === "processing";
    })
  ].length;
  
  // Total active items
  const totalActive = activeOrders + activeSubmissions;
  
  const isLoading = isOrdersLoading || isLoadingSubmissions;
  
  // Calculate completed orders
  const completedOrders = orders.filter(order => order.status === "completed").length;
  const completedSubmissions = [
    ...formSubmissions.filter(doc => doc.data().status === "completed"),
    ...seoSubmissions.filter(doc => doc.data().status === "completed")
  ].length;
  const totalCompleted = completedOrders + completedSubmissions;
  
  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Twoje zamówienia
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <div className="flex items-center">
                <ShoppingCart className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">{totalOrders}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {`${totalActive} w trakcie realizacji`}
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ukończone projekty
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <div className="flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">{totalCompleted}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Zrealizowane zamówienia
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Nieprzeczytane wiadomości
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isChatsLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <div className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">{unreadMessages}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Od administracji
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function QuickActions({ isAdmin }: { isAdmin: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Szybkie akcje</CardTitle>
        <CardDescription>
          Najczęściej używane funkcje
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {isAdmin ? (
          <>
            <Link href="/dashboard/admin/orders">
              <Button variant="outline" className="w-full justify-start">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Zarządzaj zamówieniami
              </Button>
            </Link>
            <Link href="/dashboard/admin/chat">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Wiadomości
              </Button>
            </Link>
            <Link href="/dashboard/admin/seo-submissions">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Ankiety SEO
              </Button>
            </Link>
            <Link href="/dashboard/admin/form-submissions">
              <Button variant="outline" className="w-full justify-start">
                <FileQuestion className="mr-2 h-4 w-4" />
                Formularze stron WWW
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/dashboard/client/orders">
              <Button variant="outline" className="w-full justify-start">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Moje zamówienia
              </Button>
            </Link>
            <Link href="/dashboard/client/chat">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Wiadomości
              </Button>
            </Link>
            <Link href="/dashboard/client/create-order">
              <Button className="w-full justify-start">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nowe zamówienie
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivity({ isAdmin }: { isAdmin: boolean }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [indexError, setIndexError] = useState<string | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        // Different queries for admin and client
        let recentItems: any[] = [];
        
        if (isAdmin) {
          // For admin, get recent orders and messages
          const ordersQuery = query(
            collection(db, "orders"),
            orderBy("createdAt", "desc"),
            limit(3)
          );
          
          const chatsQuery = query(
            collection(db, "chats"),
            orderBy("updatedAt", "desc"),
            limit(3)
          );
          
          try {
            const [ordersSnapshot, chatsSnapshot] = await Promise.all([
              getDocs(ordersQuery),
              getDocs(chatsQuery)
            ]);
            
            // Process orders
            ordersSnapshot.forEach(doc => {
              const data = doc.data();
              recentItems.push({
                id: doc.id,
                type: 'order',
                title: data.title || 'Nowe zamówienie',
                date: data.createdAt?.toDate() || new Date(),
                status: data.status,
                userName: data.userName
              });
            });
            
            // Process chats
            chatsSnapshot.forEach(doc => {
              const data = doc.data();
              recentItems.push({
                id: doc.id,
                type: 'message',
                title: `Wiadomość od ${data.clientName || 'klienta'}`,
                date: data.updatedAt?.toDate() || new Date(),
                preview: data.lastMessage || '',
                unread: data.unreadAdmin > 0
              });
            });
          } catch (error) {
            console.error("Error fetching admin activity:", error);
            if (error instanceof Error && error.message.includes("requires an index")) {
              setIndexError(error.message);
            }
          }
        } else if (user) {
          // For client, get their recent orders and messages
          const ordersQuery = query(
            collection(db, "orders"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(3)
          );
          
          const chatsQuery = query(
            collection(db, "chats"),
            where("clientId", "==", user.uid),
            orderBy("updatedAt", "desc"),
            limit(3)
          );
          
          try {
            const [ordersSnapshot, chatsSnapshot] = await Promise.all([
              getDocs(ordersQuery),
              getDocs(chatsQuery)
            ]);
            
            // Process orders
            ordersSnapshot.forEach(doc => {
              const data = doc.data();
              recentItems.push({
                id: doc.id,
                type: 'order',
                title: data.title || 'Zamówienie',
                date: data.createdAt?.toDate() || new Date(),
                status: data.status
              });
            });
            
            // Process chats
            chatsSnapshot.forEach(doc => {
              const data = doc.data();
              recentItems.push({
                id: doc.id,
                type: 'message',
                title: 'Wiadomość od administracji',
                date: data.updatedAt?.toDate() || new Date(),
                preview: data.lastMessage || '',
                unread: data.unreadClient > 0
              });
            });
          } catch (error) {
            console.error("Error fetching client activity:", error);
            if (error instanceof Error && error.message.includes("requires an index")) {
              setIndexError(error.message);
            }
          }
        }
        
        // Sort by date
        recentItems.sort((a, b) => b.date.getTime() - a.date.getTime());
        
        // Take only the 5 most recent
        setActivities(recentItems.slice(0, 5));
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        if (error instanceof Error && error.message.includes("requires an index")) {
          setIndexError(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchRecentActivity();
  }, [isAdmin, user]);
  
  function getStatusBadge(status: string) {
    switch (status) {
      case 'new':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Nowe</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">W realizacji</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Ukończone</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Anulowane</Badge>;
      default:
        return null;
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ostatnia aktywność</CardTitle>
        <CardDescription>
          Najnowsze wydarzenia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {indexError ? (
          <div className="text-center py-4 space-y-2">
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
            <h3 className="text-lg font-medium">Wymagany indeks Firebase</h3>
            <p className="text-sm text-muted-foreground">
              Aby wyświetlić aktywność, należy utworzyć indeks w Firebase.
            </p>
            <div className="text-xs text-muted-foreground break-all px-4">
              {indexError}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => {
                // Extract URL from error message
                const urlMatch = indexError.match(/(https:\/\/console\.firebase\.google\.com\S+)/);
                if (urlMatch && urlMatch[1]) {
                  window.open(urlMatch[1], '_blank');
                }
              }}
            >
              Utwórz indeks
            </Button>
          </div>
        ) : isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))
        ) : activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-4 pb-4 border-b last:border-0">
              <div className="bg-muted rounded-full p-2">
                {activity.type === 'order' ? (
                  <FileText className="h-4 w-4" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <div className="flex items-center">
                    {activity.status && getStatusBadge(activity.status)}
                    {activity.unread && (
                      <Badge className="ml-2 bg-red-500">Nowa</Badge>
                    )}
                  </div>
                </div>
                {activity.preview && (
                  <p className="text-sm text-muted-foreground line-clamp-2 max-w-[600px] break-words whitespace-pre-wrap">
                    {activity.preview}
                  </p>
                )}
                {activity.userName && (
                  <p className="text-sm text-muted-foreground break-words">Od: {activity.userName}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.date, { addSuffix: true, locale: pl })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Brak ostatniej aktywności
          </p>
        )}
      </CardContent>

    </Card>
  );
}

function ActivityFeed({ isAdmin }: { isAdmin: boolean }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [indexError, setIndexError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Dialog state
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(false);
  const [submissionType, setSubmissionType] = useState<'seo' | 'form' | null>(null);

  // Filter options
  const filterOptions = [
    { value: "all", label: "Wszystkie" },
    { value: "message", label: "Wiadomości" },
    { value: "seo", label: "Ankiety SEO" },
    { value: "form", label: "Formularze WWW" },
  ];
  
  // Status options for filtering
  const statusOptions = [
    { value: "all", label: "Wszystkie statusy" },
    { value: "new", label: "Nowe" },
    { value: "processing", label: "W realizacji" },
    { value: "completed", label: "Ukończone" },
    { value: "cancelled", label: "Anulowane" },
  ];
  
  useEffect(() => {
    async function fetchAllActivity() {
      try {
        setIsLoading(true);
        setIndexError(null);
        // Different queries for admin and client
        let allItems: any[] = [];
        
        if (isAdmin) {
          // For admin, get all orders, messages, and form submissions
          const ordersQuery = query(
            collection(db, "orders"),
            orderBy("createdAt", "desc"),
            limit(50)
          );
          
          const chatsQuery = query(
            collection(db, "chats"),
            orderBy("updatedAt", "desc"),
            limit(50)
          );
          
          const seoQuery = query(
            collection(db, "seoFormSubmissions"),
            orderBy("createdAt", "desc"),
            limit(50)
          );
          
          const formQuery = query(
            collection(db, "formSubmissions"),
            orderBy("createdAt", "desc"),
            limit(50)
          );
          
          try {
            const [ordersSnapshot, chatsSnapshot, seoSnapshot, formSnapshot] = await Promise.all([
              getDocs(ordersQuery),
              getDocs(chatsQuery),
              getDocs(seoQuery),
              getDocs(formQuery)
            ]);
            
            // Process orders
            ordersSnapshot.forEach(doc => {
              const data = doc.data();
              allItems.push({
                id: doc.id,
                type: 'order',
                title: data.title || 'Nowe zamówienie',
                date: data.createdAt?.toDate() || new Date(),
                status: data.status,
                userName: data.userName,
                amount: data.totalAmount,
                description: data.description || '',
                link: `/dashboard/admin/orders/${doc.id}`
              });
            });
            
            // Process chats
            chatsSnapshot.forEach(doc => {
              const data = doc.data();
              allItems.push({
                id: doc.id,
                type: 'message',
                title: `Wiadomość od ${data.clientName || 'klienta'}`,
                date: data.updatedAt?.toDate() || new Date(),
                preview: data.lastMessage || '',
                unread: data.unreadAdmin > 0,
                clientName: data.clientName,
                clientId: data.clientId,
                link: `/dashboard/admin/chat`
              });
            });
            
            // Process SEO submissions
            seoSnapshot.forEach(doc => {
              const data = doc.data();
              allItems.push({
                id: doc.id,
                type: 'seo',
                title: `Ankieta SEO od ${data.name || 'klienta'}`,
                date: data.createdAt?.toDate() || new Date(),
                status: data.status || 'new',
                email: data.email,
                description: data.description || '',
                websiteUrl: data.websiteUrl,
                link: `/dashboard/admin/seo-submissions/${doc.id}`
              });
            });
            
            // Process form submissions
            formSnapshot.forEach(doc => {
              const data = doc.data();
              allItems.push({
                id: doc.id,
                type: 'form',
                title: `Formularz WWW od ${data.name || 'klienta'}`,
                date: data.createdAt?.toDate() || new Date(),
                status: data.status || 'new',
                email: data.email,
                description: data.description || '',
                websiteStyle: data.websiteStyle,
                link: `/dashboard/admin/form-submissions/${doc.id}`
              });
            });
          } catch (error) {
            console.error("Error fetching admin activity data:", error);
            if (error instanceof Error && error.message.includes("requires an index")) {
              setIndexError(error.message);
            }
          }
        } else if (user) {
          // For client, get their orders, messages, and form submissions
          const ordersQuery = query(
            collection(db, "orders"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(50)
          );
          
          const chatsQuery = query(
            collection(db, "chats"),
            where("clientId", "==", user.uid),
            orderBy("updatedAt", "desc"),
            limit(50)
          );
          
          // For client, we need to use email to query form submissions
          let seoQuery = null;
          let formQuery = null;
          
          if (user.email) {
            seoQuery = query(
              collection(db, "seoFormSubmissions"),
              where("email", "==", user.email),
              orderBy("createdAt", "desc"),
              limit(50)
            );
            
            formQuery = query(
              collection(db, "formSubmissions"),
              where("email", "==", user.email),
              orderBy("createdAt", "desc"),
              limit(50)
            );
          }
          
          try {
            // Execute queries
            const [ordersSnapshot, chatsSnapshot] = await Promise.all([
              getDocs(ordersQuery),
              getDocs(chatsQuery)
            ]);
            
            // Process orders
            ordersSnapshot.forEach(doc => {
              const data = doc.data();
              allItems.push({
                id: doc.id,
                type: 'order',
                title: data.title || 'Zamówienie',
                date: data.createdAt?.toDate() || new Date(),
                status: data.status,
                amount: data.totalAmount,
                description: data.description || '',
                link: `/dashboard/client/orders/${doc.id}`
              });
            });
            
            // Process chats
            chatsSnapshot.forEach(doc => {
              const data = doc.data();
              allItems.push({
                id: doc.id,
                type: 'message',
                title: 'Wiadomość od administracji',
                date: data.updatedAt?.toDate() || new Date(),
                preview: data.lastMessage || '',
                unread: data.unreadClient > 0,
                link: `/dashboard/client/chat`
              });
            });
            
            // Process form submissions if user has email
            if (seoQuery && formQuery) {
              try {
                const [seoSnapshot, formSnapshot] = await Promise.all([
                  getDocs(seoQuery),
                  getDocs(formQuery)
                ]);
                
                // Process SEO submissions
                seoSnapshot.forEach(doc => {
                  const data = doc.data();
                  allItems.push({
                    id: doc.id,
                    type: 'seo',
                    title: `Ankieta SEO: ${data.websiteUrl || 'Strona internetowa'}`,
                    date: data.createdAt?.toDate() || new Date(),
                    status: data.status || 'new',
                    description: data.description || '',
                    websiteUrl: data.websiteUrl,
                    link: `/dashboard/client/seo-submissions/${doc.id}`
                  });
                });
                
                // Process form submissions
                formSnapshot.forEach(doc => {
                  const data = doc.data();
                  allItems.push({
                    id: doc.id,
                    type: 'form',
                    title: `Formularz WWW: ${data.websiteStyle || 'Strona internetowa'}`,
                    date: data.createdAt?.toDate() || new Date(),
                    status: data.status || 'new',
                    description: data.description || '',
                    websiteStyle: data.websiteStyle,
                    link: `/dashboard/client/form-submissions/${doc.id}`
                  });
                });
              } catch (error) {
                console.error("Error fetching form submissions:", error);
                if (error instanceof Error && error.message.includes("requires an index")) {
                  setIndexError(error.message);
                }
              }
            }
          } catch (error) {
            console.error("Error fetching client activity data:", error);
            if (error instanceof Error && error.message.includes("requires an index")) {
              setIndexError(error.message);
            }
          }
        }
        
        // Sort by date
        allItems.sort((a, b) => b.date.getTime() - a.date.getTime());
        
        setActivities(allItems);
      } catch (error) {
        console.error("Error fetching activity feed:", error);
        if (error instanceof Error && error.message.includes("requires an index")) {
          setIndexError(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAllActivity();
  }, [isAdmin, user]);
  
  // Filter activities based on selected filter
  const filteredActivities = activities.filter(activity => {
    if (activeFilter !== "all" && activity.type !== activeFilter) {
      return false;
    }
    return true;
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  // Handle opening submission details
  const handleOpenSubmissionDetails = async (activity: any) => {
    try {
      setIsLoadingSubmission(true);
      setSubmissionType(activity.type as 'seo' | 'form');

      const collectionName = activity.type === 'seo' ? 'seoFormSubmissions' : 'formSubmissions';
      const submissionDoc = await getDoc(doc(db, collectionName, activity.id));
      
      if (submissionDoc.exists()) {
        setSelectedSubmission({
          ...submissionDoc.data(),
          id: submissionDoc.id,
          createdAt: submissionDoc.data().createdAt?.toDate(),
          updatedAt: submissionDoc.data().updatedAt?.toDate()
        });
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching submission details:", error);
    } finally {
      setIsLoadingSubmission(false);
    }
  };
  
  function getStatusBadge(status: string) {
    switch (status) {
      case 'new':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Nowe</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">W realizacji</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Ukończone</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Anulowane</Badge>;
      default:
        return null;
    }
  }
  
  function getActivityIcon(type: string) {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'seo':
        return <FileText className="h-4 w-4" />;
      case 'form':
        return <FileQuestion className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(option => (
            <Button
              key={option.value}
              variant={activeFilter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveFilter(option.value);
                setPage(1); // Reset to first page when filter changes
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          Łącznie: {filteredActivities.length} {filteredActivities.length === 1 ? 'wydarzenie' : 
            filteredActivities.length > 1 && filteredActivities.length < 5 ? 'wydarzenia' : 'wydarzeń'}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Historia aktywności</CardTitle>
          <CardDescription>
            {activeFilter === "all" 
              ? "Wszystkie wydarzenia w systemie" 
              : `Filtrowanie: ${filterOptions.find(o => o.value === activeFilter)?.label}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {indexError ? (
            <div className="text-center py-8 space-y-4">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
              <h3 className="text-lg font-medium">Wymagany indeks Firebase</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Aby wyświetlić historię aktywności, należy utworzyć indeks w Firebase Console.
                Kliknij poniższy przycisk, aby przejść do konsoli i utworzyć wymagany indeks.
              </p>
              <div className="text-xs text-muted-foreground break-all px-8 max-w-2xl mx-auto">
                {indexError}
              </div>
              <Button 
                variant="default" 
                size="sm" 
                className="mt-2"
                onClick={() => {
                  // Extract URL from error message
                  const urlMatch = indexError.match(/(https:\/\/console\.firebase\.google\.com\S+)/);
                  if (urlMatch && urlMatch[1]) {
                    window.open(urlMatch[1], '_blank');
                  }
                }}
              >
                Utwórz indeks w Firebase
              </Button>
            </div>
          ) : isLoading ? (
            <div className="space-y-6">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedActivities.length > 0 ? (
            <div className="space-y-6">
              {paginatedActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 pb-6 border-b last:border-0">
                  <div className={`rounded-full p-2 ${
                    activity.type === 'order' ? 'bg-blue-50 text-blue-700' :
                    activity.type === 'message' ? 'bg-green-50 text-green-700' :
                    activity.type === 'seo' ? 'bg-purple-50 text-purple-700' :
                    'bg-orange-50 text-orange-700'
                  }`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Link href={activity.link || '#'} className="hover:underline">
                        <h4 className="text-sm font-medium">{activity.title}</h4>
                      </Link>
                      <div className="flex items-center gap-2">
                        {activity.status && getStatusBadge(activity.status)}
                        {activity.unread && (
                          <Badge className="bg-red-500">Nowa</Badge>
                        )}
                      </div>
                    </div>
                    
                    {activity.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-[600px] break-words">
                        {activity.description}
                      </p>
                    )}
                    
                    {activity.preview && (
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-[600px] break-words whitespace-pre-wrap">
                        {activity.preview}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground max-w-[600px]">
                      <span>
                        {formatDistanceToNow(activity.date, { addSuffix: true, locale: pl })}
                      </span>
                      
                      {activity.email && (
                        <span className="break-all">Email: {activity.email}</span>
                      )}
                      
                      {activity.userName && (
                        <span className="break-words">Od: {activity.userName}</span>
                      )}
                      
                      {activity.amount && (
                        <span>Kwota: {activity.amount.toFixed(2)} PLN</span>
                      )}
                      
                      {activity.websiteUrl && (
                        <span className="break-all">URL: {activity.websiteUrl}</span>
                      )}
                      
                      {activity.websiteStyle && (
                        <span className="break-words">Styl: {activity.websiteStyle}</span>
                      )}
                    </div>
                    
                    <div className="pt-2">
                      {(activity.type === 'seo' || activity.type === 'form') ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => handleOpenSubmissionDetails(activity)}
                        >
                          Szczegóły
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      ) : (
                        <Link href={activity.link || '#'}>
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            Szczegóły
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center rounded-full bg-muted p-6 mb-4">
                <Clock className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Brak aktywności</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Nie znaleziono żadnych wydarzeń pasujących do wybranych filtrów.
              </p>
            </div>
          )}
        </CardContent>
        
        {!indexError && totalPages > 1 && (
          <CardFooter className="flex justify-between items-center border-t px-6 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Poprzednia
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Strona {page} z {totalPages}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Następna
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Dialog for submission details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {submissionType === 'seo' ? 'Szczegóły ankiety SEO' : 'Szczegóły formularza WWW'}
            </DialogTitle>
          </DialogHeader>
          
          {isLoadingSubmission ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedSubmission && (
            submissionType === 'seo' ? (
              <ClientSeoSubmissionDetails submission={selectedSubmission} />
            ) : (
              <ClientFormSubmissionDetails submission={selectedSubmission} />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
          