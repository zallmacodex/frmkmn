// Ganti apiBase jika ingin pointing ke domain lain, kosongkan untuk auto
const apiBase = '';

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#39;'
  }[m]));
}

// ====== TOPIK ======
async function loadTopics() {
  try {
    const res = await fetch(`${apiBase}/api/getTopics`);
    const topics = await res.json();
    const container = document.getElementById('topics');
    if (!container) return;

    if (!Array.isArray(topics) || topics.length === 0) {
      container.innerHTML = `<p>Belum ada topik.</p>`;
      return;
    }

    container.innerHTML = topics.map(t => `
      <div class="topic-card">
        <a href="view.html?id=${t.id}">${escapeHTML(t.title)}</a> - oleh ${escapeHTML(t.name)}
        <button onclick="deleteTopic('${t.id}')">Hapus</button>
      </div>
    `).join('');
  } catch (err) {
    console.error('Gagal memuat topik:', err);
  }
}

async function addTopic() {
  const name = document.getElementById('name')?.value.trim();
  const title = document.getElementById('title')?.value.trim();
  const password = document.getElementById('password')?.value.trim();

  if (!name || !title || !password) {
    alert('Semua kolom harus diisi.');
    return;
  }

  try {
    await fetch(`${apiBase}/api/addTopic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, title, password })
    });
    document.getElementById('title').value = '';
    document.getElementById('password').value = '';
    loadTopics();
  } catch (err) {
    console.error('Gagal menambah topik:', err);
  }
}

async function deleteTopic(id) {
  const password = prompt('Masukkan password untuk hapus:');
  if (!password) return;

  try {
    const res = await fetch(`${apiBase}/api/deleteTopic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password })
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      loadTopics();
    }
  } catch (err) {
    console.error('Gagal menghapus topik:', err);
  }
}

// ====== KOMENTAR ======
async function loadComments() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;

  try {
    const res = await fetch(`${apiBase}/api/getComments?id=${id}`);
    const comments = await res.json();
    const container = document.getElementById('comments');
    if (!container) return;

    if (!Array.isArray(comments) || comments.length === 0) {
      container.innerHTML = `<p>Belum ada komentar.</p>`;
      return;
    }

    container.innerHTML = comments.map(c => `
      <div class="comment-card">
        <span>${escapeHTML(c.name)}</span>: ${escapeHTML(c.comment)}
      </div>
    `).join('');
  } catch (err) {
    console.error('Gagal memuat komentar:', err);
  }
}

async function addComment() {
  const params = new URLSearchParams(window.location.search);
  const topicId = params.get('id');
  const name = document.getElementById('name')?.value.trim();
  const comment = document.getElementById('comment')?.value.trim();

  if (!name || !comment) {
    alert('Nama dan komentar wajib diisi.');
    return;
  }

  try {
    await fetch(`${apiBase}/api/addComment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, name, comment })
    });
    document.getElementById('comment').value = '';
    loadComments();
  } catch (err) {
    console.error('Gagal menambah komentar:', err);
  }
}

// ====== INIT ======
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('topics')) {
    loadTopics();
    setInterval(loadTopics, 5000); // auto-refresh tiap 5 detik
  }
  if (document.getElementById('comments')) {
    loadComments();
    setInterval(loadComments, 5000); // auto-refresh tiap 5 detik
  }
});
