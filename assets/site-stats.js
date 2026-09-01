/*
  Statystyki na stronie głównej ("Apollon Hub w liczbach").

  1) "Aktywnych na Discordzie" — AKTUALIZUJE SIĘ SAMA. Pobiera liczbę osób online
     z tego samego widżetu Discord, co strona "Status botów" (patrz AV_GUILD_ID
     w pliku assets/bot-status.js — musi być wypełnione i widżet musi być włączony
     w ustawieniach serwera). Jeśli widżet jest wyłączony/niedostępny, pokazuje się
     wartość zapasowa z pola "activeFallback" poniżej.

  2) Pozostałe liczby (sprzedane licencje, liczba produktów) NIE aktualizują się
     same — Discord ani bot nie udostępniają takiej statystyki publicznie. Żeby
     je zmienić, po prostu wpisz nową wartość w cudzysłowie poniżej i zapisz plik,
     np. licensesSold: '620+'. Zmiana pojawi się na stronie od razu po wgraniu pliku.
*/

const AV_STATS = {
  activeFallback: '150+', // pokazywane tylko gdy widżet Discord jest wyłączony/nieskonfigurowany
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

  const widget = await av_fetchGuildWidget();
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
