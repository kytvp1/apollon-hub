/*
  Statystyki na stronie głównej ("Apollon Hub w liczbach").

  1) "Aktywnych na Discordzie" — AKTUALIZUJE SIĘ SAMA. Pobiera liczbę osób online
     z widżetu GŁÓWNEGO serwera społeczności (tego z zaproszenia na stronie
     "Discord", NIE serwera, na którym stoją boty) — jego ID wpisujesz poniżej
     w AV_COMMUNITY_GUILD_ID. Widżet musi być włączony w ustawieniach tego serwera
     (Ustawienia serwera → Widżet). Jeśli widżet jest wyłączony/niedostępny,
     pokazuje się wartość zapasowa z pola "activeFallback" poniżej.

  2) Pozostałe liczby (sprzedane licencje, liczba produktów) NIE aktualizują się
     same — Discord ani bot nie udostępniają takiej statystyki publicznie. Żeby
     je zmienić, po prostu wpisz nową wartość w cudzysłowie poniżej i zapisz plik,
     np. licensesSold: '620+'. Zmiana pojawi się na stronie od razu po wgraniu pliku.
*/

const AV_COMMUNITY_GUILD_ID = '1137772207733493790'; // serwer społeczności (z zaproszenia), nie serwer botów

const AV_STATS = {
  activeFallback: '505+', // pokazywane tylko gdy widżet Discord jest wyłączony/nieosiągalny — zaktualizuj ręcznie w razie potrzeby
  licensesSold: '500+',   // <-- zmień ręcznie, gdy sprzedasz więcej licencji
  products: '6+',         // <-- zmień ręcznie, gdy dodasz/usuniesz produkty
};

async function av_initHomeStats() {
  const elActive = document.getElementById('statActiveMembers');
  const elLicenses = document.getElementById('statLicensesSold');
  const elProducts = document.getElementById('statProducts');

  if (elLicenses) elLicenses.textContent = AV_STATS.licensesSold;
  if (elProducts) elProducts.textContent = AV_STATS.products;

  if (!elActive) return;

  if (typeof av_fetchGuildWidget !== 'function') {
    elActive.textContent = AV_STATS.activeFallback;
    return;
  }

  const widget = await av_fetchGuildWidget(AV_COMMUNITY_GUILD_ID);
  if (widget && typeof widget.presence_count === 'number') {
    elActive.textContent = String(widget.presence_count);
  } else {
    elActive.textContent = AV_STATS.activeFallback;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  av_initHomeStats();
  setInterval(av_initHomeStats, 60000);
});
