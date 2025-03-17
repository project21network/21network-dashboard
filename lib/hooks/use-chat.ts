import { useState, useEffect, useCallback } from "react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Chat, ChatMessage } from "@/lib/types/chat";
import { useAuth } from "./use-auth";

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, isAdmin } = useAuth();

  // Fetch chats for current user
  useEffect(() => {
    if (!user) return;
    
    const fetchChats = async (): Promise<(() => void) | undefined> => {
      setIsLoading(true);
      setError(null);
      
      try {
        // For admin, get all active chats
        // For client, get only their chats
        const chatsQuery = isAdmin
          ? query(
              collection(db, "chats"),
              where("isActive", "==", true),
              orderBy("updatedAt", "desc")
            )
          : query(
              collection(db, "chats"),
              where("clientId", "==", user.uid),
              where("isActive", "==", true),
              orderBy("updatedAt", "desc")
            );
        
        const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
          const chatsList = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
              lastMessageAt: data.lastMessageAt?.toDate(),
            } as Chat;
          });
          
          setChats(chatsList);
          setIsLoading(false);
        }, (err) => {
          setError(err instanceof Error ? err : new Error(String(err)));
          console.error("Error fetching chats:", err);
          setIsLoading(false);
        });
        
        return unsubscribe;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error("Error setting up chats listener:", err);
        setIsLoading(false);
        return undefined;
      }
    };
    
    const unsubscribe = fetchChats();
    return () => {
      if (unsubscribe) {
        unsubscribe.then(unsub => {
          if (unsub) {
            unsub();
          }
        }).catch(err => {
          console.error("Error unsubscribing:", err);
        });
      }
    };
  }, [user, isAdmin]);

  // Subscribe to messages when a chat is selected
  useEffect(() => {
    if (!currentChat) {
      setMessages([]);
      return;
    }
    
    const messagesQuery = query(
      collection(db, "chatMessages"),
      where("chatId", "==", currentChat.id),
      orderBy("createdAt", "asc")
    );
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: new Date(),
        } as ChatMessage;
      });
      
      setMessages(messagesList);
      
      // Mark messages as read
      markMessagesAsRead(currentChat.id);
    }, (error) => {
      console.error("Error listening to messages:", error);
    });
    
    return () => unsubscribe();
  }, [currentChat]);

  const selectChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId) || null;
    setCurrentChat(chat);
  };

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!user || !currentChat) return false;
    
    try {
      const userRole = isAdmin ? "admin" : "client";
      
      // Add new message
      await addDoc(collection(db, "chatMessages"), {
        chatId: currentChat.id,
        senderId: user.uid,
        senderName: user.displayName,
        senderRole: userRole,
        content,
        createdAt: serverTimestamp(),
        read: false,
      });
      
      // Update chat with last message
      await updateDoc(doc(db, "chats", currentChat.id), {
        lastMessage: content,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(isAdmin
          ? { unreadClient: (currentChat.unreadClient || 0) + 1 }
          : { unreadAdmin: (currentChat.unreadAdmin || 0) + 1 }),
      });
      
      return true;
    } catch (err) {
      console.error("Error sending message:", err);
      return false;
    }
  };

  const markMessagesAsRead = async (chatId: string): Promise<void> => {
    if (!user) return;
    
    try {
      const fieldToUpdate = isAdmin ? "unreadAdmin" : "unreadClient";
      
      // Update chat unread counter
      await updateDoc(doc(db, "chats", chatId), {
        [fieldToUpdate]: 0,
      });
      
      // Get messages that are unread and sent by the other party
      const unreadMessagesQuery = query(
        collection(db, "chatMessages"),
        where("chatId", "==", chatId),
        where("read", "==", false),
        where("senderRole", "==", isAdmin ? "client" : "admin")
      );
      
      const snapshot = await getDocs(unreadMessagesQuery);
      
      // Mark each message as read
      const updatePromises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { read: true })
      );
      
      await Promise.all(updatePromises);
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  const createNewChat = async (): Promise<string | null> => {
    if (!user || isAdmin) return null;
    
    try {
      // Check if user already has an active chat
      if (chats.length > 0) {
        return chats[0].id;
      }
      
      // Create new chat
      const chatRef = await addDoc(collection(db, "chats"), {
        clientId: user.uid,
        clientName: user.displayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        unreadClient: 0,
        unreadAdmin: 0,
        isActive: true,
      });
      
      return chatRef.id;
    } catch (err) {
      console.error("Error creating new chat:", err);
      return null;
    }
  };

  return {
    chats,
    currentChat,
    messages,
    isLoading,
    error,
    selectChat,
    sendMessage,
    createNewChat,
  };
}