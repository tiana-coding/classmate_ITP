// frontend/ts/modules/forum/forum.module.ts
import { Modal } from 'bootstrap';

interface Comment {
  author: string;
  text: string;
  createdAt: string;
}

interface Post {
  id: number;
  title: string;
  details: string;
  tags: string[];
  imageUrl: string | null;
  createdAt: string;
  likes: number;
  comments: Comment[];
}

let allPosts: Post[] = [];

document.addEventListener('DOMContentLoaded', () => {
  initForm();
  initSearchAndSort();
  loadPosts();
});

function initForm() {
  const form = document.getElementById('questionForm') as HTMLFormElement;
  form.addEventListener('submit', handleNewPost);

  // Modal schließen-Helfer
  const modalEl = document.getElementById('newQuestionModal')!;
  // Bootstrap Modal-Instanz anlegen, damit wir es programmatisch schließen können
  form.dataset.bsTarget = 'newQuestionModal';
  (modalEl as any)._modal = new Modal(modalEl);
}

function initSearchAndSort() {
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  searchInput.addEventListener('input', applyFilters);

  const sortSelect = document.getElementById('sortSelect') as HTMLSelectElement;
  sortSelect.addEventListener('change', applyFilters);
}

async function loadPosts() {
  try {
    const res = await fetch('/api/posts');
    if (!res.ok) throw new Error(`Status ${res.status}`);
    allPosts = await res.json();
    applyFilters();
  } catch (err) {
    console.error('Fehler beim Laden der Posts:', err);
  }
}

function applyFilters() {
  const term = (document.getElementById('searchInput') as HTMLInputElement).value.trim().toLowerCase();
  let filtered = allPosts.filter(p =>
    p.title.toLowerCase().includes(term) ||
    p.details.toLowerCase().includes(term) ||
    p.tags.some(t => t.toLowerCase().includes(term))
  );

  const sortValue = (document.getElementById('sortSelect') as HTMLSelectElement).value;
  if (sortValue === 'newest') {
    filtered.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortValue === 'popular') {
    filtered.sort((a,b) => b.likes - a.likes);
  }
  // 'unanswered' könnte man später über comments.length === 0 filtern

  renderPosts(filtered);
}

function renderPosts(posts: Post[]) {
  const container = document.getElementById('questionsContainer')!;
  container.innerHTML = posts.length
    ? posts.map(p => postToHtml(p)).join('')
    : `<p class="text-white">Keine Fragen gefunden.</p>`;
  bindPostEvents();
}

function postToHtml(p: Post): string {
  const commentsHtml = p.comments.map(c => `
    <div class="border-top pt-1">
      <strong>${escapeHtml(c.author)}</strong>: ${escapeHtml(c.text)}<br>
      <small class="text-muted">${new Date(c.createdAt).toLocaleTimeString()}</small>
    </div>
  `).join('');

  return `
    <div class="card mb-3 text-dark">
      <div class="card-body">
        <h5 class="card-title">${escapeHtml(p.title)}</h5>
        <p class="card-text">${escapeHtml(p.details)}</p>
        ${p.imageUrl ? `<img src="${p.imageUrl}" class="img-fluid mb-2"/>` : ''}
        <p class="card-text"><small class="text-muted">${new Date(p.createdAt).toLocaleString()}</small></p>
        <p class="card-text"><small class="text-muted">Tags: ${p.tags.map(t=>escapeHtml(t)).join(', ')}</small></p>

        <button class="btn btn-sm btn-outline-warning me-3 like-btn" data-id="${p.id}">
          👍 <span class="like-count">${p.likes}</span>
        </button>

        <div class="mb-2 comment-list">${commentsHtml}</div>

        <form class="comment-form" data-id="${p.id}">
          <div class="input-group input-group-sm">
            <input type="text" class="form-control comment-input" placeholder="Kommentar…">
            <button class="btn btn-sm btn-warning">Posten</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function bindPostEvents() {
  document.querySelectorAll<HTMLButtonElement>('.like-btn')
    .forEach(btn => btn.addEventListener('click', handleLike));

  document.querySelectorAll<HTMLFormElement>('.comment-form')
    .forEach(f => f.addEventListener('submit', handleComment));
}

async function handleNewPost(e: Event) {
  e.preventDefault();
  const form = e.currentTarget as HTMLFormElement;
  const data = new FormData(form);
  try {
    const res = await fetch('/api/posts', { method: 'POST', body: data });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    form.reset();
    (document.getElementById('newQuestionModal')! as any)._modal.hide();
    loadPosts();
  } catch (err) {
    console.error('Fehler beim Erstellen des Posts:', err);
  }
}

async function handleLike(e: Event) {
  const btn = e.currentTarget as HTMLButtonElement;
  const id = btn.dataset.id!;
  try {
    const res = await fetch(`/api/posts/${id}/like`, { method: 'PUT' });
    if (!res.ok) throw new Error(res.statusText);
    const { likes } = await res.json();
    btn.querySelector('.like-count')!.textContent = String(likes);
  } catch (err) {
    console.error('Like fehlgeschlagen:', err);
  }
}

async function handleComment(e: Event) {
  e.preventDefault();
  const form = e.currentTarget as HTMLFormElement;
  const id = form.dataset.id!;
  const input = form.querySelector<HTMLInputElement>('.comment-input')!;
  const text = input.value.trim();
  if (!text) return;
  try {
    const res = await fetch(`/api/posts/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: 'Ich', text })
    });
    if (!res.ok) throw new Error(res.statusText);
    input.value = '';
    loadPosts();
  } catch (err) {
    console.error('Kommentar fehlgeschlagen:', err);
  }
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"]+/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  } as any)[tag] || tag);
}
