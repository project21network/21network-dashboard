# Instrukcja tworzenia indeksów w Firebase

Aby aplikacja działała poprawnie, konieczne jest utworzenie odpowiednich indeksów w Firebase Firestore. Poniżej znajdują się linki do utworzenia wymaganych indeksów.

## Wymagane indeksy

Kliknij poniższe linki, aby utworzyć indeksy:

1. Indeks dla kolekcji `surveys`:
   - [Utwórz indeks dla surveys (isActive, createdAt, __name__)](https://console.firebase.google.com/v1/r/project/network-9747b/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9uZXR3b3JrLTk3NDdiL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9zdXJ2ZXlzL2luZGV4ZXMvXxABGgwKCGlzQWN0aXZlEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg)

2. Indeks dla kolekcji `orders`:
   - [Utwórz indeks dla orders (userId, createdAt, __name__)](https://console.firebase.google.com/v1/r/project/network-9747b/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9uZXR3b3JrLTk3NDdiL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9vcmRlcnMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg)

3. Indeks dla kolekcji `seoFormSubmissions`:
   - [Utwórz indeks dla seoFormSubmissions (email, createdAt, __name__)](https://console.firebase.google.com/v1/r/project/network-9747b/firestore/indexes?create_composite=Clhwcm9qZWN0cy9uZXR3b3JrLTk3NDdiL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9zZW9Gb3JtU3VibWlzc2lvbnMvaW5kZXhlcy9fEAEaCQoFZW1haWwQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC)
   - [Utwórz indeks dla seoFormSubmissions (email, name, __name__)](https://console.firebase.google.com/v1/r/project/network-9747b/firestore/indexes?create_composite=ClRwcm9qZWN0cy9uZXR3b3JrLTk3NDdiL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9zZW9Gb3JtU3VibWlzc2lvbnMvaW5kZXhlcy9fEAEaCQoFZW1haWwQARoICgRuYW1lEAEaDAoIX19uYW1lX18QAQ)

4. Indeks dla kolekcji `formSubmissions`:
   - [Utwórz indeks dla formSubmissions (email, createdAt, __name__)](https://console.firebase.google.com/v1/r/project/network-9747b/firestore/indexes?create_composite=ClVwcm9qZWN0cy9uZXR3b3JrLTk3NDdiL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9mb3JtU3VibWlzc2lvbnMvaW5kZXhlcy9fEAEaCQoFZW1haWwQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC)
   - [Utwórz indeks dla formSubmissions (email, name, __name__)](https://console.firebase.google.com/v1/r/project/network-9747b/firestore/indexes?create_composite=ClFwcm9qZWN0cy9uZXR3b3JrLTk3NDdiL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9mb3JtU3VibWlzc2lvbnMvaW5kZXhlcy9fEAEaCQoFZW1haWwQARoICgRuYW1lEAEaDAoIX19uYW1lX18QAQ)

## Jak utworzyć indeks?

1. Kliknij link do indeksu, który chcesz utworzyć.
2. Zostaniesz przekierowany do konsoli Firebase.
3. Zaloguj się do swojego konta Firebase, jeśli nie jesteś jeszcze zalogowany.
4. Kliknij przycisk "Utwórz indeks" lub "Create index".
5. Poczekaj, aż indeks zostanie utworzony. Może to zająć kilka minut.

## Dlaczego indeksy są potrzebne?

Indeksy są wymagane przez Firebase Firestore, gdy wykonujesz zapytania z wieloma warunkami lub sortowaniem. Bez odpowiednich indeksów, zapytania będą zwracać błędy.

W naszej aplikacji używamy indeksów do:
- Pobierania ankiet SEO dla zalogowanego użytkownika, posortowanych według daty utworzenia
- Pobierania formularzy stron dla zalogowanego użytkownika, posortowanych według daty utworzenia
- Pobierania zamówień dla zalogowanego użytkownika, posortowanych według daty utworzenia
- Pobierania aktywnych ankiet, posortowanych według daty utworzenia
- Wyszukiwania istniejących ankiet po emailu i nazwie (do nadpisywania) 