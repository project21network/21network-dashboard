"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChat } from "@/lib/hooks/use-chat";
import { useAuth } from "@/lib/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { motion } from "framer-motion";
import { SendOutlined, UserOutlined, DownOutlined } from "@ant-design/icons";

export default function ClientChatPage() {
  const { chats, currentChat, messages, isLoading, selectChat, sendMessage, createNewChat } = useChat();
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Show/hide scroll button based on scroll position
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Select first chat or create new one if needed
  useEffect(() => {
    if (!isLoading && user) {
      if (chats.length > 0) {
        selectChat(chats[0].id);
      } else {
        handleCreateChat();
      }
    }
  }, [isLoading, user, chats]);
  
  const handleCreateChat = async () => {
    const chatId = await createNewChat();
    if (chatId) {
      selectChat(chatId);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !currentChat) return;
    
    setIsSending(true);
    
    try {
      await sendMessage(messageInput);
      setMessageInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Funkcja do generowania inicjałów z nazwy
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return "";
    
    try {
      // Sprawdź czy to jest Timestamp z Firebase
      if (timestamp.toDate) {
        return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: pl });
      }
      
      // Sprawdź czy to jest obiekt Date
      if (timestamp instanceof Date) {
        return formatDistanceToNow(timestamp, { addSuffix: true, locale: pl });
      }
      
      // Spróbuj utworzyć Date z timestamp
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", timestamp);
        return "";
      }
      
      return formatDistanceToNow(date, { addSuffix: true, locale: pl });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };
  
  // Symulacja pisania przez administratora
  useEffect(() => {
    if (!currentChat) return;
    
    // Symulacja losowego pisania przez administratora
    const randomTyping = () => {
      const shouldType = Math.random() > 0.7;
      if (shouldType) {
        setIsAdminTyping(true);
        setTimeout(() => setIsAdminTyping(false), 3000 + Math.random() * 2000);
      }
      
      // Ustaw kolejny interwał
      setTimeout(randomTyping, 10000 + Math.random() * 20000);
    };
    
    // Rozpocznij symulację
    const typingTimeout = setTimeout(randomTyping, 5000);
    
    return () => clearTimeout(typingTimeout);
  }, [currentChat]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Czat z administracją</h1>
      
      <Card className="flex flex-col bg-white rounded-lg shadow-sm h-[calc(100vh-220px)]">
        {currentChat && (
          <div className="flex items-center p-4 border-b">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src="" />
              <AvatarFallback className="bg-green-100 text-green-600">A</AvatarFallback>
            </Avatar>
            <div className="font-medium">Administrator</div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-4" ref={messagesContainerRef}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                Rozpocznij rozmowę z administracją
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isOwnMessage = message.senderId === user?.uid;
                const showAvatar = index === 0 || 
                  messages[index - 1].senderId !== message.senderId;
                const showName = showAvatar;
                const isLastInGroup = index === messages.length - 1 || 
                  messages[index + 1].senderId !== message.senderId;
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex mb-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isOwnMessage && (
                      <div className="flex-shrink-0 w-8 mr-2">
                        {showAvatar ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-green-100 text-green-600">A</AvatarFallback>
                          </Avatar>
                        ) : <div className="w-8" />}
                      </div>
                    )}
                    
                    <div className={`flex flex-col max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                      {showName && (
                        <span className={`text-xs mb-1 ${isOwnMessage ? 'text-right text-blue-600' : 'text-left text-green-600'}`}>
                          {isOwnMessage ? user?.displayName || 'Ty' : 'Administrator'}
                        </span>
                      )}
                      
                      <div
                        className={`px-4 py-2 shadow-sm w-full ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-100 text-gray-800'
                        } ${
                          // Zaokrąglenia w zależności od pozycji w grupie
                          showAvatar && isLastInGroup
                            ? isOwnMessage 
                              ? 'rounded-lg rounded-tr-none' 
                              : 'rounded-lg rounded-tl-none'
                            : showAvatar && !isLastInGroup
                              ? isOwnMessage
                                ? 'rounded-lg rounded-tr-none rounded-br-md'
                                : 'rounded-lg rounded-tl-none rounded-bl-md'
                              : !showAvatar && isLastInGroup
                                ? isOwnMessage
                                  ? 'rounded-lg rounded-tr-md'
                                  : 'rounded-lg rounded-tl-md'
                                : 'rounded-lg rounded-tr-md rounded-tl-md'
                        }`}
                      >
                        <div className="text-sm break-words whitespace-pre-wrap">{message.content}</div>
                        {isLastInGroup && (
                          <div className="text-xs mt-1 opacity-70 text-right">
                            {formatMessageTime(message.createdAt)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {isOwnMessage && (
                      <div className="flex-shrink-0 w-8 ml-2">
                        {showAvatar ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.photoURL || ""} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {getInitials(user?.displayName || 'U')}
                            </AvatarFallback>
                          </Avatar>
                        ) : <div className="w-8" />}
                      </div>
                    )}
                  </motion.div>
                );
              })}
              
              {isAdminTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start mb-1"
                >
                  <div className="flex-shrink-0 w-8 mr-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-green-100 text-green-600">A</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs mb-1 text-green-600">
                      Administrator
                    </span>
                    <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg rounded-tl-none shadow-sm">
                      <div className="flex items-center space-x-1 h-5 w-12 justify-center">
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></span>
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
          
          {showScrollButton && (
            <Button
              className="absolute bottom-20 right-6 rounded-full w-10 h-10 p-0 shadow-md"
              onClick={scrollToBottom}
            >
              <DownOutlined />
            </Button>
          )}
        </div>
        
        <div className="border-t p-4">
          {isSending && (
            <div className="mb-2 text-xs text-gray-500 flex items-center">
              <span className="mr-2">Wysyłanie</span>
              <div className="flex space-x-1">
                <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-pulse"></span>
                <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Wpisz wiadomość..."
              className="min-h-[60px] resize-none"
            />
            <Button 
              type="submit" 
              disabled={isSending || !messageInput.trim()}
              className="bg-primary hover:bg-primary/90 transition-colors"
            >
              <SendOutlined />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}