/*
  Konfiguracja wydarzeń na zakładce "Wydarzenia" (wydarzenia.html).

  Obecna zawartość to pomysły na tydzień z okazji 3. urodzin Apollon Hub —
  podmień treści (i daty/kody) na te, które faktycznie organizujesz.

  Żeby DODAĆ wydarzenie: skopiuj cały blok { ... } (razem z przecinkiem na końcu)
  i wklej go w tablicy poniżej, potem zmień wartości.

  Żeby USUNĄĆ wydarzenie: usuń cały jego blok { ... }.

  Pola:
    title    — nazwa wydarzenia
    desc     — krótki opis, co się dzieje / jak wziąć udział
    period   — kiedy trwa, np. '1-7 września' albo 'Cały tydzień'
    badge    — etykieta w prawym dolnym rogu karty, np. 'Konkurs', 'Rabat', 'Na żywo'
    featured — true/false (opcjonalne) — true = karta wyróżniona kolorową ramką,
               dla najważniejszego / flagowego wydarzenia

  Zmiana pojawi się na stronie od razu po wgraniu pliku — nie trzeba nic innego edytować.
*/

const AV_EVENTS = [
  {
    title: 'Koło Fortuny — wygraj do -40%',
    desc: 'Zakręć raz kołem fortuny na stronie głównej i sprawdź, jaki kod rabatowy wylosujesz. Jedna szansa na przeglądarkę — wygrany kod trafia od razu do sekcji "Twoje kody rabatowe" powyżej.',
    period: '1–7 września',
    badge: 'Flagowe wydarzenie',
    featured: true,
  },
  {
    title: 'Loteria urodzinowa',
    desc: 'Co drugi dzień losujemy jedną osobę z serwera Discord, która otrzymuje dowolną licencję za darmo. Wystarczy być na serwerze w dniu losowania.',
    period: '1–7 września',
    badge: 'Konkurs',
  },
  {
    title: 'Kod -30% na wszystko',
    desc: 'Użyj kodu URODZINY3 przy zamawianiu, żeby otrzymać 30% zniżki na dowolny produkt z oferty.',
    period: '1–7 września',
    badge: 'Rabat',
  },
  {
    title: 'Pokaż swoją grę',
    desc: 'Wrzuć na Discordzie zrzut ekranu lub klip z gry zbudowanej przy użyciu modeli albo skryptów Apollon Hub. Najciekawsze zgłoszenie wygrywa dowolny produkt za darmo i zostaje wyróżnione na serwerze.',
    period: 'Zgłoszenia do 6 września',
    badge: 'Konkurs twórczy',
  },
  {
    title: 'Podziękowania dla stałych klientów',
    desc: 'Osoby z aktywną licencją sprzed ponad roku otrzymają specjalną rolę na Discordzie i niespodziankę od zespołu.',
    period: 'Cały tydzień',
    badge: 'Niespodzianka',
  },
  {
    title: 'Podsumowanie 3 lat',
    desc: 'Krótka retrospektywa na Discordzie — co udało się zbudować w ciągu 3 lat i co planujemy dalej.',
    period: 'Ostatni dzień tygodnia',
    badge: 'Ogłoszenie',
  },
];

function av_renderEvents() {
  const container = document.getElementById('eventsGrid');
  if (!container) return;
  container.innerHTML = AV_EVENTS.map((e) => `
    <div class="card${e.featured ? ' card-featured' : ''}">
      <div class="card-media">${e.period}</div>
      <div class="card-body">
        <h3>${e.title}</h3>
        <p>${e.desc}</p>
        <div class="card-footer">
          <span class="badge info">${e.badge}</span>
        </div>
      </div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', av_renderEvents);
