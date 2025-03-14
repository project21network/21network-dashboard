import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, MessageSquare, ClipboardList, Users, TrendingUp, Calendar } from "lucide-react";
import { getDashboardStats } from "@/lib/firebase/admin";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Panel Administratora</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zamówienia</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Dzisiaj: {stats.dailyStats.orders}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nowe Wiadomości</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newMessages}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Przychody Dziś</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dailyStats.revenue.toFixed(2)} zł</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Użytkownicy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Nowi dziś: {stats.dailyStats.newUsers}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Ostatnie Zamówienia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Zamówienie #{order.id.slice(0, 6)}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(order.createdAt, "dd MMMM yyyy HH:mm", { locale: pl })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.total.toFixed(2)} zł</p>
                    <p className="text-sm text-muted-foreground">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Statystyki Dziś
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Zamówienia</p>
                <p className="text-sm">{stats.dailyStats.orders}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Przychody</p>
                <p className="text-sm">{stats.dailyStats.revenue.toFixed(2)} zł</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Nowi Użytkownicy</p>
                <p className="text-sm">{stats.dailyStats.newUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 