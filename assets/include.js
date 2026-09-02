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
      links.style.background = '#09090b';
      links.style.padding = '10px 24px 18px';
      links.style.borderBottom = '1px solid #232327';
    });
  }

  // Rok w stopce
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Odśwież stan "połączono z Discord" wszędzie tam gdzie jest widoczny w navbarze
  av_reflectDiscordConnection();

  // Baner o plikach cookie / localStorage (niezbędne, techniczne)
  av_initCookieBanner();

  // Konfetti na przycisku "3 Urodziny" w nawigacji
  av_initNavHighlightConfetti();
}

// ===== Konfetti na przycisku nawigacji (.nav-highlight, np. "3 Urodziny") =====

function av_initNavHighlightConfetti() {
  const AV_CONFETTI_COLORS = ['#ffd166', '#ff6b8b', '#5b8bf0', '#3ddc97', '#c77dff', '#ffffff'];

  document.querySelectorAll('.nav-highlight').forEach((btn) => {
    if (btn.querySelector('.nav-confetti')) return; // już dodane

    const wrap = document.createElement('span');
    wrap.className = 'nav-confetti';
    wrap.setAttribute('aria-hidden', 'true');

    const pieceCount = 9;
    for (let i = 0; i < pieceCount; i++) {
      const piece = document.createElement('i');
      piece.className = 'nav-confetti-piece';
      const left = Math.round(Math.random() * 100);
      const delay = (Math.random() * 2.4).toFixed(2);
      const duration = (1.8 + Math.random() * 1.4).toFixed(2);
      const color = AV_CONFETTI_COLORS[i % AV_CONFETTI_COLORS.length];
      const rotate = Math.round(Math.random() * 360);
      piece.style.left = left + '%';
      piece.style.background = color;
      piece.style.animationDelay = delay + 's';
      piece.style.animationDuration = duration + 's';
      piece.style.setProperty('--rot', rotate + 'deg');
      wrap.appendChild(piece);
    }

    btn.appendChild(wrap);
  });
}

// ===== Baner cookie (informacja o niezbędnych plikach cookie / localStorage) =====

const AV_COOKIE_CONSENT_KEY = 'apollonhub_cookie_consent';

function av_initCookieBanner() {
  try {
    if (localStorage.getItem(AV_COOKIE_CONSENT_KEY) === '1') return;
  } catch (e) {
    return; // brak dostępu do localStorage — nie pokazujemy banera
  }
  if (document.querySelector('.cookie-banner')) return;

  const bar = document.createElement('div');
  bar.className = 'cookie-banner';
  bar.innerHTML =
    '<p>Ta strona korzysta wyłącznie z niezbędnych plików cookie / localStorage — do zapamiętania ' +
    'sesji Twojego konta Discord oraz zapamiętania akceptacji tej informacji. Po zalogowaniu Twój ' +
    'Discord ID jest wysyłany do naszego własnego bota licencyjnego, żeby pokazać Twoje licencje. ' +
    'Nie używamy cookies reklamowych ani analitycznych. Szczegóły w ' +
    '<a href="regulamin.html#cookies" style="color:var(--accent-2);font-weight:700;">Regulaminie</a>.</p>' +
    '<button class="btn btn-primary" id="cookieAcceptBtn">Rozumiem</button>';
  document.body.appendChild(bar);

  const btn = document.getElementById('cookieAcceptBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      try { localStorage.setItem(AV_COOKIE_CONSENT_KEY, '1'); } catch (e) {}
      bar.remove();
    });
  }
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
