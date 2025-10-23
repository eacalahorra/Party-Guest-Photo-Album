const pass = document.getElementById('pass');
const date = document.getElementById('date');
const grid = document.getElementById('grid');
const count = document.getElementById('count');

const state = { items: [] };

document.getElementById('refresh').addEventListener('click', load);
document.getElementById('download').addEventListener('click', downloadAll);

async function load() {
  grid.innerHTML = '';
  count.textContent = 'Loading…';
  const params = new URLSearchParams();
  if (date.value) params.set('date', date.value);
  const res = await fetch(`/api/list-files?${params.toString()}`, {
    headers: { 'X-Admin-Pass': pass.value || '' }
  });
  if (!res.ok) {
    count.textContent = 'Unauthorized or error.';
    return;
  }
  const data = await res.json();
  state.items = data.items || [];
  count.textContent = `${state.items.length} photos`;
  for (const it of state.items) {
    const card = document.createElement('div'); card.className = 'tile';
    const signed = await getSigned([it.key]);
    const img = document.createElement('img'); img.src = signed[0].url; img.alt = it.key.split('/').pop();
    const meta = document.createElement('div'); meta.className = 'meta';
    const d = new Date(it.lastModified);
    meta.textContent = `${it.key.split('/').pop()} • ${d.toLocaleString()}`;
    card.appendChild(img); card.appendChild(meta);
    grid.appendChild(card);
  }
}

async function getSigned(keys) {
  const res = await fetch('/api/get-download-urls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Pass': pass.value || '' },
    body: JSON.stringify({ keys })
  });
  if (!res.ok) throw new Error('Failed to sign download URLs');
  const { urls } = await res.json();
  return urls;
}

async function downloadAll() {
  if (!state.items.length) return;
  const zip = new JSZip();
  const BATCH = 25;
  const keys = state.items.map(x => x.key);
  for (let i = 0; i < keys.length; i += BATCH) {
    const slice = keys.slice(i, i + BATCH);
    const signed = await getSigned(slice);
    await Promise.all(signed.map(async ({ key, url }) => {
      const name = key.split('/').pop();
      const blob = await fetch(url).then(r => r.blob());
      zip.file(name, blob);
    }));
  }
  const content = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(content);
  a.download = `party-photos-${new Date().toISOString().slice(0,10)}.zip`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}