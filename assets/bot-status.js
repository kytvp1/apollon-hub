// ===== Apollon Studio — status botów Discord =====
//
// Ten skrypt pobiera status botów NA ŻYWO z publicznego "Widżetu serwera" Discorda
// (Discord Server Widget) — bez potrzeby własnego backendu.
//
// WAŻNE ograniczenie widżetu Discorda: publiczne API widżetu NIE zwraca prawdziwych ID
// użytkowników (ze względów prywatności zamienia je na uproszczone "0", "1", "2"...).
// Zwraca za to ich NAZWĘ UŻYTKOWNIKA (username) — dlatego dopasowanie botów w tym pliku
// działa po polu "widgetUsername", a nie po ID. Jeśli kiedyś zmienisz nazwę użytkownika
// (username) bota na Discordzie, zaktualizuj też wartość "widgetUsername" poniżej.
//
// Jak to skonfigurować:
// 1. Discord → Ustawienia serwera → Widżet → włącz "Włącz widżet serwera" (na serwerze,
//    na którym faktycznie działają boty).
// 2. Skopiuj "ID serwera" (Tryb dewelopera → PPM na nazwę serwera → Kopiuj ID serwera)
//    i wklej poniżej jako AV_GUILD_ID.
// 3. Dla każdego bota wpisz jego dokładną nazwę użytkownika (username, nie nick na serwerze)
//    w polu "widgetUsername".
//
// Dopóki AV_GUILD_ID nie jest uzupełnione albo widżet jest wyłączony, karta bota pokaże
// "Status nieznany" zamiast zgadywać — to celowe, żeby nie pokazywać fałszywych informacji.
//
// Ograniczenie: publiczny widżet Discorda pokazuje tylko AKTUALNIE ONLINE członków serwera
// (limit ok. 100 osób). Jeśli Twój serwer jest bardzo duży, bot może nie pojawić się na liście
// mimo że działa — w praktyce dla botów (które są online 24/7) to rzadki przypadek.

const AV_GUILD_ID = '1489354594562740324';

const AV_BOTS = [
  {
    id: 'api',
    widgetUsername: 'Apollon API',
    name: 'Apollon API',
    desc: 'Weryfikacja konta Roblox i Discord oraz sprawdzanie banów na Roblox.',
    invite: 'https://discord.gg/FjP3PnDGJQ',
    critical: false
  },
  {
    id: 'licencje',
    widgetUsername: 'licencje',
    name: 'Apollon Licencje',
    desc: 'Weryfikuje konto Discord i aktywuje zakupione klucze licencyjne produktów.',
    invite: 'https://discord.gg/FjP3PnDGJQ',
    critical: true
  },
  {
    id: 'radio',
    widgetUsername: 'radio',
    name: 'Apollon Roblox Radio',
    desc: 'Obsługuje system radia Roblox na serwerze.',
    invite: 'https://discord.gg/FjP3PnDGJQ',
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
    const rest = bot.name.replace(/^Apollon\s*/i, '').trim();
    const words = rest.split(/\s+/).filter(Boolean);
    const initials = words.length > 1
      ? (words[0][0] + words[1][0]).toUpperCase()
      : rest.slice(0, 2).toUpperCase();
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
    if (widget && bot.widgetUsername) {
      const member = (widget.members || []).find(m => m.username === bot.widgetUsername);
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
