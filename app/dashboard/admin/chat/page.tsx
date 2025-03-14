"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/lib/hooks/use-chat";
import { useAuth } from "@/lib/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { SendOutlined, MessageOutlined } from "@ant-design/icons";

export default function AdminChatPage() {
  const { chats, currentChat, messages, isLoading, selectChat, sendMessage } = useChat();
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Czat z klientami</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card className="h-[calc(100vh-220px)]">
            <div className="p-4 border-b">
              <h2 className="font-medium">Konwersacje</h2>
            </div>
            <ScrollArea className="h-[calc(100%-56px)]">
              {chats.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Brak aktywnych konwersacji
                </div>
              ) : (
                <div className="p-2">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                        currentChat?.id === chat.id
                          ? "bg-primary/10"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => selectChat(chat.id)}
                    >
                      <div className="mr-3 relative">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <MessageOutlined />
                        </div>
                        {chat.unreadAdmin > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                            {chat.unreadAdmin}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium truncate">{chat.clientName}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {chat.lastMessage
                            ? chat.lastMessage
                            : "Rozpocznij konwersację"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Card className="flex flex-col h-[calc(100vh-220px)]">
            {!currentChat ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  Wybierz klienta, aby rozpocząć konwersację
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center p-4 border-b">
                  <div className="font-medium">{currentChat.clientName}</div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        Rozpocznij konwersację z klientem
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {messages.map((message) => {
                          const isOwnMessage = message.senderId === user?.uid;
                          
                          return (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] px-4 py-2 rounded-lg ${
                                  isOwnMessage
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <div className="text-sm">{message.content}</div>
                                <div className="text-xs mt-1 opacity-70">
                                  {message.createdAt instanceof Date 
                                    ? formatDistanceToNow(message.createdAt, { addSuffix: true, locale: pl })
                                    : "Przed chwilą"}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Wpisz wiadomość..."
                      className="min-h-[60px] resize-none"
                    />
                    <Button type="submit" disabled={isSending || !messageInput.trim()}>
                      <SendOutlined />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}