# Panel Administracyjny 21Network

Panel administracyjny dla firmy 21Network, umożliwiający zarządzanie ankietami, zamówieniami i klientami.

## Funkcjonalności

- **Panel Administratora**:
  - Zarządzanie ankietami WWW
  - Zarządzanie ankietami SEO
  - Zarządzanie zamówieniami
  - Zarządzanie użytkownikami

- **Panel Klienta**:
  - Przeglądanie zamówień
  - Przeglądanie ankiet WWW
  - Przeglądanie ankiet SEO

## Technologie

- Next.js 14 (App Router)
- TypeScript
- Firebase (Authentication, Firestore)
- Tailwind CSS
- Shadcn UI

## Wymagania

- Node.js 18+
- npm lub yarn

## Instalacja

1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/twoja-organizacja/admin-panel-21network.git
   cd admin-panel-21network
   ```

2. Zainstaluj zależności:
   ```bash
   npm install
   # lub
   yarn install
   ```

3. Skonfiguruj zmienne środowiskowe:
   Utwórz plik `.env.local` w głównym katalogu projektu i dodaj następujące zmienne:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=twój-klucz-api
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=twoja-domena.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=twój-projekt-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=twój-bucket.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=twój-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=twój-app-id
   ```

4. Uruchom aplikację w trybie deweloperskim:
   ```bash
   npm run dev
   # lub
   yarn dev
   ```

5. Otwórz [http://localhost:3000](http://localhost:3000) w przeglądarce.

## Indeksy Firebase

Aplikacja wymaga utworzenia specjalnych indeksów w Firebase Firestore. Szczegółowe instrukcje znajdują się w pliku [FIREBASE_INDEXES.md](./FIREBASE_INDEXES.md).

## Struktura projektu

```
admin-panel-21network/
├── app/                    # Główny katalog aplikacji Next.js
│   ├── dashboard/          # Panel administracyjny i klienta
│   │   ├── admin/          # Strony dostępne dla administratorów
│   │   └── client/         # Strony dostępne dla klientów
│   ├── auth/               # Strony autoryzacji
│   └── layout.tsx          # Główny layout aplikacji
├── components/             # Komponenty React
│   ├── ui/                 # Komponenty UI (Shadcn)
│   └── ...                 # Inne komponenty
├── lib/                    # Biblioteki i narzędzia
│   ├── firebase/           # Konfiguracja Firebase
│   ├── hooks/              # Hooki React
│   └── types/              # Typy TypeScript
├── public/                 # Statyczne pliki
└── ...
```

## Licencja

Ten projekt jest własnością 21Network i jest objęty prawami autorskimi. Nieautoryzowane kopiowanie, modyfikowanie lub rozpowszechnianie jest zabronione.
