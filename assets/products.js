/*
  Konfiguracja produktów w sklepie (produkty.html).

  Żeby DODAĆ produkt: skopiuj cały blok { ... } (razem z przecinkiem na końcu)
  i wklej go w tablicy poniżej, potem zmień wartości.

  Żeby USUNĄĆ produkt: usuń cały jego blok { ... }.

  Pola:
    title  — nazwa produktu
    desc   — krótki opis (1-2 zdania)
    price  — cena jako tekst, np. '49,99 zł'
    badge  — kategoria produktu. To JEDNO pole robi dwie rzeczy naraz: pokazuje się jako
             etykieta w prawym dolnym rogu karty ORAZ decyduje, przy którym przycisku
             filtra (nad listą produktów) produkt się pojawi. Musi być dokładnie jedną
             z wartości z listy AV_PRODUCT_CATEGORIES poniżej, np. 'Systemy'.
    image  — grafika produktu (opcjonalnie). Żeby DODAĆ grafikę:
             1. Wgraj plik graficzny do folderu assets/products/ (np. assets/products/produkt-1.png).
             2. Wpisz jego ścieżkę tutaj, np. image: 'assets/products/produkt-1.png'.
             Dopóki image jest null, karta pokazuje szary placeholder "Podgląd".
             Zalecany format: JPG/PNG/WebP, w miarę poziomy kadr (karta przycina na środku).

  Zmiana pojawi się na stronie od razu po wgraniu pliku — nie trzeba nic innego edytować.
*/

// Dostępne kategorie (= wartości pola "badge" powyżej). Przycisk "Wszystkie" dodaje się
// sam, na początku listy filtrów. Żeby dodać nową kategorię - dopisz ją tutaj i użyj
// dokładnie tej samej wartości w polu badge dowolnego produktu.
const AV_PRODUCT_CATEGORIES = ['Systemy', 'Ubrania', 'Assety', 'Pojazdy', 'Budynki'];

const AV_PRODUCTS = [
  {
    title: 'Produkt 1',
    desc: 'Opis produktu 1 — podmień na własny.',
    price: '49,99 zł',
    badge: 'Systemy',
    image: null,
  },
  {
    title: 'Produkt 2',
    desc: 'Opis produktu 2 — podmień na własny.',
    price: '89,99 zł',
    badge: 'Pojazdy',
    image: null,
  },
  {
    title: 'Produkt 3',
    desc: 'Opis produktu 3 — podmień na własny.',
    price: '99,99 zł',
    badge: 'Budynki',
    image: null,
  },
  {
    title: 'Produkt 4',
    desc: 'Opis produktu 4 — podmień na własny.',
    price: '69,99 zł',
    badge: 'Assety',
    image: null,
  },
  {
    title: 'Produkt 5',
    desc: 'Opis produktu 5 — podmień na własny.',
    price: '59,99 zł',
    badge: 'Ubrania',
    image: null,
  },
  {
    title: 'Produkt 6',
    desc: 'Opis produktu 6 — podmień na własny.',
    price: '39,99 zł',
    badge: 'Systemy',
    image: null,
  },
];

let av_activeCategory = 'Wszystkie';

function av_renderProductCards(products) {
  const container = document.getElementById('productsGrid');
  if (!container) return;
  container.innerHTML = products.map((p) => `
    <div class="card">
      <div class="card-media">${p.image ? `<img src="${p.image}" alt="${p.title}">` : 'Podgląd'}</div>
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

function av_applyProductFilter() {
  const filtered = av_activeCategory === 'Wszystkie'
    ? AV_PRODUCTS
    : AV_PRODUCTS.filter((p) => p.badge === av_activeCategory);
  av_renderProductCards(filtered);

  document.querySelectorAll('#productsFilters .filter-pill').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.category === av_activeCategory);
  });
}

function av_renderProductFilters() {
  const bar = document.getElementById('productsFilters');
  if (!bar) return;

  // Pokazuj tylko kategorie faktycznie użyte przez jakiś produkt - żeby nie było
  // pustego przycisku filtra, gdy akurat żaden produkt danej kategorii nie istnieje.
  const usedCategories = new Set(AV_PRODUCTS.map((p) => p.badge));
  const pills = ['Wszystkie', ...AV_PRODUCT_CATEGORIES.filter((c) => usedCategories.has(c))];

  bar.innerHTML = pills.map((c) => `
    <button type="button" class="filter-pill${c === av_activeCategory ? ' active' : ''}" data-category="${c}">${c}</button>
  `).join('');

  bar.querySelectorAll('.filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      av_activeCategory = btn.dataset.category;
      av_applyProductFilter();
    });
  });
}

function av_renderProducts() {
  if (!document.getElementById('productsGrid')) return;
  av_renderProductFilters();
  av_applyProductFilter();
}

document.addEventListener('DOMContentLoaded', av_renderProducts);
