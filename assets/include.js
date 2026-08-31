// Wczytuje wspólny nagłówek i stopkę do każdej podstrony (partials/header.html, partials/footer.html)
// Uwaga: to działa po wrzuceniu na hosting (GitHub Pages itp.) lub lokalny serwer.
// Przy otwarciu pliku bezpośrednio z dysku (file://) przeglądarka może zablokować fetch() —
// wtedy uruchom lokalny serwer, np.: python -m http.server

async function av_includePartials() {
  const headerSlot = document.getElementById('site-header-slot');
  const footerSlot = document.getElementById('site-footer-slot');

  try {
    if (headerSlot) {
      const res = await fetch('partials/header.html');
      headerSlot.innerHTML = await res.text();
    }
    if (footerSlot) {
      const res2 = await fetch('partials/footer.html');
      footerSlot.innerHTML = await res2.text();
    }
  } catch (e) {
    console.warn('Nie udało się wczytać wspólnych fragmentów strony (header/footer).', e);
  }

  av_afterIncludeReady();
}

function av_afterIncludeReady() {
  // Podświetlenie aktywnej pozycji w nawigacji na podstawie data-page na <body>
  const current = document.body.getAttribute('data-page');
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('data-nav') === current) a.classList.add('active');
  });

  // Rozwijanie menu mobilnego
  const burger = document.getElementById('burgerBtn');
  const links = document.getElementById('navLinks');
  if (burger && links) {
    burger.addEventListener('click', () => {
      const open = links.style.display === 'flex';
      links.style.display = open ? 'none' : 'flex';
      links.style.flexDirection = 'column';
      links.style.position = 'absolute';
      links.style.top = '64px';
      links.style.left = '0';
      links.style.right = '0';
      links.style.background = '#0b1220';
      links.style.padding = '10px 24px 18px';
      links.style.borderBottom = '1px solid #1e2b47';
    });
  }

  // Rok w stopce
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Odśwież stan "połączono z Discord" wszędzie tam gdzie jest widoczny w navbarze
  av_reflectDiscordConnection();
}

// ===== Wspólne dane o powiązanym koncie Discord (localStorage, po stronie klienta) =====

const AV_STORAGE_KEY = 'apollonhub_discord_user';

function av_getDiscordUser() {
  try {
    const raw = localStorage.getItem(AV_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function av_setDiscordUser(user) {
  localStorage.setItem(AV_STORAGE_KEY, JSON.stringify(user));
}

function av_clearDiscordUser() {
  localStorage.removeItem(AV_STORAGE_KEY);
}

function av_reflectDiscordConnection() {
  const user = av_getDiscordUser();
  const ctaBtn = document.querySelector('.nav-cta .btn-discord');
  if (ctaBtn && user) {
    ctaBtn.textContent = '@' + user.username;
    ctaBtn.href = 'konto.html';
  }
}

document.addEventListener('DOMContentLoaded', av_includePartials);
