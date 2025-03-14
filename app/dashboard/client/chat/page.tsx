"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/lib/hooks/use-chat";
import { useAuth } from "@/lib/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { motion } from "framer-motion";
import { SendOutlined } from "@ant-design/icons";

export default function ClientChatPage() {
  const { chats, currentChat, messages, isLoading, selectChat, sendMessage, createNewChat } = useChat();
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
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
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                Rozpocznij rozmowę z administracją
              </p>
            </div>
          ) : (
            <div className="space-y-4">
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
                        {formatMessageTime(message.createdAt)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
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
      </Card>
    </div>
  );
}