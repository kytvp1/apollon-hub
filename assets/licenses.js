/*
  Moje licencje — pobiera PRAWDZIWE dane z Twojego bota Discord (bezpieczny endpoint
  tylko do odczytu: /api/my-licenses), zamiast dawnego demo w localStorage.

  KONFIGURACJA (wymagana):
  Wklej poniżej publiczny adres, pod którym stoi Twój bot (ten sam co PUBLIC_API_URL
  w .env bota, ale BEZ końcówki "/api/validate" — sam host + port), np.:
  const AV_LICENSE_API_BASE = 'http://twoja-subdomena.bot-hosting.net:3000';

  Dopóki zostanie tu placeholder "WPISZ...", strona pokaże czytelny komunikat zamiast
  próbować się łączyć donikąd.
*/

const AV_LICENSE_API_BASE = 'https://xms87hmsab.apps.bot-hosting.cloud';

const AV_STATUS_LABELS = {
  pending: 'Oczekuje',
  active: 'Odblokowana',
  blocked: 'Zablokowana',
};

const AV_STATUS_BADGE = {
  pending: 'info',
  active: 'online',
  blocked: 'offline',
};

function av_licenseApiConfigured() {
  return !!AV_LICENSE_API_BASE && !AV_LICENSE_API_BASE.startsWith('WPISZ');
}

async function av_fetchMyLicenses(discordId) {
  const res = await fetch(`${AV_LICENSE_API_BASE}/api/my-licenses?discordId=${encodeURIComponent(discordId)}`);
  if (!res.ok) throw new Error('bad_response');
  const data = await res.json();
  if (!data.ok) throw new Error('api_error');
  return data.licenses || [];
}

function av_showState(state) {
  const ids = {
    'not-logged-in': 'licensesLoginNeeded',
    'not-configured': 'licensesApiMissing',
    'error': 'licensesError',
    'empty': 'licensesEmpty',
    'ok': 'licensesTableWrap',
  };
  Object.values(ids).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const target = document.getElementById(ids[state]);
  if (target) target.style.display = 'block';
}

function av_renderLicenses(licenses) {
  const tbody = document.getElementById('licensesTableBody');
  if (!tbody) return;
  tbody.innerHTML = licenses.map((lic) => {
    const badge = AV_STATUS_BADGE[lic.status] || 'info';
    const label = AV_STATUS_LABELS[lic.status] || lic.status;
    return `
      <tr>
        <td>${lic.product}</td>
        <td class="mono">${lic.key}</td>
        <td><span class="badge ${badge}">${label}</span></td>
        <td>${lic.note ? lic.note : '—'}</td>
      </tr>
    `;
  }).join('');
}

async function av_initLicenses() {
  if (!document.getElementById('licensesTableBody')) return;

  if (!av_licenseApiConfigured()) {
    av_showState('not-configured');
    return;
  }

  const user = av_getDiscordUser ? av_getDiscordUser() : null;
  if (!user) {
    av_showState('not-logged-in');
    return;
  }

  try {
    const licenses = await av_fetchMyLicenses(user.id);
    if (licenses.length === 0) {
      av_showState('empty');
      return;
    }
    av_renderLicenses(licenses);
    av_showState('ok');
  } catch (e) {
    av_showState('error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Malutkie opoznienie - av_getDiscordUser czyta z localStorage wypelnianego
  // przez include.js/discord-auth.js, ktore rowniez startuja na DOMContentLoaded.
  setTimeout(av_initLicenses, 150);
});
