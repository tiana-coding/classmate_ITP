import { checkAuth } from '../../utils/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
});

async function loadProgress() {
    const token = checkAuth();
    if (!token) return;

    showLoading(true);

    try {
        const res = await fetch('/api/user/progress', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            if (res.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Failed to fetch progress');
        }

        const data = await res.json();
        updateProgressStats(data);
        displayCompletedTasks(data.completedTasks);
    } catch (error) {
        console.error('Error loading progress:', error);
        showAlert('Fehler beim Laden des Fortschritts', 'danger');
    } finally {
        showLoading(false);
    }
}

function updateProgressStats(data) {
    document.getElementById('totalTasks').textContent = data.completedTasks.length;
    document.getElementById('totalPoints').textContent = data.totalPoints;
    document.getElementById('completionRate').textContent = 
        `${Math.round((data.completedTasks.length / data.totalTasks) * 100)}%`;
}

function displayCompletedTasks(tasks) {
    const container = document.getElementById('completedTasksList');
    
    if (!tasks.length) {
        container.innerHTML = '<p class="text-center">Noch keine Aufgaben erledigt</p>';
        return;
    }

    const tasksList = tasks.map(task => `
        <div class="task-item mb-3 p-3 border rounded">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-1">${task.title}</h5>
                    <p class="mb-1 text-muted">${task.description}</p>
                    <small class="text-success">
                        <i class="bi bi-calendar-check"></i> 
                        Abgeschlossen am: ${formatDate(task.completedAt)}
                    </small>
                </div>
                <div>
                    <span class="badge bg-success">
                        <i class="bi bi-star-fill"></i> ${task.points} XP
                    </span>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = tasksList;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    loader.classList.toggle('d-none', !show);
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.row'));
    
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 5000);
}
