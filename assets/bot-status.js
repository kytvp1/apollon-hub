// ===== Apollon Studio — status botów Discord =====
//
// Ten skrypt umie pobierać status botów NA ŻYWO z publicznego "Widżetu serwera" Discorda
// (Discord Server Widget) — bez potrzeby własnego backendu.
//
// Jak to włączyć (2 minuty):
// 1. Discord → Ustawienia serwera → Widżet → włącz "Włącz widżet serwera".
// 2. Skopiuj "ID serwera" (włącz Tryb dewelopera w Ustawieniach Discorda → PPM na nazwę
//    serwera → Kopiuj ID serwera) i wklej je poniżej jako AV_GUILD_ID.
// 3. Dla każdego bota w tablicy AV_BOTS wklej jego ID (PPM na bota na liście członków → Kopiuj ID)
//    w polu "discordId".
//
// Dopóki AV_GUILD_ID lub dany "discordId" nie zostaną uzupełnione, karta bota pokaże
// "Status nieznany" zamiast zgadywać — to celowe, żeby nie pokazywać fałszywych informacji.
//
// Ograniczenie: publiczny widżet Discorda pokazuje tylko AKTUALNIE ONLINE członków serwera
// (limit ok. 100 osób). Jeśli Twój serwer jest bardzo duży, bot może nie pojawić się na liście
// mimo że działa — w praktyce dla botów (które są online 24/7) to rzadki przypadek.

const AV_GUILD_ID = 'WPISZ_TU_ID_SERWERA';

const AV_BOTS = [
  {
    id: 'status-serwera',
    discordId: 'WPISZ_ID_BOTA_STATUS',
    name: 'Apollon — Status Serwera',
    desc: 'Publikuje na kanale Discord status Twojego serwera Roblox w czasie rzeczywistym.',
    invite: '#',
    critical: false
  },
  {
    id: 'licencje',
    discordId: 'WPISZ_ID_BOTA_LICENCJE',
    name: 'Apollon — Licencje',
    desc: 'Weryfikuje konto Discord i aktywuje zakupione klucze licencyjne modeli oraz skryptów.',
    invite: '#',
    critical: true
  },
  {
    id: 'wsparcie',
    discordId: 'WPISZ_ID_BOTA_WSPARCIE',
    name: 'Apollon — Wsparcie',
    desc: 'Obsługuje zgłoszenia pomocy technicznej i zarządza kanałami wsparcia na serwerze.',
    invite: '#',
    critical: false
  }
];

async function av_fetchGuildWidget() {
  if (!AV_GUILD_ID || AV_GUILD_ID.startsWith('WPISZ')) return null;
  try {
    const res = await fetch(`https://discord.com/api/guilds/${AV_GUILD_ID}/widget.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

function av_statusLabel(status) {
  if (status === 'online') return { text: 'Online', badge: 'online' };
  if (status === 'offline') return { text: 'Offline', badge: 'offline' };
  return { text: 'Status nieznany', badge: 'info' };
}

function av_renderBotCards(container) {
  container.innerHTML = AV_BOTS.map(bot => {
    const initials = bot.name.replace('Apollon —', '').trim().slice(0, 2).toUpperCase();
    return `
      <div class="card">
        <div class="card-body">
          <div class="bot-card-head">
            <div class="bot-avatar">${initials}</div>
            <div class="name">
              <strong>${bot.name}</strong>
              <span>${bot.critical ? 'Bot krytyczny dla licencji' : 'Bot pomocniczy'}</span>
            </div>
          </div>
          <p style="margin:14px 0 0;">${bot.desc}</p>
          <div class="bot-status-row" id="bot-status-${bot.id}">
            <span class="badge info">Sprawdzanie…</span>
          </div>
          <div class="bot-updated" id="bot-updated-${bot.id}"></div>
          <div class="card-footer" style="margin-top:16px;">
            <a href="${bot.invite}" class="btn-text" style="padding:4px 0;">Zaproś / kanał bota →</a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function av_initBotStatus() {
  const container = document.getElementById('botStatusGrid');
  if (!container) return;

  av_renderBotCards(container);

  const widget = await av_fetchGuildWidget();

  AV_BOTS.forEach(bot => {
    let status = 'unknown';
    if (widget && bot.discordId && !bot.discordId.startsWith('WPISZ')) {
      const member = (widget.members || []).find(m => m.id === bot.discordId);
      status = member ? 'online' : 'offline';
    }
    const label = av_statusLabel(status);
    const row = document.getElementById(`bot-status-${bot.id}`);
    if (row) {
      const dotColor = status === 'online' ? 'var(--success)' : status === 'offline' ? 'var(--danger)' : 'var(--text-muted)';
      row.innerHTML = `<span class="dot" style="background:${dotColor};box-shadow:0 0 6px ${dotColor};"></span><span class="badge ${label.badge}">${label.text}</span>`;
    }
    const updated = document.getElementById(`bot-updated-${bot.id}`);
    if (updated) {
      updated.textContent = widget
        ? `Ostatnie sprawdzenie: ${new Date().toLocaleTimeString('pl-PL')}`
        : 'Status na żywo wyłączony — skonfiguruj widżet Discord w assets/bot-status.js';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  av_initBotStatus();
  // Odśwież status co 60 sekund, jeśli użytkownik zostanie na stronie.
  setInterval(av_initBotStatus, 60000);
});
