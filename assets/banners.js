/*
  Konfiguracja banerów na stronie głównej — 4 miejsca (bez logo, same banery reklamowe/promo).

  Żeby DODAĆ obrazek banera:
  1. Wgraj plik graficzny do folderu assets/banners/ (np. assets/banners/promo1.jpg).
  2. Wpisz jego ścieżkę w polu "image" poniżej, np. image: 'assets/banners/promo1.jpg'.
  3. (opcjonalnie) w polu "link" wpisz adres, na który baner ma przenosić po kliknięciu
     — np. 'produkty.html' albo pełny link 'https://discord.gg/...'. Zostaw null, jeśli
     baner nie ma być klikalny.

  Dopóki pole "image" jest puste (null), w tym miejscu pokazuje się szary placeholder
  z podpisem z pola "label" — więc możesz spokojnie wgrać stronę już teraz i podmienić
  obrazki później, jeden po drugim.

  Zalecany format grafiki: szeroki prostokąt (np. 600×250px), żeby dobrze wyglądał
  zarówno w siatce 2×2, jak i w jednej kolumnie na telefonie.
*/

const AV_BANNERS = [
  { image: null, link: null, label: 'Miejsce na baner 1' },
  { image: null, link: null, label: 'Miejsce na baner 2' },
  { image: null, link: null, label: 'Miejsce na baner 3' },
  { image: null, link: null, label: 'Miejsce na baner 4' },
];

function av_renderBanners() {
  const container = document.getElementById('bannersGrid');
  if (!container) return;

  container.innerHTML = AV_BANNERS.map((b) => {
    const inner = b.image
      ? `<img src="${b.image}" alt="${b.label}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`
      : b.label;
    if (b.link) {
      return `<a href="${b.link}" class="banner-slot" style="${b.image ? 'padding:0;' : ''}">${inner}</a>`;
    }
    return `<div class="banner-slot" style="${b.image ? 'padding:0;' : ''}">${inner}</div>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', av_renderBanners);
