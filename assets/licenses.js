/*
  Moje licencje — DEMO działające w 100% w przeglądarce (localStorage).
  To pokazuje pełny interfejs (dodawanie klucza, lista, usuwanie), ale NIE weryfikuje
  realnie kluczy licencyjnych — statyczna strona (GitHub Pages) nie ma własnej bazy danych.

  Żeby to działało naprawdę (prawdziwe klucze wydawane po zakupie, wiązane z Discord ID
  na stałe, widoczne dla Twojego bota Discord), potrzebny jest mały backend, np.:
  - darmowa baza danych typu Supabase/Firebase + kilka linijek kodu, albo
  - Twój bot Discord jako "backend", zapisujący/odczytujący licencje przez własne API.
  Ten plik zostawia w kodzie jasno oznaczone miejsce (AV_VALIDATE_KEY), gdzie taką
  prawdziwą walidację się podepnie.
*/

const AV_LICENSES_KEY = 'apollonhub_licenses_demo';

function av_getLicenses() {
  try {
    const raw = localStorage.getItem(AV_LICENSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function av_saveLicenses(list) {
  localStorage.setItem(AV_LICENSES_KEY, JSON.stringify(list));
}

// Miejsce na prawdziwą walidację klucza względem Twojej bazy/API (patrz komentarz wyżej).
// Na razie: akceptuje klucze w formacie AHUB-XXXX-XXXX-XXXX (tylko sprawdzenie formatu).
function AV_VALIDATE_KEY(key) {
  return /^AHUB-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key.trim().toUpperCase());
}

function av_renderLicenses() {
  const tbody = document.getElementById('licensesTableBody');
  const empty = document.getElementById('licensesEmpty');
  if (!tbody) return;

  const list = av_getLicenses();
  tbody.innerHTML = '';

  if (list.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  list.forEach((lic, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${lic.model}</td>
      <td class="mono">${lic.key}</td>
      <td><span class="badge online">Aktywna</span></td>
      <td>${lic.addedAt}</td>
      <td><button class="btn btn-outline" data-idx="${idx}" style="padding:6px 12px;font-size:12px;">Usuń</button></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('button[data-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const list2 = av_getLicenses();
      list2.splice(Number(btn.dataset.idx), 1);
      av_saveLicenses(list2);
      av_renderLicenses();
    });
  });
}

function av_initLicenseForm() {
  const form = document.getElementById('addLicenseForm');
  const statusMsg = document.getElementById('licenseStatusMsg');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const model = document.getElementById('licenseModel').value.trim();
    const key = document.getElementById('licenseKey').value.trim().toUpperCase();

    const user = av_getDiscordUser ? av_getDiscordUser() : null;

    statusMsg.className = 'status-msg show';

    if (!user) {
      statusMsg.classList.add('err');
      statusMsg.textContent = 'Najpierw połącz konto Discord na stronie "Konto Discord" — licencje są przypisywane do Twojego Discord ID.';
      return;
    }
    if (!model) {
      statusMsg.classList.add('err');
      statusMsg.textContent = 'Podaj nazwę modelu / produktu.';
      return;
    }
    if (!AV_VALIDATE_KEY(key)) {
      statusMsg.classList.add('err');
      statusMsg.textContent = 'Nieprawidłowy format klucza. Oczekiwany: AHUB-XXXX-XXXX-XXXX';
      return;
    }

    const list = av_getLicenses();
    list.unshift({
      model,
      key,
      discordId: user.id,
      addedAt: new Date().toLocaleDateString('pl-PL')
    });
    av_saveLicenses(list);
    av_renderLicenses();

    statusMsg.classList.remove('err');
    statusMsg.classList.add('ok');
    statusMsg.textContent = `Licencja dodana i powiązana z Discord ID ${user.id}.`;
    form.reset();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    av_renderLicenses();
    av_initLicenseForm();
  }, 150);
});
