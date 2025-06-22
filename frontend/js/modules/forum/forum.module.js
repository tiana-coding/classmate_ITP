"use strict";
// frontend/ts/modules/forum/forum.module.ts
console.log('🔧 forum.module geladen');
// Wenn du über Live-Server (Port 5500) entwickelst, sonst leer lassen:
const API_BASE = location.origin.includes('5500')
    ? 'http://localhost:3000'
    : '';
let allPosts = [];
// Entry‐Point
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('questionForm')
        .addEventListener('submit', handleNewPost);
    document.getElementById('searchInput')
        .addEventListener('input', applyFilters);
    document.getElementById('sortSelect')
        .addEventListener('change', applyFilters);
    loadPosts();
});
/** Alle Posts vom Backend holen */
async function loadPosts() {
    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        if (!res.ok)
            throw new Error(`Status ${res.status}`);
        const raw = await res.json();
        allPosts = raw.map((p) => ({
            id: p.id,
            title: p.title,
            details: p.details,
            tags: Array.isArray(p.tags) ? p.tags : [],
            imageUrl: p.imageUrl ?? null,
            createdAt: p.createdAt,
            likes: typeof p.likes === 'number' ? p.likes : 0,
            comments: Array.isArray(p.comments) ? p.comments : []
        }));
        applyFilters();
    }
    catch (err) {
        console.error('Fehler beim Laden der Posts:', err);
    }
}
/** Filter- und Sort-Logik */
function applyFilters() {
    const term = document.getElementById('searchInput')
        .value
        .toLowerCase()
        .trim();
    let filtered = allPosts.filter(p => p.title.toLowerCase().includes(term) ||
        p.details.toLowerCase().includes(term) ||
        p.tags.some(t => t.toLowerCase().includes(term)));
    const sort = document.getElementById('sortSelect').value;
    if (sort === 'newest') {
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    renderPosts(filtered);
}
/** Anzeige aller Posts */
function renderPosts(posts) {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    if (posts.length === 0) {
        container.innerHTML = '<p class="text-white">Keine Fragen gefunden.</p>';
        return;
    }
    posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'card mb-3';
        card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${escape(post.title)}</h5>
        <p class="card-text">${escape(post.details)}</p>
        ${post.imageUrl ? `<img src="${post.imageUrl}" class="img-fluid mb-2"/>` : ''}
        <p class="card-text"><small class="text-muted">${new Date(post.createdAt).toLocaleString()}</small></p>
        <p class="card-text"><small class="text-muted">Tags: ${post.tags.map(t => escape(t)).join(', ')}</small></p>
        <div class="d-flex align-items-center gap-2 mb-2">
          <button class="btn btn-sm btn-light like-btn" data-id="${post.id}">
            👍 <span class="like-count">${post.likes}</span>
          </button>
          <button class="btn btn-sm btn-light comment-btn" data-id="${post.id}">
            💬 <span class="comment-count">${post.comments.length}</span>
          </button>
        </div>
        <div class="comments-list mb-2"></div>
        <div class="comment-form d-none mb-2">
          <input type="text" class="form-control comment-input mb-2" placeholder="Deinen Kommentar…"/>
          <button class="btn btn-sm btn-warning submit-comment-btn" data-id="${post.id}">
            Kommentar abgeben
          </button>
        </div>
      </div>
    `;
        // Event-Listener
        card.querySelector('.like-btn')
            .addEventListener('click', handleLike);
        card.querySelector('.comment-btn')
            .addEventListener('click', toggleCommentForm);
        card.querySelector('.submit-comment-btn')
            .addEventListener('click', submitComment);
        // bereits vorhandene Kommentare darstellen
        renderComments(post, card.querySelector('.comments-list'));
        container.appendChild(card);
    });
}
/** Like-Handler */
async function handleLike(e) {
    const btn = e.currentTarget;
    const id = btn.dataset.id;
    try {
        const res = await fetch(`${API_BASE}/api/posts/${id}/like`, { method: 'PUT' });
        if (!res.ok)
            throw new Error();
        const { likes } = await res.json();
        btn.querySelector('.like-count').textContent = likes.toString();
        // lokal synchronisieren
        const post = allPosts.find(p => p.id === +id);
        post.likes = likes;
    }
    catch {
        console.error('Like fehlgeschlagen');
    }
}
/** Kommentar-Form ein/ausschalten */
function toggleCommentForm(e) {
    const btn = e.currentTarget;
    const form = btn.closest('.card-body').querySelector('.comment-form');
    form.classList.toggle('d-none');
}
/** Kommentar absenden */
async function submitComment(e) {
    const btn = e.currentTarget;
    const id = btn.dataset.id;
    const cardBody = btn.closest('.card-body');
    const input = cardBody.querySelector('.comment-input');
    const text = input.value.trim();
    if (!text)
        return;
    try {
        const res = await fetch(`${API_BASE}/api/posts/${id}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (!res.ok)
            throw new Error();
        const comment = await res.json();
        // UI updaten
        const post = allPosts.find(p => p.id === +id);
        post.comments.push(comment);
        cardBody.querySelector('.comment-count').textContent = post.comments.length.toString();
        renderComments(post, cardBody.querySelector('.comments-list'));
        input.value = '';
    }
    catch {
        console.error('Kommentar fehlgeschlagen');
    }
}
/** Kommentare rendern */
function renderComments(post, listEl) {
    listEl.innerHTML = '';
    post.comments.forEach(c => {
        const div = document.createElement('div');
        div.className = 'border-top pt-2 mb-2';
        div.innerHTML = `
      <p class="mb-1"><strong>${escape(c.author)}</strong>
        <small class="text-muted">${new Date(c.createdAt).toLocaleTimeString()}</small>
      </p>
      <p>${escape(c.text)}</p>
    `;
        listEl.appendChild(div);
    });
}
/** Neuer Post-Handler */
async function handleNewPost(evt) {
    evt.preventDefault();
    const form = document.getElementById('questionForm');
    const data = new FormData(form);
    try {
        const res = await fetch(`${API_BASE}/api/posts`, {
            method: 'POST',
            body: data
        });
        if (!res.ok)
            throw new Error();
        form.reset();
        hideModal();
        loadPosts();
    }
    catch {
        console.error('Post fehlgeschlagen');
    }
}
/** Modal schließen */
function hideModal() {
    const el = document.getElementById('newQuestionModal');
    const m = bootstrap.Modal.getInstance(el) || new bootstrap.Modal(el);
    m.hide();
}
/** Einfaches HTML-Escaping */
function escape(s) {
    return s.replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}
