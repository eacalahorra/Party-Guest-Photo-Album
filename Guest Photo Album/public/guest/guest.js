const fileInput = document.getElementById('file');
const drop = document.getElementById('drop');
const statusEl = document.getElementById('status');
const preview = document.getElementById('preview');
const gallery = document.getElementById('gallery');

document.getElementById('cameraBtn').addEventListener('click', () => {
  fileInput.setAttribute('capture', 'environment');
  fileInput.click();
});

document.getElementById('pickBtn').addEventListener('click', () => {
  fileInput.removeAttribute('capture');
  fileInput.click();
});

const acceptTypes = ['image/jpeg','image/png','image/webp','image/heic','image/heif'];
const MAX_SIZE = 30 * 1024 * 1024; 
const MAX_FILES = 20;               

function setStatus(msg) { statusEl.textContent = msg; }

fileInput.addEventListener('change', (e) => onFiles(e.target.files));
drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('drag'); });
drop.addEventListener('dragleave', () => drop.classList.remove('drag'));
drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('drag'); onFiles(e.dataTransfer.files); });

function validate(files) {
  const arr = Array.from(files);
  if (!arr.length) return [];
  const trimmed = arr.slice(0, MAX_FILES);
  const badType = trimmed.find(f => !acceptTypes.includes(f.type));
  if (badType) { setStatus('Please upload JPG/PNG/WEBP/HEIC images only.'); return []; }
  const tooBig = trimmed.find(f => f.size > MAX_SIZE);
  if (tooBig) { setStatus('One or more files exceed 30 MB.'); return []; }
  return trimmed;
}

async function onFiles(files) {
  const list = validate(files);
  if (!list.length) return;

  preview.hidden = true;

  setStatus(`Uploading ${list.length} photo${list.length>1?'s':''}…`);
  const CONCURRENCY = 3;
  const queue = list.map(prepareItem);
  let inFlight = 0, i = 0, done = 0;

  function pump() {
    while (inFlight < CONCURRENCY && i < queue.length) {
      const task = queue[i++];
      inFlight++;
      task().then(() => {
        inFlight--; done++;
        if (done === queue.length) {
          setStatus('✅ All photos have been uploaded!');
        } else {
          setStatus(`Uploading… ${done}/${queue.length}`);
        }
        pump();
      }).catch(() => {
        inFlight--; done++;
        setStatus(`Some images have not been successfully uploaded :/ ${done}/${queue.length} processed.`);
        pump();
      });
    }
  }
  pump();
}

function prepareItem(file) {

  const url = URL.createObjectURL(file);
  const tile = document.createElement('div'); tile.className = 'item';
  const img = document.createElement('img'); img.src = url; img.alt = file.name;
  const bar = document.createElement('div'); bar.className = 'bar';
  const fill = document.createElement('span'); bar.appendChild(fill);
  tile.appendChild(img); tile.appendChild(bar);
  gallery.appendChild(tile);

  
  return async function uploadTask() {
    try {
      const meta = { contentType: file.type, originalName: file.name };
      const res = await fetch('/api/get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meta)
      });
      if (!res.ok) throw new Error('Failed to get upload URL');
      const { url: putUrl } = await res.json();

      // This tracks progess using XHR... first time using it.
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', putUrl, true);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            fill.style.width = pct + '%';
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            fill.style.width = '100%';
            resolve();
          } else reject(new Error('Upload failed: ' + xhr.status));
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(file);
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  };
}