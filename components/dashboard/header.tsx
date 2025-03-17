"use client";

import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { MenuOutlined, BellOutlined, LogoutOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { logoutUser } from "@/lib/firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useChat } from "@/lib/hooks/use-chat";
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bell, FileText, ShoppingCart, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { ClientSeoSubmissionDetails } from "@/components/client-seo-submission-details";
import { ClientFormSubmissionDetails } from "@/components/client-form-submission-details";
import { SeoSubmission } from "@/lib/types/seo-submission";
import { FormSubmission } from "@/lib/types/form-submission";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

interface HeaderProps {
  user: User | null;
  toggleMobileMenu: () => void;
}

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

// Dodaj własny komponent ScrollArea ze stylami
const StyledScrollArea = ({ children }: { children: React.ReactNode }) => (
  <ScrollAreaPrimitive.Root className="relative">
    <ScrollAreaPrimitive.Viewport className="h-full w-full">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar
      className="flex select-none touch-none p-0.5 bg-gray-100 transition-colors duration-150 ease-out hover:bg-gray-200 data-[orientation=vertical]:w-2"
      orientation="vertical"
    >
      <ScrollAreaPrimitive.Thumb className="flex-1 bg-gray-300 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
    </ScrollAreaPrimitive.Scrollbar>
  </ScrollAreaPrimitive.Root>
);

export function Header({ user, toggleMobileMenu }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { chats } = useChat();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [indexError, setIndexError] = useState<string | null>(null);
  const [selectedSeoSubmission, setSelectedSeoSubmission] = useState<SeoSubmission | null>(null);
  const [selectedFormSubmission, setSelectedFormSubmission] = useState<FormSubmission | null>(null);
  const [isSeoDialogOpen, setIsSeoDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(false);

  // Pobierz powiadomienia
  useEffect(() => {
    async function fetchNotifications() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setIndexError(null);
        const allNotifications: Notification[] = [];
        
        // Dodaj nieprzeczytane wiadomości jako powiadomienia
        const isAdmin = pathname.includes('/admin');
        
        if (isAdmin) {
          // Dla administratora pobierz wszystkie wiadomości od klientów
          chats.forEach(chat => {
            // Upewnij się, że nazwa klienta jest zawsze dostępna
            const clientName = chat.clientName && chat.clientName.trim() !== '' 
              ? chat.clientName 
              : chat.clientId 
                ? `Klient #${chat.clientId.slice(0, 6)}` 
                : 'Nowy klient';
            
            const messagePreview = chat.lastMessage && chat.lastMessage.trim() !== ''
              ? chat.lastMessage.length > 50
                ? `${chat.lastMessage.slice(0, 50)}...`
                : chat.lastMessage
              : 'Nowa wiadomość';
            
            allNotifications.push({
              id: `chat-${chat.id}`,
              title: chat.unreadAdmin > 0 
                ? `Nowa wiadomość od ${clientName}`
                : `Wiadomość od ${clientName}`,
              message: messagePreview,
              type: 'message',
              read: chat.unreadAdmin === 0,
              date: chat.lastMessageAt || new Date(),
              link: `/dashboard/admin/chat`,
              isNew: chat.unreadAdmin > 0
            });
          });
          
          // Pobierz wszystkie zamówienia dla admina, ale oznacz nowe
          try {
            const ordersQuery = query(
              collection(db, "orders"),
              orderBy("createdAt", "desc"),
              limit(10)
            );
            
            const ordersSnapshot = await getDocs(ordersQuery);
            
            ordersSnapshot.forEach(doc => {
              const data = doc.data();
              // Upewnij się, że nazwa klienta jest zawsze dostępna
              const clientName = data.userName && data.userName.trim() !== '' 
                ? data.userName 
                : 'Użytkownik';
              
              allNotifications.push({
                id: `order-${doc.id}`,
                title: data.status === "new" ? `Nowe zamówienie od ${clientName}` : `Aktualizacja zamówienia od ${clientName}`,
                message: data.title || 'Zamówienie',
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
          
          // Pobierz ankiety i formularze
          try {
            const seoQuery = query(
              collection(db, "seoFormSubmissions"),
              orderBy("createdAt", "desc"),
              limit(5)
            );
            
            const formQuery = query(
              collection(db, "formSubmissions"),
              orderBy("createdAt", "desc"),
              limit(5)
            );
            
            const [seoSnapshot, formSnapshot] = await Promise.all([
              getDocs(seoQuery),
              getDocs(formQuery)
            ]);
            
            seoSnapshot.forEach(doc => {
              const data = doc.data();
              const clientName = data.name && data.name.trim() !== '' 
                ? data.name 
                : 'Użytkownik';
              
              allNotifications.push({
                id: `seo-${doc.id}`,
                title: data.status === "new" ? `Nowa ankieta SEO od ${clientName}` : `Ankieta SEO od ${clientName}`,
                message: data.email || 'Brak adresu email',
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
              const clientName = data.name && data.name.trim() !== '' 
                ? data.name 
                : 'Użytkownik';
              
              allNotifications.push({
                id: `form-${doc.id}`,
                title: data.status === "new" ? `Nowy formularz WWW od ${clientName}` : `Formularz WWW od ${clientName}`,
                message: data.email || 'Brak adresu email',
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
        } else {
          // Dla klienta - wszystkie wiadomości, ale oznacz nieprzeczytane
          chats.forEach(chat => {
            const adminName = chat.adminName || 'Administrator';
            
            allNotifications.push({
              id: `chat-${chat.id}`,
              title: chat.unreadClient > 0 
                ? `Nowa wiadomość od ${adminName}`
                : `Wiadomość od ${adminName}`,
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
                limit(5)
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
                limit(3)
              );
              
              const formQuery = query(
                collection(db, "formSubmissions"),
                where("email", "==", user.email),
                orderBy("createdAt", "desc"),
                limit(3)
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
                  message: `Status: ${data.status || 'Nowa'}`,
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
                  message: `Status: ${data.status || 'Nowy'}`,
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
        }
        
        // Sortuj powiadomienia według daty (najnowsze na górze)
        allNotifications.sort((a, b) => {
          // Najpierw sortuj według statusu "nowe" (nowe na górze)
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          
          // Następnie sortuj według typu (nowe zamówienia na samej górze)
          if (a.type === 'order' && a.isNew && b.type !== 'order') return -1;
          if (b.type === 'order' && b.isNew && a.type !== 'order') return 1;
          
          // Następnie sortuj według typu (zamówienia i wiadomości na górze)
          if (a.type === 'order' && b.type !== 'order') return -1;
          if (a.type !== 'order' && b.type === 'order') return 1;
          if (a.type === 'message' && b.type !== 'message') return -1;
          if (a.type !== 'message' && b.type === 'message') return 1;
          
          // Na końcu sortuj według daty (najnowsze na górze)
          return b.date.getTime() - a.date.getTime();
        });
        
        // Ogranicz liczbę powiadomień w dropdownie
        setNotifications(allNotifications.slice(0, 15));
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
  }, [user, chats, pathname]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Wylogowano pomyślnie");
      router.push("/auth/login");
    } catch (error) {
      toast.error("Błąd podczas wylogowywania");
      console.error(error);
    }
  };

  // Inicjały użytkownika dla fallbacku avatara
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  
  // Ikona dla typu powiadomienia
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'order':
        return <ShoppingCart className="h-4 w-4" />;
      case 'survey':
      case 'form':
        return <FileText className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  // Kolor tła dla typu powiadomienia
  const getNotificationColor = (type: string, isNew: boolean = false) => {
    if (isNew) {
      switch (type) {
        case 'message':
          return 'bg-blue-100 text-blue-700';
        case 'order':
          return 'bg-green-100 text-green-700';
        case 'survey':
          return 'bg-purple-100 text-purple-700';
        case 'form':
          return 'bg-orange-100 text-orange-700';
        default:
          return 'bg-red-100 text-red-700';
      }
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
  
  // Tekst typu powiadomienia
  const getNotificationTypeText = (type: string, isAdmin: boolean = false) => {
    switch (type) {
      case 'message':
        return isAdmin ? 'Wiadomość od klienta' : 'Wiadomość od administratora';
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
  
  // Liczba nowych powiadomień
  const newNotificationsCount = notifications.filter(n => !n.read || n.isNew).length;
  
  // Liczba nowych powiadomień według typu
  const getNewNotificationsCountByType = (type: string) => {
    return notifications.filter(n => (n.type === type && (!n.read || n.isNew))).length;
  };

  const newOrdersCount = getNewNotificationsCountByType('order');
  const newMessagesCount = getNewNotificationsCountByType('message');
  const newFormsCount = getNewNotificationsCountByType('form');
  const newSurveysCount = getNewNotificationsCountByType('survey');
  
  // Wyodrębnij URL indeksu z komunikatu o błędzie
  const extractIndexUrl = (errorMessage: string) => {
    const urlMatch = errorMessage.match(/(https:\/\/console\.firebase\.google\.com\S+)/);
    return urlMatch ? urlMatch[1] : null;
  };

  // Funkcje obsługujące szczegóły ankiet
  const handleOpenSubmissionDetails = async (type: 'survey' | 'form', id: string) => {
    setIsLoadingSubmission(true);
    try {
      const collectionName = type === 'survey' ? 'seoFormSubmissions' : 'formSubmissions';
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (type === 'survey') {
          const seoSubmission: SeoSubmission = {
            id: docSnap.id,
            name: data.name || '',
            email: data.email || '',
            description: data.description || '',
            websiteUrl: data.websiteUrl || '',
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate(),
            budget: data.budget || '',
            customBudget: data.customBudget || '',
            goals: {
              traffic: Array.isArray(data.goals?.traffic) ? data.goals.traffic : [],
              conversion: Array.isArray(data.goals?.conversion) ? data.goals.conversion : [],
              positions: Array.isArray(data.goals?.positions) ? data.goals.positions : [],
              custom: Array.isArray(data.goals?.custom) ? data.goals.custom : [],
            },
            expectations: data.expectations || '',
            otherInfo: data.otherInfo || '',
            selectedServices: Array.isArray(data.selectedServices) ? data.selectedServices : [],
            customServices: Array.isArray(data.customServices) ? data.customServices : [],
            selectedKeywords: Array.isArray(data.selectedKeywords) ? data.selectedKeywords : [],
            customKeywords: Array.isArray(data.customKeywords) ? data.customKeywords : [],
            competitors: Array.isArray(data.competitors) ? data.competitors : [],
            challenges: Array.isArray(data.challenges) ? data.challenges : [],
            additionalInfo: data.additionalInfo || {},
            seoHistory: {
              previouslyWorked: !!data.seoHistory?.previouslyWorked,
              startDate: data.seoHistory?.startDate || '',
              endDate: data.seoHistory?.endDate || '',
              previousAgencies: Array.isArray(data.seoHistory?.previousAgencies) ? data.seoHistory.previousAgencies : [],
              previousResults: data.seoHistory?.previousResults || '',
            },
            targetTimeframe: data.targetTimeframe || '',
            status: data.status || 'new',
          };
          setSelectedSeoSubmission(seoSubmission);
          setIsSeoDialogOpen(true);
        } else {
          const formSubmission: FormSubmission = {
            id: docSnap.id,
            name: data.name || '',
            email: data.email || '',
            description: data.description || '',
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate(),
            colorScheme: data.colorScheme || '',
            contentType: data.contentType || '',
            customColors: data.customColors || { primary: '', secondary: '', accent: '' },
            customSections: Array.isArray(data.customSections) ? data.customSections : [],
            domainOption: data.domainOption || '',
            ownDomain: data.ownDomain || '',
            photoType: data.photoType || '',
            selectedSections: Array.isArray(data.selectedSections) ? data.selectedSections : [],
            websiteStyle: data.websiteStyle || '',
            status: data.status || 'new',
          };
          setSelectedFormSubmission(formSubmission);
          setIsFormDialogOpen(true);
        }
      }
    } catch (error) {
      console.error("Error fetching submission details:", error);
      toast.error("Błąd podczas ładowania szczegółów");
    } finally {
      setIsLoadingSubmission(false);
    }
  };

  const handleCloseSeoDetails = () => {
    setIsSeoDialogOpen(false);
    setTimeout(() => {
      setSelectedSeoSubmission(null);
    }, 300);
  };

  const handleCloseFormDetails = () => {
    setIsFormDialogOpen(false);
    setTimeout(() => {
      setSelectedFormSubmission(null);
    }, 300);
  };

  return (
    <header className="bg-white border-b px-4 py-3 sticky top-0 z-10 shadow-sm">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={toggleMobileMenu}
          >
            <MenuOutlined />
          </Button>
          <h1 className="text-lg font-medium">
            {pathname.includes('/admin') ? "Panel administratora" : "Panel klienta"}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {newNotificationsCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] min-w-[18px] flex items-center justify-center">
                    {newNotificationsCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[320px] bg-white shadow-lg border border-gray-200">
              <DropdownMenuLabel className="font-normal">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-semibold">Powiadomienia</h2>
                  {newNotificationsCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {newNotificationsCount} nowych
                    </Badge>
                  )}
                </div>
                {newNotificationsCount > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {newOrdersCount > 0 && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        {newOrdersCount} zamówień
                      </Badge>
                    )}
                    {newMessagesCount > 0 && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        {newMessagesCount} wiadomości
                      </Badge>
                    )}
                    {newFormsCount > 0 && (
                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                        {newFormsCount} formularzy
                      </Badge>
                    )}
                    {newSurveysCount > 0 && (
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                        {newSurveysCount} ankiet
                      </Badge>
                    )}
                  </div>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Ładowanie powiadomień...
                </div>
              ) : indexError ? (
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm font-medium">Wymagany indeks Firebase</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Aby wyświetlić powiadomienia, należy utworzyć indeks w Firebase.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => {
                      const indexUrl = extractIndexUrl(indexError);
                      if (indexUrl) {
                        window.open(indexUrl, '_blank');
                      }
                    }}
                  >
                    Utwórz indeks
                  </Button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Brak powiadomień
                </div>
              ) : (
                <StyledScrollArea>
                  <div className="max-h-[250px] overflow-hidden">
                    {notifications.slice(0, 3).map((notification) => {
                      const isNewOrder = notification.type === 'order' && notification.isNew;
                      const isSubmissionType = notification.type === 'survey' || notification.type === 'form';
                      
                      return (
                        <DropdownMenuItem key={notification.id} asChild>
                          {isSubmissionType ? (
                            <div 
                              onClick={() => {
                                setShowNotifications(false);
                                handleOpenSubmissionDetails(
                                  notification.type as 'survey' | 'form',
                                  notification.id.split('-')[1]
                                );
                              }} 
                              className="cursor-pointer w-full"
                            >
                              <div className={`flex items-start gap-3 py-2 px-2 rounded-md ${
                                notification.isNew 
                                  ? 'bg-gray-50 border-l-4 border-red-500' 
                                  : 'hover:bg-gray-50'
                              }`}>
                                <div className={`flex-shrink-0 rounded-full p-2 ${getNotificationColor(notification.type, notification.isNew)}`}>
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-medium truncate">{notification.title}</p>
                                    {notification.isNew && (
                                      <Badge 
                                        variant="default" 
                                        className="flex-shrink-0 text-[10px] px-1.5 py-0 bg-red-500"
                                      >
                                        Nowe
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Badge variant="outline" className={`flex-shrink-0 text-[10px] px-1.5 py-0 ${getNotificationColor(notification.type, false)}`}>
                                      {getNotificationTypeText(notification.type, pathname.includes('/admin'))}
                                    </Badge>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {notification.message}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(notification.date, { addSuffix: true, locale: pl })}
                                    </p>
                                    <p className="text-xs text-primary">Szczegóły →</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <Link href={notification.link} className="cursor-pointer w-full">
                              <div className={`flex items-start gap-3 py-2 px-2 rounded-md ${
                                notification.isNew 
                                  ? isNewOrder 
                                    ? 'bg-green-50 border-l-4 border-green-500' 
                                    : 'bg-gray-50 border-l-4 border-red-500' 
                                  : 'hover:bg-gray-50'
                              }`}>
                                <div className={`flex-shrink-0 rounded-full p-2 ${getNotificationColor(notification.type, notification.isNew)}`}>
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-medium truncate">{notification.title}</p>
                                    {notification.isNew && (
                                      <Badge 
                                        variant="default" 
                                        className={`flex-shrink-0 text-[10px] px-1.5 py-0 ${isNewOrder ? 'bg-green-500' : 'bg-red-500'}`}
                                      >
                                        Nowe
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Badge variant="outline" className={`flex-shrink-0 text-[10px] px-1.5 py-0 ${getNotificationColor(notification.type, false)}`}>
                                      {getNotificationTypeText(notification.type, pathname.includes('/admin'))}
                                    </Badge>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {notification.message}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(notification.date, { addSuffix: true, locale: pl })}
                                    </p>
                                    <p className="text-xs text-primary">Szczegóły →</p>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                </StyledScrollArea>
              )}
              
              <DropdownMenuSeparator />
              {notifications.length > 3 && (
                <DropdownMenuItem asChild className="hover:bg-gray-50">
                  <Link href={pathname.includes('/admin') ? "/dashboard/admin/notifications" : "/dashboard/client/notifications"} className="cursor-pointer justify-center text-sm text-primary font-medium w-full">
                    Zobacz wszystkie ({notifications.length})
                  </Link>
                </DropdownMenuItem>
              )}
              {newNotificationsCount > 0 && pathname.includes('/admin') && (
                <DropdownMenuItem asChild className="hover:bg-gray-50">
                  <Link href="/dashboard/admin/notifications?status=new" className="cursor-pointer justify-center text-sm text-red-500 font-medium w-full">
                    Zobacz {newNotificationsCount} nowych
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-1">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || ""} />
                    <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{user?.displayName}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white shadow-lg border border-gray-200">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild className="hover:bg-gray-50">
                  <Link href={pathname.includes('/admin') ? "/dashboard/admin/profile" : "/dashboard/client/profile"} className="w-full">
                    <UserOutlined className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-gray-50">
                  <Link href={pathname.includes('/admin') ? "/dashboard/admin/settings" : "/dashboard/client/settings"} className="w-full">
                    <SettingOutlined className="mr-2 h-4 w-4" />
                    <span>Ustawienia</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="hover:bg-gray-50">
                <LogoutOutlined className="mr-2 h-4 w-4" />
                <span>Wyloguj</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Dialog ze szczegółami ankiety SEO */}
      <Dialog 
        open={isSeoDialogOpen} 
        onOpenChange={(open) => {
          if (!open) handleCloseSeoDetails();
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white">
          <DialogHeader>
            <DialogTitle>Szczegóły ankiety SEO</DialogTitle>
            <DialogDescription>
              Pełne informacje o ankiecie SEO
              {selectedSeoSubmission && <span className="ml-1 text-xs">(ID: {selectedSeoSubmission.id})</span>}
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingSubmission ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : selectedSeoSubmission && (
            <ScrollArea className="max-h-[80vh]">
              <ClientSeoSubmissionDetails submission={selectedSeoSubmission} />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog ze szczegółami formularza strony */}
      <Dialog 
        open={isFormDialogOpen} 
        onOpenChange={(open) => {
          if (!open) handleCloseFormDetails();
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white">
          <DialogHeader>
            <DialogTitle>Szczegóły ankiety WWW</DialogTitle>
            <DialogDescription>
              Pełne informacje o ankiecie WWW
              {selectedFormSubmission && <span className="ml-1 text-xs">(ID: {selectedFormSubmission.id})</span>}
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingSubmission ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : selectedFormSubmission && (
            <ScrollArea className="max-h-[80vh]">
              <ClientFormSubmissionDetails submission={selectedFormSubmission} />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </header>
  );
}