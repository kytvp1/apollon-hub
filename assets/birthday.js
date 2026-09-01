/*
  Koło Fortuny z okazji 3. urodzin Apollon Hub — losowanie kodu rabatowego.

  KONFIGURACJA:

  AV_BIRTHDAY.enabled — true/false, włącza lub wyłącza całą niespodziankę.
  AV_BIRTHDAY.endsAt  — data i godzina końca tygodnia urodzinowego
                         (format: 'RRRR-MM-DDTGG:MM:SS'). Po tej dacie koło
                         i dymek przestają się automatycznie pokazywać.

  AV_WHEEL_PRIZES — nagrody na kole. Każda ma:
    label     — krótki tekst widoczny NA kole (np. '-20%')
    discount  — wysokość zniżki w % (0 = brak wygranej)
    weight    — "waga" szansy na trafienie (im większa liczba względem innych,
                tym większy kawałek koła i większa szansa na wylosowanie).
                Suma wag nie musi wynosić 100 — jest przeliczana automatycznie.
    color / textColor — kolory kawałka koła i jego napisu
    resultTitle / resultDesc — tekst pokazywany PO zakręceniu, gdy padnie ta nagroda

  Kod rabatowy generowany po wygranej zapisuje się w przeglądarce użytkownika
  (localStorage) i jest widoczny na stronie "Wydarzenia" w sekcji
  "Twoje kody rabatowe" — nie ma go nigdzie indziej (nie jest wysyłany
  automatycznie na serwer), więc klient powinien pokazać go zespołowi na
  Discordzie przy składaniu zamówienia.

  Każda przeglądarka może zakręcić kołem TYLKO RAZ — to zapisane jest lokalnie
  (localStorage), żeby nie dało się losować w nieskończoność.
*/

const AV_BIRTHDAY = {
  enabled: true,
  endsAt: '2026-09-07T23:59:59',
};

const AV_WHEEL_PRIZES = [
  {
    label: 'Pudło',
    discount: 0,
    weight: 30,
    color: '#1c1c21',
    textColor: '#8b8d97',
    resultTitle: 'Tym razem bez wygranej',
    resultDesc: 'Nie szkodzi — reszta wydarzeń urodzinowych czeka w zakładce Wydarzenia.',
  },
  {
    label: '-10%',
    discount: 10,
    weight: 25,
    color: '#16234a',
    textColor: '#f2f3f6',
    resultTitle: 'Wygrywasz -10%!',
    resultDesc: 'Twój kod rabatowy jest już zapisany w zakładce Wydarzenia — pokaż go zespołowi na Discordzie przy zamawianiu.',
  },
  {
    label: '-15%',
    discount: 15,
    weight: 20,
    color: '#1c2f63',
    textColor: '#f2f3f6',
    resultTitle: 'Wygrywasz -15%!',
    resultDesc: 'Twój kod rabatowy jest już zapisany w zakładce Wydarzenia — pokaż go zespołowi na Discordzie przy zamawianiu.',
  },
  {
    label: '-20%',
    discount: 20,
    weight: 12,
    color: '#2547a0',
    textColor: '#f2f3f6',
    resultTitle: 'Wygrywasz -20%!',
    resultDesc: 'Twój kod rabatowy jest już zapisany w zakładce Wydarzenia — pokaż go zespołowi na Discordzie przy zamawianiu.',
  },
  {
    label: '-30%',
    discount: 30,
    weight: 8,
    color: '#3163d1',
    textColor: '#06101f',
    resultTitle: 'Świetnie! Wygrywasz -30%!',
    resultDesc: 'Twój kod rabatowy jest już zapisany w zakładce Wydarzenia — pokaż go zespołowi na Discordzie przy zamawianiu.',
  },
  {
    label: '-40%',
    discount: 40,
    weight: 5,
    color: '#ffd166',
    textColor: '#3a2600',
    resultTitle: 'JACKPOT! Wygrywasz -40%!',
    resultDesc: 'To najwyższa możliwa wygrana w tym kole! Kod zapisany w zakładce Wydarzenia — pokaż go zespołowi przy zamawianiu.',
  },
];

const AV_BIRTHDAY_SEEN_KEY = 'apollonhub_birthday_seen_v1';
const AV_WHEEL_SPUN_KEY = 'apollonhub_wheel_spun_v1';
const AV_WHEEL_CODES_KEY = 'apollonhub_wheel_codes';
const AV_ANNOUNCEMENT_DISMISSED_KEY = 'apollonhub_announcement_dismissed_v1';

// ===== Konfetti na czystym <canvas>, bez zewnętrznych bibliotek =====

function av_launchConfetti(intensity) {
  const mult = intensity || 1;
  const canvas = document.createElement('canvas');
  canvas.className = 'birthday-confetti-canvas';
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:400;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return; }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const colors = ['#3163d1', '#5b8bf0', '#3ddc97', '#ffd166', '#ff5d6c'];
  const baseCount = window.innerWidth < 640 ? 70 : 140;
  const pieceCount = Math.round(baseCount * mult);
  const pieces = Array.from({ length: pieceCount }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.6,
    size: 5 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: 2 + Math.random() * 3,
    speedX: (Math.random() - 0.5) * 2,
    rotation: Math.random() * 360,
    spin: (Math.random() - 0.5) * 10,
  }));

  const start = performance.now();
  const duration = 3200;

  function frame(now) {
    const elapsed = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    if (elapsed < duration) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
      window.removeEventListener('resize', resize);
    }
  }
  requestAnimationFrame(frame);
}

// ===== Odliczanie do końca tygodnia urodzinowego =====

function av_formatCountdown(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const pad = (n) => String(n).padStart(2, '0');
  if (days > 0) return `${days} dni ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
}

function av_updateCountdownEls() {
  const target = new Date(AV_BIRTHDAY.endsAt).getTime();
  const diff = target - Date.now();
  const text = diff <= 0 ? 'Zakończony' : av_formatCountdown(diff);
  document.querySelectorAll('[data-birthday-countdown]').forEach((el) => {
    el.textContent = text;
  });
}

// ===== Zapamiętane kody rabatowe (localStorage) =====

function av_getWheelCodes() {
  try {
    const raw = localStorage.getItem(AV_WHEEL_CODES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function av_saveWheelCode(entry) {
  const codes = av_getWheelCodes();
  codes.push(entry);
  try { localStorage.setItem(AV_WHEEL_CODES_KEY, JSON.stringify(codes)); } catch (e) {}
}

function av_hasSpun() {
  try { return localStorage.getItem(AV_WHEEL_SPUN_KEY) === '1'; } catch (e) { return false; }
}

function av_markSpun() {
  try { localStorage.setItem(AV_WHEEL_SPUN_KEY, '1'); } catch (e) {}
}

function av_copyText(text, btnEl) {
  const done = () => {
    if (!btnEl) return;
    const original = btnEl.textContent;
    btnEl.textContent = 'Skopiowano!';
    setTimeout(() => { btnEl.textContent = original; }, 1500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(done);
  } else {
    done();
  }
}

function av_generateCode(prize) {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `URODZINY-${prize.discount}-${rand}`;
}

// ===== Rysowanie i losowanie koła =====

function av_pickWeightedPrizeIndex() {
  const total = AV_WHEEL_PRIZES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < AV_WHEEL_PRIZES.length; i++) {
    r -= AV_WHEEL_PRIZES[i].weight;
    if (r <= 0) return i;
  }
  return AV_WHEEL_PRIZES.length - 1;
}

function av_drawWheel(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  const total = AV_WHEEL_PRIZES.reduce((s, p) => s + p.weight, 0);

  ctx.clearRect(0, 0, size, size);

  let cursor = 0;
  AV_WHEEL_PRIZES.forEach((p) => {
    const sliceDeg = (p.weight / total) * 360;
    const startDeg = cursor;
    const endDeg = cursor + sliceDeg;
    const startRad = ((startDeg - 90) * Math.PI) / 180;
    const endRad = ((endDeg - 90) * Math.PI) / 180;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startRad, endRad);
    ctx.closePath();
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.stroke();

    const midDeg = (startDeg + endDeg) / 2;
    const midRad = ((midDeg - 90) * Math.PI) / 180;
    ctx.save();
    ctx.translate(cx + Math.cos(midRad) * r * 0.64, cy + Math.sin(midRad) * r * 0.64);
    let labelRot = midRad + Math.PI / 2;
    const normalizedMidDeg = ((midDeg % 360) + 360) % 360;
    if (normalizedMidDeg > 90 && normalizedMidDeg < 270) labelRot += Math.PI; // tekst zawsze czytelny, nigdy do góry nogami
    ctx.rotate(labelRot);
    ctx.fillStyle = p.textColor;
    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.label, 0, 0);
    ctx.restore();

    p._startDeg = startDeg;
    p._endDeg = endDeg;
    cursor = endDeg;
  });

  // środkowy krążek
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.14, 0, Math.PI * 2);
  ctx.fillStyle = '#09090b';
  ctx.fill();
  ctx.strokeStyle = '#232327';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function av_spinWheelTo(canvas, prizeIndex, onDone) {
  const p = AV_WHEEL_PRIZES[prizeIndex];
  const mid = (p._startDeg + p._endDeg) / 2;
  const jitter = (Math.random() - 0.5) * (p._endDeg - p._startDeg) * 0.5;
  const targetTop = mid + jitter;
  const spins = 6;
  const rotation = spins * 360 + ((360 - targetTop) % 360);

  canvas.style.transition = 'transform 4.2s cubic-bezier(0.15, 0.65, 0.1, 1)';
  void canvas.offsetWidth; // wymusza reflow, żeby transition na pewno zadziałał
  canvas.style.transform = `rotate(${rotation}deg)`;

  setTimeout(onDone, 4300);
}

// ===== Budowanie treści dymka =====

function av_wheelModalHtml() {
  return `
    <button class="birthday-close" aria-label="Zamknij">×</button>
    <div class="wheel-eyebrow">3. urodziny Apollon Hub</div>
    <h3>Zakręć kołem urodzinowym!</h3>
    <p class="wheel-sub">Jedna szansa na kod rabatowy w tej przeglądarce. Tydzień urodzinowy kończy się za: <strong data-birthday-countdown>--:--:--</strong></p>
    <div class="wheel-wrap">
      <div class="wheel-pointer"></div>
      <canvas id="birthdayWheelCanvas" width="240" height="240" class="wheel-canvas"></canvas>
    </div>
    <button class="btn btn-primary wheel-spin-btn" id="wheelSpinBtn">Zakręć kołem</button>
    <div class="wheel-result" id="wheelResult" hidden></div>
  `;
}

function av_alreadySpunModalHtml() {
  return `
    <button class="birthday-close" aria-label="Zamknij">×</button>
    <div class="wheel-eyebrow">3. urodziny Apollon Hub</div>
    <h3>Koło zakręcone — Twój kod czeka</h3>
    <p>To koło da się zakręcić tylko raz na przeglądarkę — Twój kod rabatowy znajdziesz w zakładce Wydarzenia.</p>
    <p class="wheel-sub">Tydzień urodzinowy kończy się za: <strong data-birthday-countdown>--:--:--</strong></p>
    <a href="wydarzenia.html" class="btn btn-primary birthday-cta">Zobacz mój kod →</a>
  `;
}

function av_handleSpin(canvas, spinBtn, toast) {
  if (spinBtn.disabled) return;
  spinBtn.disabled = true;
  spinBtn.textContent = 'Kręcimy...';

  const idx = av_pickWeightedPrizeIndex();
  av_spinWheelTo(canvas, idx, () => {
    const prize = AV_WHEEL_PRIZES[idx];
    av_markSpun();
    const resultBox = toast.querySelector('#wheelResult');
    if (!resultBox) return;

    if (prize.discount > 0) {
      const code = av_generateCode(prize);
      av_saveWheelCode({ code, discount: prize.discount, wonAt: new Date().toISOString(), source: 'Koło Fortuny' });
      av_launchConfetti(prize.discount >= 40 ? 2 : 1.3);
      resultBox.innerHTML = `
        <div class="wheel-result-title">${prize.resultTitle}</div>
        <p class="wheel-result-desc">${prize.resultDesc}</p>
        <div class="wheel-code-box">
          <span class="wheel-code">${code}</span>
          <button class="btn btn-outline" id="wheelCopyBtn">Kopiuj</button>
        </div>
      `;
      const copyBtn = resultBox.querySelector('#wheelCopyBtn');
      if (copyBtn) copyBtn.addEventListener('click', (e) => av_copyText(code, e.currentTarget));
    } else {
      resultBox.innerHTML = `
        <div class="wheel-result-title">${prize.resultTitle}</div>
        <p class="wheel-result-desc">${prize.resultDesc}</p>
      `;
    }
    resultBox.hidden = false;
    spinBtn.style.display = 'none';
  });
}

function av_closeToast(toast) {
  toast.classList.remove('show');
  setTimeout(() => toast.remove(), 300);
}

function av_initBirthdayBanner() {
  if (!AV_BIRTHDAY.enabled) return;

  const end = new Date(AV_BIRTHDAY.endsAt).getTime();
  if (Date.now() > end) return; // tydzień urodzinowy się zakończył

  try {
    if (sessionStorage.getItem(AV_BIRTHDAY_SEEN_KEY)) return;
  } catch (e) {}

  const alreadySpun = av_hasSpun();
  av_launchConfetti(1);

  const toast = document.createElement('div');
  toast.className = alreadySpun ? 'birthday-toast' : 'birthday-toast wheel-modal';
  toast.innerHTML = alreadySpun ? av_alreadySpunModalHtml() : av_wheelModalHtml();
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));

  const closeBtn = toast.querySelector('.birthday-close');
  if (closeBtn) closeBtn.addEventListener('click', () => av_closeToast(toast));

  if (!alreadySpun) {
    const canvas = toast.querySelector('#birthdayWheelCanvas');
    if (canvas) av_drawWheel(canvas);
    const spinBtn = toast.querySelector('#wheelSpinBtn');
    if (spinBtn && canvas) spinBtn.addEventListener('click', () => av_handleSpin(canvas, spinBtn, toast));
  }

  av_updateCountdownEls();

  try { sessionStorage.setItem(AV_BIRTHDAY_SEEN_KEY, '1'); } catch (e) {}
}

// ===== Pasek ogłoszenia u góry KAŻDEJ podstrony (nie tylko strony głównej) =====
// To ma być duże, widoczne wydarzenie — pasek przypomina o nim na całej stronie,
// nie tylko w dymku na stronie głównej.

function av_initAnnouncementBar() {
  if (!AV_BIRTHDAY.enabled) return;

  const end = new Date(AV_BIRTHDAY.endsAt).getTime();
  if (Date.now() > end) return; // tydzień urodzinowy się zakończył

  try {
    if (sessionStorage.getItem(AV_ANNOUNCEMENT_DISMISSED_KEY)) return;
  } catch (e) {}

  if (document.querySelector('.announcement-bar')) return;

  const spun = av_hasSpun();
  const ctaHref = spun ? 'wydarzenia.html' : 'index.html';
  const ctaText = spun ? 'Zobacz mój kod →' : 'Zakręć kołem i wygraj do -40% →';

  const bar = document.createElement('div');
  bar.className = 'announcement-bar';
  bar.innerHTML = `
    <div class="announcement-inner">
      <span class="announcement-text"><strong>Tydzień 3. urodzin Apollon Hub</strong> — kończy się za <span data-birthday-countdown>--:--:--</span></span>
      <a href="${ctaHref}" class="announcement-cta">${ctaText}</a>
      <button class="announcement-close" aria-label="Zamknij pasek">×</button>
    </div>
  `;
  document.body.insertBefore(bar, document.body.firstChild);

  const closeBtn = bar.querySelector('.announcement-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      bar.remove();
      try { sessionStorage.setItem(AV_ANNOUNCEMENT_DISMISSED_KEY, '1'); } catch (e) {}
    });
  }

  av_updateCountdownEls();
}

// ===== Sekcja "Twoje kody rabatowe" (zakładka Wydarzenia) =====

function av_renderMyWheelCodes() {
  const panel = document.getElementById('myCodesPanel');
  if (!panel) return;

  const codes = av_getWheelCodes();

  if (!codes.length) {
    panel.innerHTML = `
      <h3 style="margin:0 0 8px;">Twoje kody rabatowe</h3>
      <p style="color:var(--text-muted);font-size:14px;margin:0 0 16px;">Nie masz jeszcze żadnego kodu — wróć na stronę główną i zakręć kołem urodzinowym, może się poszczęści!</p>
      <a href="index.html" class="btn btn-primary">Zakręć kołem →</a>
    `;
    return;
  }

  panel.innerHTML = `
    <h3 style="margin:0 0 14px;">Twoje kody rabatowe</h3>
    <div class="mycode-list">
      ${codes.map((c) => `
        <div class="mycode-card">
          <div>
            <div class="mycode-code">${c.code}</div>
            <div class="mycode-meta">-${c.discount}%${c.source ? ' • ' + c.source : ''} • wygrane ${new Date(c.wonAt).toLocaleDateString('pl-PL')}</div>
          </div>
          <button class="btn btn-outline mycode-copy" data-code="${c.code}">Kopiuj</button>
        </div>
      `).join('')}
    </div>
    <p style="color:var(--text-muted);font-size:12.5px;margin:14px 0 0;">Pokaż kod zespołowi na Discordzie przy zamawianiu, żeby otrzymać zniżkę. Kody ważne do końca tygodnia urodzinowego (<span data-birthday-countdown>--:--:--</span> pozostało).</p>
  `;

  panel.querySelectorAll('.mycode-copy').forEach((btn) => {
    btn.addEventListener('click', () => av_copyText(btn.dataset.code, btn));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  av_initAnnouncementBar();
  if (document.body.dataset.page === 'index') av_initBirthdayBanner();
  av_renderMyWheelCodes();
  av_updateCountdownEls();
});

setInterval(av_updateCountdownEls, 1000);
