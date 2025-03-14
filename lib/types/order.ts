export type OrderStatus = 
  | "new"
  | "processing"
  | "completed"
  | "cancelled";

export interface Order {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  totalAmount: number;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
}