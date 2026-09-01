/*
  Konfiguracja produktów w sklepie (produkty.html).

  Żeby DODAĆ produkt: skopiuj cały blok { ... } (razem z przecinkiem na końcu)
  i wklej go w tablicy poniżej, potem zmień wartości.

  Żeby USUNĄĆ produkt: usuń cały jego blok { ... }.

  Pola:
    title  — nazwa produktu
    desc   — krótki opis (1-2 zdania)
    price  — cena jako tekst, np. '49,99 zł'
    badge  — etykieta w prawym dolnym rogu karty, np. 'Model', 'Skrypt', 'Bot'

  Zmiana pojawi się na stronie od razu po wgraniu pliku — nie trzeba nic innego edytować.
*/

const AV_PRODUCTS = [
  {
    title: 'Mapa Miasta — City Map',
    desc: 'Rozbudowana, szczegółowa mapa miejska gotowa pod roleplay i eksplorację.',
    price: '49,99 zł',
    badge: 'Model',
  },
  {
    title: 'Post-Apo Survival Map',
    desc: 'Klimatyczna mapa survivalowa z systemem questów i strefami zagrożenia.',
    price: '89,99 zł',
    badge: 'Model',
  },
  {
    title: 'SCP Foundation — Scripted',
    desc: 'Kompletna mapa placówki SCP wraz z systemem zdarzeń i skryptami.',
    price: '99,99 zł',
    badge: 'Skrypt + Model',
  },
  {
    title: 'Terminal Policyjny — Skrypt',
    desc: 'System terminala mobilnego dla graczy patrolowych: statusy, dyspozycje, mapa.',
    price: '69,99 zł',
    badge: 'Skrypt',
  },
  {
    title: 'System Szatni Strażackiej',
    desc: 'Szafka i system przebierania z modelami umundurowania oraz rangami.',
    price: '59,99 zł',
    badge: 'Skrypt + Model',
  },
  {
    title: 'Bot Discord — Status Serwera',
    desc: 'Bot pokazujący status Twojego serwera Roblox na żywo na kanale Discord.',
    price: '39,99 zł',
    badge: 'Bot',
  },
];

function av_renderProducts() {
  const container = document.getElementById('productsGrid');
  if (!container) return;
  container.innerHTML = AV_PRODUCTS.map((p) => `
    <div class="card">
      <div class="card-media">Podgląd</div>
      <div class="card-body">
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <div class="card-footer">
          <span class="price">${p.price}</span>
          <span class="badge info">${p.badge}</span>
        </div>
      </div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', av_renderProducts);
