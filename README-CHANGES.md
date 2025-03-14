# Zmiany w aplikacji

## 1. Nadpisywanie ankiet

Dodano funkcjonalność nadpisywania istniejących ankiet, gdy użytkownik wypełni formularz z tym samym adresem email i nazwą. Dzięki temu:

- Jeśli klient wypełni ankietę z tymi samymi danymi (email i nazwa), stara ankieta zostanie zaktualizowana zamiast tworzenia nowej
- Zachowana zostanie historia zmian dzięki dodaniu pola `updatedAt`
- Zmniejszy się liczba duplikatów w bazie danych

### Nowe funkcje pomocnicze

Utworzono plik `lib/firebase/form-helpers.ts` zawierający dwie główne funkcje:

- `saveFormSubmission` - zapisuje ankietę WWW, sprawdzając czy istnieje już ankieta o podanym emailu i nazwie
- `saveSeoFormSubmission` - zapisuje ankietę SEO, sprawdzając czy istnieje już ankieta o podanym emailu i nazwie

Obie funkcje działają podobnie:
1. Sprawdzają, czy istnieje już ankieta o podanym emailu i nazwie
2. Jeśli tak, aktualizują istniejący dokument
3. Jeśli nie, tworzą nowy dokument
4. W obu przypadkach dodają pola `createdAt` i `updatedAt`

## 2. Wyświetlanie ankiet w zakładce "Wszystkie"

Zmodyfikowano stronę zamówień klienta (`app/dashboard/client/orders/page.tsx`), aby wyświetlała ankiety w zakładce "Wszystkie":

- W zakładce "Wszystkie" wyświetlane są teraz:
  - Zamówienia klienta
  - Ankiety SEO klienta
  - Ankiety WWW klienta
- Każdy typ elementu ma własną sekcję z nagłówkiem
- Zachowano możliwość filtrowania zamówień według statusu w pozostałych zakładkach
- Dodano odpowiednie komunikaty, gdy nie ma żadnych danych do wyświetlenia

## 3. Nowe indeksy Firebase

Dodano nowe indeksy w Firebase Firestore, które są wymagane do prawidłowego działania nowych funkcji:

- Indeks dla kolekcji `seoFormSubmissions` (email, name, __name__)
- Indeks dla kolekcji `formSubmissions` (email, name, __name__)

Indeksy te są niezbędne do wyszukiwania istniejących ankiet po emailu i nazwie w celu ich nadpisywania.

## Zarządzanie statusem ankiet przez administratora

Dodano możliwość zmiany statusu ankiet przez administratora. Funkcjonalność ta pozwala na:

1. **Zmianę statusu ankiet WWW i SEO** - Administrator może zmienić status ankiety na:
   - "Nowe" (new)
   - "W trakcie" (processing)
   - "Zakończone" (completed)

2. **Interfejs zmiany statusu** - Dodano:
   - Dropdown menu do zmiany statusu w tabeli ankiet
   - Możliwość zmiany statusu w widoku szczegółów ankiety
   - Wizualne oznaczenie statusu za pomocą kolorowych etykiet

3. **Wyświetlanie statusu** - Status ankiety jest teraz widoczny w:
   - Tabeli ankiet jako kolorowa etykieta
   - Nagłówku szczegółów ankiety
   - Sekcji "Dane podstawowe" w szczegółach ankiety
   - Przycisku dropdown do zmiany statusu

4. **Aktualizacja w czasie rzeczywistym** - Po zmianie statusu:
   - Lista ankiet jest automatycznie odświeżana
   - Jeśli otwarty jest widok szczegółów, dane są również aktualizowane
   - Użytkownik otrzymuje powiadomienie o pomyślnej zmianie statusu

5. **Funkcje pomocnicze**:
   - `updateFormSubmissionStatus` - Aktualizuje status ankiety WWW
   - `updateSeoSubmissionStatus` - Aktualizuje status ankiety SEO
   - Obie funkcje zapisują również datę aktualizacji w polu `updatedAt`

6. **Poprawki w pobieraniu danych**:
   - Zaktualizowano hooki `useSeoSubmissions` i `useFormSubmissions`, aby poprawnie pobierały pole `status` z bazy danych
   - Dodano domyślną wartość "new" dla ankiet, które nie mają jeszcze ustawionego statusu
   - Dodano pobieranie pola `updatedAt` dla śledzenia historii zmian

Ta funkcjonalność umożliwia administratorom efektywne zarządzanie procesem obsługi ankiet i informowanie klientów o postępie prac.

## Strona "Stwórz zamówienie" w panelu klienta

Dodano nową stronę "Stwórz zamówienie" w panelu klienta, która umożliwia użytkownikom wybór rodzaju usługi i przekierowanie do odpowiedniej ankiety:

1. **Interfejs z kaflami wyboru** - Strona zawiera dwa atrakcyjne wizualnie kafle:
   - Strona internetowa - przekierowuje do ankiety WWW (https://ankieta.21network.io/step/1)
   - Pozycjonowanie SEO - przekierowuje do ankiety SEO (https://ankieta.21network.io/seo)

2. **Funkcje i korzyści**:
   - Intuicyjny interfejs z animacjami przy najechaniu myszką
   - Opis korzyści dla każdego rodzaju usługi
   - Instrukcja "Jak to działa?" wyjaśniająca proces zamawiania
   - Otwieranie ankiet w nowej karcie przeglądarki

3. **Nawigacja**:
   - Dodano nową pozycję "Stwórz zamówienie" w menu bocznym panelu klienta
   - Zmieniono nazwę istniejącej pozycji z "Stwórz zamówienie" na "Ankiety"

Ta funkcjonalność ułatwia klientom zamawianie nowych usług poprzez intuicyjny interfejs i jasny proces.

## Zarządzanie użytkownikami i ustawienia profilu

Dodano nowe funkcje zarządzania użytkownikami w panelu administratora oraz stronę ustawień w panelu klienta:

1. **Panel administratora - zarządzanie klientami**:
   - Dodano możliwość edycji danych klientów (imię i nazwisko, firma, telefon)
   - Dodano możliwość usuwania klientów z systemu
   - Ulepszono interfejs zarządzania klientami z menu kontekstowym dla każdego klienta

2. **Panel klienta - ustawienia profilu**:
   - Dodano nową stronę "Ustawienia" dostępną z menu bocznego
   - Klienci mogą edytować swoje dane (imię i nazwisko, firma, telefon)
   - Dodano zakładkę "Konto" z informacjami o zmianie hasła i kontakcie z administracją
   - Interfejs jest responsywny i przyjazny dla użytkownika

3. **Nowe funkcje pomocnicze**:
   - Utworzono hook `useUserProfile` do zarządzania profilem użytkownika
   - Rozszerzono hook `useClients` o funkcje usuwania klientów
   - Dodano obsługę błędów i powiadomienia o statusie operacji

Te funkcje umożliwiają lepsze zarządzanie użytkownikami w systemie oraz dają klientom możliwość aktualizacji swoich danych bez konieczności kontaktu z administracją.

## Jak korzystać z nowych funkcji

### Nadpisywanie ankiet

Aby skorzystać z funkcji nadpisywania ankiet, należy użyć nowych funkcji pomocniczych zamiast bezpośredniego dodawania dokumentów do kolekcji:

```typescript
import { saveFormSubmission, saveSeoFormSubmission } from "@/lib/firebase/form-helpers";

// Zapisywanie ankiety WWW
const formData = {
  name: "Nazwa projektu",
  email: "klient@example.com",
  // pozostałe pola formularza
};
const formId = await saveFormSubmission(formData);

// Zapisywanie ankiety SEO
const seoFormData = {
  name: "Nazwa projektu SEO",
  email: "klient@example.com",
  // pozostałe pola formularza SEO
};
const seoFormId = await saveSeoFormSubmission(seoFormData);
```

### Indeksy Firebase

Aby utworzyć wymagane indeksy, należy:

1. Otworzyć plik `FIREBASE_INDEXES.md`
2. Kliknąć linki do utworzenia indeksów
3. Zalogować się do konsoli Firebase
4. Kliknąć przycisk "Utwórz indeks" lub "Create index" 