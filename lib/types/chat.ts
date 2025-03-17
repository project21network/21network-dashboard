export interface ChatMessage {
    id: string;
    chatId: string;
    senderId: string;
    senderName: string;
    senderRole: "admin" | "client";
    content: string;
    createdAt: Date;
    read: boolean;
  }
  
  export interface Chat {
    id: string;
    clientId: string;
    clientName: string;
    adminId?: string;
    adminName?: string;
    lastMessage?: string;
    lastMessageAt?: Date;
    unreadClient: number;
    unreadAdmin: number;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
  }