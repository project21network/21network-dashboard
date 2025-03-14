"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/lib/hooks/use-user-profile";
import { UserOutlined, SaveOutlined, LoadingOutlined } from "@ant-design/icons";
import { toast } from "sonner";

export default function SettingsPage() {
  const { userProfile, isLoading, updateUserProfile } = useUserProfile();
  const [formData, setFormData] = useState({
    displayName: "",
    company: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || "",
        company: userProfile.company || "",
        phone: userProfile.phone || "",
      });
    }
  }, [userProfile]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      const success = await updateUserProfile({
        displayName: formData.displayName,
        company: formData.company || undefined,
        phone: formData.phone || undefined,
      });
      
      if (success) {
        toast.success("Twoje dane zostały zaktualizowane");
      } else {
        toast.error("Nie udało się zaktualizować danych");
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas aktualizacji danych");
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ustawienia konta</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="account">Konto</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Dane profilu</CardTitle>
              <CardDescription>
                Zaktualizuj swoje dane osobowe i kontaktowe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-4 mb-6 md:mb-0">
                  <Avatar className="w-24 h-24">
                    {userProfile?.photoURL ? (
                      <AvatarImage src={userProfile.photoURL} alt={userProfile.displayName} />
                    ) : (
                      <AvatarFallback className="bg-gray-100 text-gray-400">
                        <UserOutlined style={{ fontSize: 32 }} />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="text-sm text-muted-foreground">
                    {userProfile?.email}
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Imię i nazwisko</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Firma</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Nazwa firmy (opcjonalnie)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Numer telefonu (opcjonalnie)"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <LoadingOutlined className="mr-2" /> Zapisywanie...
                        </>
                      ) : (
                        <>
                          <SaveOutlined className="mr-2" /> Zapisz zmiany
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Ustawienia konta</CardTitle>
              <CardDescription>
                Zarządzaj ustawieniami swojego konta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Zmiana hasła</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Aby zmienić hasło, skorzystaj z opcji resetowania hasła na stronie logowania.
                  </p>
                  <Button variant="outline">
                    Wyloguj się i zresetuj hasło
                  </Button>
                </div>
                
                <div className="border-t pt-4 mt-6">
                  <h3 className="text-lg font-medium text-red-600">Niebezpieczna strefa</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Jeśli chcesz usunąć swoje konto, skontaktuj się z administracją.
                  </p>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    Skontaktuj się z administracją
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 