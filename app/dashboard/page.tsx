"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/use-auth";

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {isAdmin ? "Panel administratora" : "Panel klienta"}
      </h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isAdmin ? <AdminDashboardCards /> : <ClientDashboardCards />}
      </div>
    </div>
  );
}

function AdminDashboardCards() {
  // Dane przykładowe (w produkcji pobierz z Firestore)
  const [stats, setStats] = useState({
    totalClients: 0,
    activeOrders: 0,
    newSurveys: 0,
    unreadMessages: 0,
  });
  
  // Symulacja ładowania danych
  useEffect(() => {
    // W produkcji zamiast setTimeout użyj hooków do pobierania z Firestore
    const timer = setTimeout(() => {
      setStats({
        totalClients: 145,
        activeOrders: 28,
        newSurveys: 12,
        unreadMessages: 5,
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Klienci
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClients}</div>
          <p className="text-xs text-muted-foreground mt-1">
            +12 w ostatnim miesiącu
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Aktywne zamówienia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeOrders}</div>
          <p className="text-xs text-muted-foreground mt-1">
            7 oczekuje na realizację
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Nowe ankiety
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.newSurveys}</div>
          <p className="text-xs text-muted-foreground mt-1">
            +4 w tym tygodniu
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Nieprzeczytane wiadomości
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.unreadMessages}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Od 3 klientów
          </p>
        </CardContent>
      </Card>
    </>
  );
}

function ClientDashboardCards() {
  // Dane przykładowe (w produkcji pobierz z Firestore)
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingSurveys: 0,
    unreadMessages: 0,
  });
  
  // Symulacja ładowania danych
  useEffect(() => {
    // W produkcji zamiast setTimeout użyj hooków do pobierania z Firestore
    const timer = setTimeout(() => {
      setStats({
        totalOrders: 8,
        pendingSurveys: 2,
        unreadMessages: 3,
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Twoje zamówienia
            </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
          <p className="text-xs text-muted-foreground mt-1">
            2 w trakcie realizacji
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ankiety do wypełnienia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingSurveys}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Ostatnia dodana 3 dni temu
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Nieprzeczytane wiadomości
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.unreadMessages}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Od administracji
          </p>
        </CardContent>
      </Card>
    </>
  );
}
          