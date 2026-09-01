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
    title: 'Produkt 1',
    desc: 'Opis produktu 1 — podmień na własny.',
    price: '49,99 zł',
    badge: 'Model',
  },
  {
    title: 'Produkt 2',
    desc: 'Opis produktu 2 — podmień na własny.',
    price: '89,99 zł',
    badge: 'Model',
  },
  {
    title: 'Produkt 3',
    desc: 'Opis produktu 3 — podmień na własny.',
    price: '99,99 zł',
    badge: 'Skrypt + Model',
  },
  {
    title: 'Produkt 4',
    desc: 'Opis produktu 4 — podmień na własny.',
    price: '69,99 zł',
    badge: 'Skrypt',
  },
  {
    title: 'Produkt 5',
    desc: 'Opis produktu 5 — podmień na własny.',
    price: '59,99 zł',
    badge: 'Skrypt + Model',
  },
  {
    title: 'Produkt 6',
    desc: 'Opis produktu 6 — podmień na własny.',
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
