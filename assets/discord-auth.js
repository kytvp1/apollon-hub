/*
  Łączenie konta Discord — OAuth2 (Implicit Grant), w 100% po stronie klienta.
  Działa na darmowym hostingu statycznym (GitHub Pages) bez własnego backendu,
  bo token wraca bezpośrednio we fragmencie adresu URL (#access_token=...).

  KONFIGURACJA (wymagana przed uruchomieniem na produkcji):
  1. Wejdź na https://discord.com/developers/applications i utwórz aplikację.
  2. W zakładce OAuth2 dodaj Redirect URL dokładnie taki, pod jakim będzie stała
     ta strona, np. https://twojanazwa.github.io/apollon-hub/konto.html
  3. Wklep swój Client ID poniżej.
  4. Podmień AV_REDIRECT_URI na dokładny adres z punktu 2 (musi być identyczny co do znaku).
*/

const AV_DISCORD_CLIENT_ID = 'WPISZ_TU_SWOJE_CLIENT_ID';
const AV_REDIRECT_URI = window.location.origin + window.location.pathname; // domyślnie: ta sama strona (konto.html)
const AV_SCOPE = 'identify';

function av_buildDiscordAuthUrl() {
  const params = new URLSearchParams({
    client_id: AV_DISCORD_CLIENT_ID,
    redirect_uri: AV_REDIRECT_URI,
    response_type: 'token',
    scope: AV_SCOPE
  });
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

async function av_fetchDiscordProfile(accessToken) {
  const res = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) throw new Error('Nie udało się pobrać profilu Discord.');
  return res.json();
}

function av_avatarUrl(user) {
  if (!user.avatar) return null;
  const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=64`;
}

async function av_handleDiscordRedirect() {
  if (!window.location.hash.includes('access_token')) return false;

  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  if (!accessToken) return false;

  try {
    const profile = await av_fetchDiscordProfile(accessToken);
    av_setDiscordUser({
      id: profile.id,
      username: profile.username,
      discriminator: profile.discriminator,
      avatarUrl: av_avatarUrl(profile)
    });
    // Czyścimy token z paska adresu, żeby nie został w historii przeglądarki
    history.replaceState(null, '', window.location.pathname);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

function av_renderAccountPanel() {
  const box = document.getElementById('discordAccountBox');
  if (!box) return;

  const user = av_getDiscordUser();

  if (!user) {
    box.innerHTML = `
      <p style="color:var(--text-muted);font-size:14px;margin-bottom:18px;">
        Nie masz jeszcze powiązanego konta Discord. Połącz je, aby przypisywać
        licencje modeli do swojego Discord ID.
      </p>
      <a class="btn btn-discord btn-block" href="${av_buildDiscordAuthUrl()}">
        Połącz konto Discord
      </a>
    `;
    return;
  }

  box.innerHTML = `
    <div class="discord-account">
      ${user.avatarUrl
        ? `<img src="${user.avatarUrl}" alt="" style="width:46px;height:46px;border-radius:50%;">`
        : `<div class="avatar">${user.username.slice(0,2).toUpperCase()}</div>`}
      <div class="meta">
        <strong>@${user.username}</strong>
        <span>Discord ID: ${user.id}</span>
      </div>
      <button class="btn btn-outline" id="disconnectDiscordBtn" style="padding:8px 16px;font-size:13px;">Odłącz</button>
    </div>
  `;

  document.getElementById('disconnectDiscordBtn').addEventListener('click', () => {
    av_clearDiscordUser();
    av_renderAccountPanel();
    av_reflectDiscordConnection();
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await av_handleDiscordRedirect();
  // poczekaj aż header/footer się wczytają (av_includePartials), potem odśwież panel
  setTimeout(() => {
    av_renderAccountPanel();
    av_reflectDiscordConnection();
  }, 150);
});
