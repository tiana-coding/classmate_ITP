import { initializeCalendar } from './calendar.module.js';

let calendar;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize empty calendar
    calendar = initializeCalendar();
    
    // Load tasks and update calendar
    await loadTasks();
});

async function loadTasks() {
    try {
        const response = await fetch('/api/tasks', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load tasks');
        
        const tasks = await response.json();
        
        // Update calendar with tasks
        if (calendar) {
            calendar.removeAllEvents();
            tasks.forEach(task => {
                calendar.addEvent({
                    title: task.title,
                    start: task.dueDate,
                    description: task.description,
                    className: task.completed ? 'bg-success' : 'bg-warning'
                });
            });
        }

        // Update tasks grid
        updateTasksGrid(tasks);

    } catch (error) {
        console.error('Error loading tasks:', error);
        showError('Fehler beim Laden der Aufgaben');
    }
}

function updateTasksGrid(tasks) {
    const tasksGrid = document.getElementById('tasksGrid');
    tasksGrid.innerHTML = tasks.map(task => `
        <div class="col-md-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${task.title}</h5>
                    <p class="card-text">${task.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">Hochgeladen: ${formatDate(task.uploadDate)}</small>
                        <a href="${task.fileUrl}" class="btn btn-sm btn-warning" download>
                            <i class="bi bi-download"></i> Download
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `).join('') || '<div class="col-12 text-center text-white">Keine Aufgaben vorhanden</div>';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.innerHTML = message;
    document.querySelector('.container').insertBefore(errorDiv, document.querySelector('.row'));
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        errorDiv.classList.remove('show');
        setTimeout(() => errorDiv.remove(), 150);
    }, 5000);
}