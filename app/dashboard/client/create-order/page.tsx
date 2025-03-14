"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightOutlined, GlobalOutlined, SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CreateOrderPage() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleRedirect = (url: string) => {
    window.open(url, "_blank");
  };

  const cardVariants = {
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 }
    },
    initial: {
      scale: 1,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Stwórz zamówienie</h1>
      <p className="text-muted-foreground">
        Wybierz rodzaj usługi, którą chcesz zamówić. Po wypełnieniu ankiety, nasz zespół skontaktuje się z Tobą w celu omówienia szczegółów.
      </p>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        {/* Karta dla stron WWW */}
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate={hoveredCard === "www" ? "hover" : "initial"}
          onMouseEnter={() => setHoveredCard("www")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Card onClick={() => handleRedirect("https://ankieta.21network.io/step/1")} className="h-full cursor-pointer overflow-hidden border-2 hover:border-primary transition-colors duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-8">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Strona internetowa</CardTitle>
                  <CardDescription>
                    Stwórz nowoczesną i responsywną stronę internetową
                  </CardDescription>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <GlobalOutlined style={{ fontSize: "24px" }} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Nowoczesny design dostosowany do Twoich potrzeb</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Responsywność na wszystkich urządzeniach</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Optymalizacja pod kątem wydajności</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Przyjazny dla użytkownika interfejs</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => handleRedirect("https://ankieta.21network.io/step/1")}
              >
                Wypełnij ankietę <ArrowRightOutlined className="ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Karta dla SEO */}
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate={hoveredCard === "seo" ? "hover" : "initial"}
          onMouseEnter={() => setHoveredCard("seo")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Card onClick={() => handleRedirect("https://ankieta.21network.io/seo/step/1")} className="h-full cursor-pointer overflow-hidden border-2 hover:border-primary transition-colors duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 pb-8">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Pozycjonowanie SEO</CardTitle>
                  <CardDescription>
                    Zwiększ widoczność swojej strony w wyszukiwarkach
                  </CardDescription>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <SearchOutlined style={{ fontSize: "24px" }} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Analiza słów kluczowych</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Optymalizacja treści na stronie</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Budowanie profilu linków</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Regularne raporty z postępów</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => handleRedirect("https://ankieta.21network.io/seo")}
              >
                Wypełnij ankietę <ArrowRightOutlined className="ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium mb-2">Jak to działa?</h3>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>Wybierz rodzaj usługi i wypełnij odpowiednią ankietę</li>
          <li>Nasz zespół przeanalizuje Twoje potrzeby i skontaktuje się z Tobą</li>
          <li>Ustalimy szczegóły i przygotujemy ofertę</li>
          <li>Po akceptacji oferty rozpoczniemy pracę nad Twoim projektem</li>
        </ol>
      </div>
    </div>
  );
} 