"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/use-auth";
import { useChat } from "@/lib/hooks/use-chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Bell, FileText, ShoppingCart, Filter, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { format } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'message' | 'order' | 'survey' | 'form';
  read: boolean;
  date: Date;
  link: string;
  status?: string;
  isNew?: boolean;
}

export default function ClientNotificationsPage() {
  const { user } = useAuth();
  const { chats } = useChat();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [indexError, setIndexError] = useState<string | null>(null);

  // Pobierz powiadomienia
  useEffect(() => {
    async function fetchNotifications() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setIndexError(null);
        const allNotifications: Notification[] = [];
        
        // Dodaj wszystkie wiadomości jako powiadomienia, ale oznacz nieprzeczytane
        chats.forEach(chat => {
          allNotifications.push({
            id: `chat-${chat.id}`,
            title: chat.unreadClient > 0 
              ? `Nowa wiadomość od ${chat.adminName || 'administratora'}`
              : `Wiadomość od ${chat.adminName || 'administratora'}`,
            message: chat.lastMessage || 'Wiadomość',
            type: 'message',
            read: chat.unreadClient === 0,
            date: chat.lastMessageAt || new Date(),
            link: `/dashboard/client/chat`,
            isNew: chat.unreadClient > 0
          });
        });
        
        // Pobierz wszystkie zamówienia klienta
        if (user) {
          try {
            const ordersQuery = query(
              collection(db, "orders"),
              where("clientId", "==", user.uid),
              orderBy("createdAt", "desc"),
              limit(20)
            );
            
            const ordersSnapshot = await getDocs(ordersQuery);
            
            ordersSnapshot.forEach(doc => {
              const data = doc.data();
              let statusMessage = "";
              let title = "";
              
              switch (data.status) {
                case "new":
                  title = "Nowe zamówienie";
                  statusMessage = "Zamówienie zostało złożone";
                  break;
                case "in_progress":
                  title = "Aktualizacja zamówienia";
                  statusMessage = "Zamówienie jest w trakcie realizacji";
                  break;
                case "completed":
                  title = "Aktualizacja zamówienia";
                  statusMessage = "Zamówienie zostało zrealizowane";
                  break;
                case "cancelled":
                  title = "Aktualizacja zamówienia";
                  statusMessage = "Zamówienie zostało anulowane";
                  break;
                default:
                  title = "Aktualizacja zamówienia";
                  statusMessage = `Status zamówienia: ${data.status}`;
              }
              
              allNotifications.push({
                id: `order-${doc.id}`,
                title: title,
                message: `${data.title || 'Zamówienie'}: ${statusMessage}`,
                type: 'order',
                read: data.status !== "new",
                date: data.createdAt?.toDate() || new Date(),
                link: `/dashboard/client/orders/${doc.id}`,
                status: data.status,
                isNew: data.status === "new"
              });
            });
          } catch (error) {
            console.error("Error fetching client orders:", error);
            if (error instanceof Error && error.message.includes("requires an index")) {
              setIndexError(error.message);
            }
          }
          
          // Pobierz ankiety i formularze klienta
          try {
            const seoQuery = query(
              collection(db, "seoFormSubmissions"),
              where("email", "==", user.email),
              orderBy("createdAt", "desc"),
              limit(10)
            );
            
            const formQuery = query(
              collection(db, "formSubmissions"),
              where("email", "==", user.email),
              orderBy("createdAt", "desc"),
              limit(10)
            );
            
            const [seoSnapshot, formSnapshot] = await Promise.all([
              getDocs(seoQuery),
              getDocs(formQuery)
            ]);
            
            seoSnapshot.forEach(doc => {
              const data = doc.data();
              allNotifications.push({
                id: `seo-${doc.id}`,
                title: 'Ankieta SEO',
                message: `Status: ${getStatusLabel(data.status)}`,
                type: 'survey',
                read: data.status !== "new",
                date: data.createdAt?.toDate() || new Date(),
                link: `/dashboard/client/seo-submissions/${doc.id}`,
                status: data.status,
                isNew: data.status === "new"
              });
            });
            
            formSnapshot.forEach(doc => {
              const data = doc.data();
              allNotifications.push({
                id: `form-${doc.id}`,
                title: 'Formularz WWW',
                message: `Status: ${getStatusLabel(data.status)}`,
                type: 'form',
                read: data.status !== "new",
                date: data.createdAt?.toDate() || new Date(),
                link: `/dashboard/client/form-submissions/${doc.id}`,
                status: data.status,
                isNew: data.status === "new"
              });
            });
          } catch (error) {
            console.error("Error fetching client forms:", error);
            if (error instanceof Error && error.message.includes("requires an index")) {
              setIndexError(error.message);
            }
          }
        }
        
        // Sortuj powiadomienia według daty (najnowsze na górze)
        allNotifications.sort((a, b) => b.date.getTime() - a.date.getTime());
        
        setNotifications(allNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        if (error instanceof Error && error.message.includes("requires an index")) {
          setIndexError(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchNotifications();
  }, [user, chats]);

  // Filtruj powiadomienia według typu, daty i statusu
  const filteredNotifications = notifications.filter(notification => {
    // Filtruj według typu
    if (activeTab !== "all" && notification.type !== activeTab) {
      return false;
    }
    
    // Filtruj według statusu
    if (statusFilter !== "all") {
      if (statusFilter === "new" && !notification.isNew) {
        return false;
      } else if (statusFilter === "read" && (notification.isNew || !notification.read)) {
        return false;
      } else if (statusFilter === "unread" && notification.read) {
        return false;
      }
    }
    
    // Filtruj według daty
    if (dateFilter !== "all") {
      const now = new Date();
      const notificationDate = notification.date;
      
      if (dateFilter === "today") {
        return notificationDate.toDateString() === now.toDateString();
      } else if (dateFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return notificationDate >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return notificationDate >= monthAgo;
      }
    }
    
    return true;
  });

  // Ikona dla typu powiadomienia
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5" />;
      case 'order':
        return <ShoppingCart className="h-5 w-5" />;
      case 'survey':
        return <FileText className="h-5 w-5" />;
      case 'form':
        return <FileText className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  // Kolor tła dla typu powiadomienia
  const getNotificationColor = (type: string, isNew: boolean = false) => {
    if (isNew) {
      return 'bg-red-50 text-red-700';
    }
    
    switch (type) {
      case 'message':
        return 'bg-blue-50 text-blue-700';
      case 'order':
        return 'bg-green-50 text-green-700';
      case 'survey':
        return 'bg-purple-50 text-purple-700';
      case 'form':
        return 'bg-pink-50 text-pink-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };
  
  // Etykieta dla typu powiadomienia
  const getNotificationLabel = (type: string) => {
    switch (type) {
      case 'message':
        return 'Wiadomość';
      case 'order':
        return 'Zamówienie';
      case 'survey':
        return 'Ankieta';
      case 'form':
        return 'Formularz';
      default:
        return 'Powiadomienie';
    }
  };
  
  // Liczba powiadomień według typu
  const getNotificationCount = (type: string) => {
    if (type === 'all') {
      return notifications.length;
    }
    return notifications.filter(n => n.type === type).length;
  };
  
  // Liczba nowych powiadomień
  const getNewNotificationsCount = () => {
    return notifications.filter(n => n.isNew || !n.read).length;
  };
  
  // Wyodrębnij URL indeksu z komunikatu o błędzie
  const extractIndexUrl = (errorMessage: string) => {
    const urlMatch = errorMessage.match(/(https:\/\/console\.firebase\.google\.com\S+)/);
    return urlMatch ? urlMatch[1] : null;
  };

  // Etykieta dla statusu
  const getStatusLabel = (status?: string) => {
    if (!status) return 'Nieznany status';
    
    switch (status) {
      case 'new':
        return 'Nowe';
      case 'in_progress':
      case 'processing':
        return 'W realizacji';
      case 'completed':
        return 'Ukończone';
      case 'cancelled':
        return 'Anulowane';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Powiadomienia</h1>
          <p className="text-muted-foreground">
            Wszystkie powiadomienia i aktualizacje w jednym miejscu
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDateFilter(dateFilter === "all" ? "today" : dateFilter === "today" ? "week" : dateFilter === "week" ? "month" : "all")}
            >
              <Filter className="h-4 w-4 mr-2" />
              {dateFilter === "all" ? "Wszystkie daty" : 
               dateFilter === "today" ? "Dzisiaj" : 
               dateFilter === "week" ? "Ostatni tydzień" : "Ostatni miesiąc"}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setStatusFilter(statusFilter === "all" ? "new" : statusFilter === "new" ? "unread" : statusFilter === "unread" ? "read" : "all")}
            >
              <Filter className="h-4 w-4 mr-2" />
              {statusFilter === "all" ? "Wszystkie statusy" : 
               statusFilter === "new" ? "Tylko nowe" : 
               statusFilter === "unread" ? "Nieprzeczytane" : "Przeczytane"}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  window.location.reload();
                }, 300);
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Odśwież
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            Wszystkie
            <Badge variant="secondary">{getNotificationCount('all')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="message" className="flex items-center gap-2">
            Wiadomości
            <Badge variant="secondary">{getNotificationCount('message')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="order" className="flex items-center gap-2">
            Zamówienia
            <Badge variant="secondary">{getNotificationCount('order')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="survey" className="flex items-center gap-2">
            Ankiety
            <Badge variant="secondary">{getNotificationCount('survey')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            Formularze
            <Badge variant="secondary">{getNotificationCount('form')}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                {activeTab === "all" ? "Wszystkie powiadomienia" : 
                 activeTab === "message" ? "Wiadomości" : 
                 activeTab === "order" ? "Zamówienia" : 
                 activeTab === "survey" ? "Ankiety" : "Formularze"}
              </CardTitle>
              <CardDescription>
                {filteredNotifications.length === 0 ? 
                  "Brak powiadomień" : 
                  `Łącznie ${filteredNotifications.length} ${
                    filteredNotifications.length === 1 ? "powiadomienie" : 
                    filteredNotifications.length < 5 ? "powiadomienia" : "powiadomień"
                  }`}
                {getNewNotificationsCount() > 0 && `, w tym ${getNewNotificationsCount()} nowych`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[400px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : indexError ? (
                <div className="text-center py-8 space-y-4">
                  <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
                  <h3 className="text-lg font-medium">Wymagany indeks Firebase</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Aby wyświetlić powiadomienia, należy utworzyć indeks w Firebase Console.
                    Skontaktuj się z administratorem systemu, aby rozwiązać ten problem.
                  </p>
                  <div className="text-xs text-muted-foreground break-all px-8 max-w-2xl mx-auto">
                    {indexError}
                  </div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Brak powiadomień</h3>
                  <p className="text-muted-foreground mt-2">
                    Nie masz żadnych {activeTab !== "all" ? getNotificationLabel(activeTab).toLowerCase() + " do przejrzenia" : "powiadomień"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <Link 
                      key={notification.id} 
                      href={notification.link}
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className={`rounded-full p-3 ${getNotificationColor(notification.type, notification.isNew)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{notification.title}</h3>
                              {notification.isNew && (
                                <Badge className="bg-red-500">Nowe</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">
                              {getNotificationLabel(notification.type)}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(notification.date, { addSuffix: true, locale: pl })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(notification.date, "dd.MM.yyyy, HH:mm")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 