"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  MessageSquare, 
  ClipboardList 
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Zamówienia",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Czaty",
    href: "/admin/chats",
    icon: MessageSquare,
  },
  {
    title: "Ankiety",
    href: "/admin/surveys",
    icon: ClipboardList,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="w-64 min-h-screen bg-gray-100 p-4 border-r">
      <div className="space-y-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Panel Admina</h2>
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-200 transition-colors",
                  pathname === item.href ? "bg-gray-200" : "transparent"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
} 