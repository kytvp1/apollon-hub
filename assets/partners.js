/*
  Konfiguracja logotypów partnerów na stronie głównej ("Oficjalni partnerzy").

  Żeby DODAĆ logo partnera:
  1. Wgraj plik graficzny do folderu assets/partners/ (np. assets/partners/nazwa.png).
  2. Wpisz jego ścieżkę w polu "image" poniżej, np. image: 'assets/partners/nazwa.png'.
  3. (opcjonalnie) w polu "link" wpisz adres strony/Discorda partnera — logo stanie się
     klikalne. Zostaw null, jeśli nie ma być klikalne.

  Dopóki pole "image" jest puste (null), w tym miejscu pokazuje się szary placeholder
  z podpisem z pola "label".

  Żeby dodać/usunąć miejsce na kolejne logo — skopiuj/usuń cały wiersz { ... } poniżej.

  Zalecany format grafiki: logo na przezroczystym tle (PNG/SVG), najlepiej w poziomie.
*/

const AV_PARTNERS = [
  { image: null, link: null, label: 'Miejsce na logo' },
  { image: null, link: null, label: 'Miejsce na logo' },
  { image: null, link: null, label: 'Miejsce na logo' },
  { image: null, link: null, label: 'Miejsce na logo' },
];

function av_renderPartners() {
  const container = document.getElementById('partnersGrid');
  if (!container) return;

  container.innerHTML = AV_PARTNERS.map((p) => {
    const inner = p.image
      ? `<img src="${p.image}" alt="${p.label}">`
      : p.label;
    if (p.link) {
      return `<a href="${p.link}" class="partner-slot">${inner}</a>`;
    }
    return `<div class="partner-slot">${inner}</div>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', av_renderPartners);
