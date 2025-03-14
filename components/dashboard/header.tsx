"use client";

import { User } from "firebase/auth";
import { MenuOutlined, BellOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutUser } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface HeaderProps {
  user: User | null;
  toggleMobileMenu: () => void;
}

export function Header({ user, toggleMobileMenu }: HeaderProps) {
  const router = useRouter();

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

  return (
    <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={toggleMobileMenu}
        >
          <MenuOutlined />
        </Button>
        <h1 className="text-lg font-medium">Panel administracyjny</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <BellOutlined />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        
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
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              <LogoutOutlined className="mr-2" />
              Wyloguj
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}