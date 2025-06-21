console.log('🔧 forum.module geladen');

declare const bootstrap: any;

interface Post {
  id: number;
  title: string;
  details: string;
  tags: string[];
  imageUrl: string | null;
  createdAt: string;
}

let allPosts: Post[] = [];

// Entry point
document.addEventListener('DOMContentLoaded', () => {
  const questionForm = document.getElementById('questionForm') as HTMLFormElement;
  questionForm.addEventListener('submit', handleSubmit);

  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  searchInput.addEventListener('input', handleSearch);

  const sortSelect = document.getElementById('sortSelect') as HTMLSelectElement;
  sortSelect.addEventListener('change', applyFilters);

  loadPosts();
});

/** Lade alle Posts vom Server */
async function loadPosts() {
  try {
    const response = await fetch('/api/posts');
    if (!response.ok) throw new Error(`Status ${response.status}`);
    allPosts = await response.json();
    applyFilters();
  } catch (error) {
    console.error('Fehler beim Laden der Posts:', error);
  }
}

/** Filter (Search + Sort) anwenden und rendern */
function applyFilters() {
  const searchTerm = (document.getElementById('searchInput') as HTMLInputElement).value.trim().toLowerCase();
  let filtered = allPosts.filter(post => {
    return (
      post.title.toLowerCase().includes(searchTerm) ||
      post.details.toLowerCase().includes(searchTerm) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  });

  const sortValue = (document.getElementById('sortSelect') as HTMLSelectElement).value;
  if (sortValue === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  // Weitere Sortierungen (beliebteste, unbeantwortet) können hier ergänzt werden

  renderPosts(filtered);
}

/** Rendert die gegebene Liste von Posts in den Container */
function renderPosts(posts: Post[]) {
  const container = document.getElementById('questionsContainer')!;
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
        <h5 class="card-title">${escapeHtml(post.title)}</h5>
        <p class="card-text">${escapeHtml(post.details)}</p>
        ${post.imageUrl ? `<img src="${post.imageUrl}" class="img-fluid mb-2"/>` : ''}
        <p class="card-text"><small class="text-muted">${new Date(post.createdAt).toLocaleString()}</small></p>
        <p class="card-text"><small class="text-muted">Tags: ${post.tags.map(t => escapeHtml(t)).join(', ')}</small></p>
      </div>
    `;
    container.appendChild(card);
  });
}

/** Formularabsendung: Neuer Post */
async function handleSubmit(event: Event) {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const data = new FormData(form);

  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      body: data
    });
    if (!response.ok) throw new Error(`Status ${response.status}`);

    form.reset();
    hideModal();
    loadPosts();
  } catch (error) {
    console.error('Fehler beim Erstellen des Posts:', error);
  }
}

/** Schließt das Bootstrap-Modal */
function hideModal() {
  const modalEl = document.getElementById('newQuestionModal')!;
  const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
  modal.hide();
}

/** Suche-Handler */
function handleSearch(_event: Event) {
  applyFilters();
}

/** Hilfsfunktion zum Escapen von HTML in Strings */
function escapeHtml(str: string): string {
  return str.replace(/[&<>"]+/g, tag => {
    const chars: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    };
    return chars[tag] || tag;
  });
}
