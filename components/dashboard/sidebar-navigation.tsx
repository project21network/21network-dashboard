"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeOutlined, 
  ShoppingCartOutlined, 
  FormOutlined, 
  MessageOutlined, 
  UserOutlined, 
  BarChartOutlined, 
  FileTextOutlined,
  FileAddOutlined,
  SearchOutlined
} from "@ant-design/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarNavigationProps {
  userRole: string | null;
}

export function SidebarNavigation({ userRole }: SidebarNavigationProps) {
  const pathname = usePathname();

  const navigation = useMemo(() => {
    const clientNav: NavigationItem[] = [
      { name: "Dashboard", href: "/dashboard", icon: <HomeOutlined /> },
      { name: "Moje zamówienia", href: "/dashboard/client/orders", icon: <ShoppingCartOutlined /> },
      { name: "Stwórz zamówienie", href: "/dashboard/client/create-order", icon: <FileAddOutlined /> },
      { name: "Ankiety", href: "/dashboard/client/surveys", icon: <FormOutlined /> },
      { name: "Czat z administracją", href: "/dashboard/client/chat", icon: <MessageOutlined /> },
      { name: "Ustawienia", href: "/dashboard/client/settings", icon: <UserOutlined /> },
    ];

    const adminNav: NavigationItem[] = [
      { name: "Dashboard", href: "/dashboard", icon: <BarChartOutlined /> },
      { name: "Zarządzanie klientami", href: "/dashboard/admin/clients", icon: <UserOutlined /> },
      { name: "Przegląd zamówień", href: "/dashboard/admin/orders", icon: <ShoppingCartOutlined /> },
      { name: "Ankiety klientów", href: "/dashboard/admin/surveys", icon: <FileTextOutlined /> },
      { name: "Formularze stron", href: "/dashboard/admin/form-submissions", icon: <FileAddOutlined /> },
      { name: "Formularze SEO", href: "/dashboard/admin/seo-submissions", icon: <SearchOutlined /> },
      { name: "Czat z klientami", href: "/dashboard/admin/chat", icon: <MessageOutlined /> },
    ];

    return userRole === "admin" ? adminNav : clientNav;
  }, [userRole]);

  return (
    <div className="flex flex-col h-full border-r bg-white">
      <div className="flex items-center justify-center h-16 border-b">
        <Link href="/dashboard" className="flex items-center">
          <span className="text-xl font-semibold">21Network</span>
        </Link>
      </div>
      <div className="flex flex-col flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-4 py-3 text-sm font-medium rounded-md",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}