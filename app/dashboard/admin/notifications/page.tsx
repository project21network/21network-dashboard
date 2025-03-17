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
import { MessageSquare, Bell, FileText, ShoppingCart, Filter, RefreshCw, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";

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

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const { chats } = useChat();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState(statusParam === "new" ? "new" : "all");
  const [indexError, setIndexError] = useState<string | null>(null);

  // Aktualizuj statusFilter, gdy zmieni się parametr URL
  useEffect(() => {
    if (statusParam === "new") {
      setStatusFilter("new");
    }
  }, [statusParam]);

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
            title: `Wiadomość od ${chat.clientName || 'klienta'}`,
            message: chat.lastMessage || 'Wiadomość',
            type: 'message',
            read: chat.unreadAdmin === 0,
            date: chat.lastMessageAt || new Date(),
            link: `/dashboard/admin/chat`,
            isNew: chat.unreadAdmin > 0
          });
        });
        
        // Pobierz wszystkie zamówienia
        try {
          const ordersQuery = query(
            collection(db, "orders"),
            orderBy("createdAt", "desc"),
            limit(50)
          );
          
          const ordersSnapshot = await getDocs(ordersQuery);
          
          ordersSnapshot.forEach(doc => {
            const data = doc.data();
            allNotifications.push({
              id: `order-${doc.id}`,
              title: data.status === "new" ? 'Nowe zamówienie' : 'Zamówienie',
              message: `${data.title || 'Zamówienie'} - ${getStatusLabel(data.status)}`,
              type: 'order',
              read: data.status !== "new",
              date: data.createdAt?.toDate() || new Date(),
              link: `/dashboard/admin/orders/${doc.id}`,
              status: data.status,
              isNew: data.status === "new"
            });
          });
        } catch (error) {
          console.error("Error fetching orders:", error);
          if (error instanceof Error && error.message.includes("requires an index")) {
            setIndexError(error.message);
          }
        }
        
        // Pobierz wszystkie ankiety
        try {
          const seoQuery = query(
            collection(db, "seoFormSubmissions"),
            orderBy("createdAt", "desc"),
            limit(30)
          );
          
          const formQuery = query(
            collection(db, "formSubmissions"),
            orderBy("createdAt", "desc"),
            limit(30)
          );
          
          const [seoSnapshot, formSnapshot] = await Promise.all([
            getDocs(seoQuery),
            getDocs(formQuery)
          ]);
          
          seoSnapshot.forEach(doc => {
            const data = doc.data();
            allNotifications.push({
              id: `seo-${doc.id}`,
              title: data.status === "new" ? 'Nowa ankieta SEO' : 'Ankieta SEO',
              message: `Od: ${data.name || 'klienta'} - ${getStatusLabel(data.status)}`,
              type: 'survey',
              read: data.status !== "new",
              date: data.createdAt?.toDate() || new Date(),
              link: `/dashboard/admin/seo-submissions/${doc.id}`,
              status: data.status,
              isNew: data.status === "new"
            });
          });
          
          formSnapshot.forEach(doc => {
            const data = doc.data();
            allNotifications.push({
              id: `form-${doc.id}`,
              title: data.status === "new" ? 'Nowy formularz WWW' : 'Formularz WWW',
              message: `Od: ${data.name || 'klienta'} - ${getStatusLabel(data.status)}`,
              type: 'form',
              read: data.status !== "new",
              date: data.createdAt?.toDate() || new Date(),
              link: `/dashboard/admin/form-submissions/${doc.id}`,
              status: data.status,
              isNew: data.status === "new"
            });
          });
        } catch (error) {
          console.error("Error fetching forms:", error);
          if (error instanceof Error && error.message.includes("requires an index")) {
            setIndexError(error.message);
          }
        }
        
        // Sortuj powiadomienia według daty (najnowsze na górze)
        allNotifications.sort((a, b) => {
          // Najpierw sortuj według statusu "nowe" (nowe na górze)
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          // Następnie sortuj według daty (najnowsze na górze)
          return b.date.getTime() - a.date.getTime();
        });
        
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
        return 'bg-orange-50 text-orange-700';
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
        return 'Ankieta SEO';
      case 'form':
        return 'Formularz WWW';
      default:
        return 'Powiadomienie';
    }
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
  
  // Kolor dla statusu
  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
  
  // Liczba nowych powiadomień według typu
  const getNewNotificationCountByType = (type: string) => {
    if (type === 'all') {
      return notifications.filter(n => n.isNew || !n.read).length;
    }
    return notifications.filter(n => (n.isNew || !n.read) && n.type === type).length;
  };
  
  // Wyodrębnij URL indeksu z komunikatu o błędzie
  const extractIndexUrl = (errorMessage: string) => {
    const urlMatch = errorMessage.match(/(https:\/\/console\.firebase\.google\.com\S+)/);
    return urlMatch ? urlMatch[1] : null;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Powiadomienia</h1>
          <p className="text-muted-foreground">
            Zarządzaj wszystkimi powiadomieniami w jednym miejscu
            {getNewNotificationsCount() > 0 && (
              <span className="ml-2 text-red-500 font-medium">
                ({getNewNotificationsCount()} nowych)
              </span>
            )}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDateFilter(dateFilter === "all" ? "today" : dateFilter === "today" ? "week" : dateFilter === "week" ? "month" : "all")}
            >
              <Clock className="h-4 w-4 mr-2" />
              {dateFilter === "all" ? "Wszystkie daty" : 
               dateFilter === "today" ? "Dzisiaj" : 
               dateFilter === "week" ? "Ostatni tydzień" : "Ostatni miesiąc"}
            </Button>
            
            <Button 
              variant={statusFilter === "new" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(statusFilter === "new" ? "all" : "new")}
              className={statusFilter === "new" ? "bg-red-500 hover:bg-red-600" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />
              {statusFilter === "new" ? "Pokazuję tylko nowe" : "Pokaż tylko nowe"}
            </Button>
            
            <Button 
              variant={statusFilter === "unread" ? "default" : statusFilter === "read" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(statusFilter === "unread" ? "all" : statusFilter === "read" ? "unread" : "read")}
            >
              <Filter className="h-4 w-4 mr-2" />
              {statusFilter === "unread" ? "Nieprzeczytane" : statusFilter === "read" ? "Przeczytane" : "Filtruj wg statusu"}
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
            {getNewNotificationCountByType('all') > 0 && (
              <Badge className="bg-red-500 text-white">{getNewNotificationCountByType('all')}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="message" className="flex items-center gap-2">
            Wiadomości
            <Badge variant="secondary">{getNotificationCount('message')}</Badge>
            {getNewNotificationCountByType('message') > 0 && (
              <Badge className="bg-red-500 text-white">{getNewNotificationCountByType('message')}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="order" className="flex items-center gap-2">
            Zamówienia
            <Badge variant="secondary">{getNotificationCount('order')}</Badge>
            {getNewNotificationCountByType('order') > 0 && (
              <Badge className="bg-red-500 text-white">{getNewNotificationCountByType('order')}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="survey" className="flex items-center gap-2">
            Ankiety
            <Badge variant="secondary">{getNotificationCount('survey')}</Badge>
            {getNewNotificationCountByType('survey') > 0 && (
              <Badge className="bg-red-500 text-white">{getNewNotificationCountByType('survey')}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            Formularze
            <Badge variant="secondary">{getNotificationCount('form')}</Badge>
            {getNewNotificationCountByType('form') > 0 && (
              <Badge className="bg-red-500 text-white">{getNewNotificationCountByType('form')}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                {activeTab === "all" ? "Wszystkie powiadomienia" : 
                 activeTab === "message" ? "Wiadomości" : 
                 activeTab === "order" ? "Zamówienia" : 
                 activeTab === "survey" ? "Ankiety SEO" : "Formularze WWW"}
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
                    Aby wyświetlić historię powiadomień, należy utworzyć indeks w Firebase Console.
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
                      const indexUrl = extractIndexUrl(indexError);
                      if (indexUrl) {
                        window.open(indexUrl, '_blank');
                      }
                    }}
                  >
                    Utwórz indeks w Firebase
                  </Button>
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
                      className={`flex items-start gap-4 p-4 rounded-lg hover:bg-muted transition-colors ${notification.isNew ? 'bg-red-50 border border-red-200' : ''}`}
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
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant="outline">
                                {getNotificationLabel(notification.type)}
                              </Badge>
                              {notification.status && (
                                <Badge className={getStatusColor(notification.status)}>
                                  {getStatusLabel(notification.status)}
                                </Badge>
                              )}
                            </div>
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