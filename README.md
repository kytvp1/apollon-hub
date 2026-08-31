# Apollon Hub API — strona internetowa

Statyczna strona (czysty HTML/CSS/JS, bez frameworków) gotowa do wrzucenia na GitHub Pages.

## Struktura

```
index.html        - strona główna
produkty.html      - lista produktów (modele/skrypty Roblox)
licencje.html       - "Moje licencje" (aktywacja kluczy, demo w localStorage)
konto.html          - łączenie konta Discord (prawdziwe OAuth2, po stronie klienta)
regulamin.html       - regulamin (treść przykładowa - podmień na własną)
discord.html         - strona społeczności / zaproszenie na serwer
assets/style.css    - wspólny motyw (kolory, layout)
assets/include.js    - wczytuje wspólny nagłówek/stopkę z partials/
assets/discord-auth.js - logowanie przez Discord OAuth2 (Implicit Grant)
assets/licenses.js    - obsługa formularza i listy licencji (demo, localStorage)
assets/banner.png    - Twoje logo/baner
partials/header.html  - wspólna nawigacja (edytuj tylko tutaj, żeby zmienić menu)
partials/footer.html  - wspólna stopka
```

## Uruchomienie lokalnie (do podglądu przed publikacją)

Strona używa `fetch()` do wczytania wspólnego nagłówka/stopki, więc **nie zadziała**
po prostym dwukrotnym kliknięciu pliku `index.html` (przeglądarki blokują `fetch`
dla plików otwartych z dysku, `file://`). Uruchom lokalny serwer w folderze strony:

```
python -m http.server 8000
```

i wejdź na `http://localhost:8000/index.html`.

## Wdrożenie na GitHub Pages

1. Utwórz nowe repozytorium na GitHub (np. `apollon-hub`).
2. Wgraj do niego całą zawartość tego folderu (wszystkie pliki i podfoldery).
3. Wejdź w **Settings → Pages** w repozytorium.
4. W sekcji "Build and deployment" wybierz **Deploy from a branch**, branch `main`, folder `/ (root)`.
5. Zapisz — po chwili strona będzie dostępna pod adresem:
   `https://TWOJANAZWA.github.io/apollon-hub/`

## Konfiguracja logowania przez Discord (konto.html)

Łączenie konta Discord działa naprawdę (prawdziwe OAuth2), ale wymaga jednorazowej
konfiguracji z Twojej strony:

1. Wejdź na https://discord.com/developers/applications i utwórz nową aplikację.
2. W zakładce **OAuth2** skopiuj **Client ID**.
3. Tam samo w polu **Redirects** dodaj dokładny adres strony `konto.html` po
   publikacji, np.: `https://twojanazwa.github.io/apollon-hub/konto.html`
4. Otwórz plik `assets/discord-auth.js` i wpisz swój Client ID w linii:
   ```js
   const AV_DISCORD_CLIENT_ID = 'WPISZ_TU_SWOJE_CLIENT_ID';
   ```
5. Wgraj zmieniony plik z powrotem na GitHub — logowanie zacznie działać.

Logowanie działa w 100% po stronie przeglądarki (OAuth2 Implicit Grant) — nie
potrzeba żadnego backendu ani serwera. Pobierane są tylko: nazwa użytkownika,
ID Discord i awatar (zakres `identify`) — żadnych haseł.

## Ważne ograniczenie: licencje to na razie demo

Strona `licencje.html` pozwala "dodać" licencję i pokazuje ją w tabeli, ale
wszystko dzieje się lokalnie w przeglądarce użytkownika (`localStorage`) —
**nie ma prawdziwej bazy danych**, więc:

- każdy może wpisać dowolny klucz w poprawnym formacie i zobaczy go jako "aktywny",
- dane nie są nigdzie zapisywane poza jedną przeglądarką (zniknie po wyczyszczeniu danych),
- Twój bot Discord nie ma jak się dowiedzieć, że ktoś "aktywował" licencję.

Żeby to było prawdziwe, potrzebny jest mały backend, np.:
- darmowa baza danych (Supabase / Firebase) + kilka linii kodu w `licenses.js`, albo
- Twój bot Discord jako backend (slash-komenda `/aktywuj`, zapisująca licencję
  do bazy, którą ta strona później tylko odczytuje przez proste API).

Miejsce do podpięcia prawdziwej walidacji jest jasno oznaczone w
`assets/licenses.js` (funkcja `AV_VALIDATE_KEY`).

## Podmień na własne

- `assets/banner.png` — Twoje logo (obecnie użyty przesłany baner)
- Link zaproszenia na Discord w `discord.html`
- Treść `regulamin.html` — to jest przykład, nie prawdziwy dokument prawny
- Ceny i opisy produktów w `produkty.html`
