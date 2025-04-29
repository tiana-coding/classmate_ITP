export class DashboardModule {
    constructor() {
        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        this.createClassForm = document.getElementById('createClassForm');
        this.joinClassForm = document.getElementById('joinClassForm');
        this.classesContainer = document.getElementById('classesContainer');
        this.userName = document.getElementById('userName');
    }

    initEventListeners() {
        this.createClassForm?.addEventListener('submit', this.handleCreateClass.bind(this));
        this.joinClassForm?.addEventListener('submit', this.handleJoinClass.bind(this));
        this.initTooltips();
    }

    initTooltips() {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].map(el => new bootstrap.Tooltip(el));
    }

    async handleCreateClass(event) {
        event.preventDefault();
        const formData = new FormData(this.createClassForm);
        try {
            const response = await this.createClass({
                name: formData.get('className'),
                description: formData.get('classDescription')
            });
            if (response.ok) {
                bootstrap.Modal.getInstance(document.getElementById('createClassModal')).hide();
                this.loadClasses(); // Reload classes after creation
                this.createClassForm.reset();
            }
        } catch (error) {
            console.error('Error creating class:', error);
        }
    }

    async handleJoinClass(event) {
        event.preventDefault();
        const formData = new FormData(this.joinClassForm);
        try {
            const response = await this.joinClass(formData.get('classCode'));
            if (response.ok) {
                bootstrap.Modal.getInstance(document.getElementById('joinClassModal')).hide();
                this.loadClasses(); // Reload classes after joining
                this.joinClassForm.reset();
            }
        } catch (error) {
            console.error('Error joining class:', error);
        }
    }

    async createClass(classData) {
        // TODO: Implement API call to create class
        return await fetch('/api/classes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(classData)
        });
    }

    async joinClass(classCode) {
        // TODO: Implement API call to join class
        return await fetch('/api/classes/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: classCode })
        });
    }

    async loadClasses() {
        try {
            // TODO: Implement API call to get classes
            const response = await fetch('/api/classes');
            const classes = await response.json();
            this.renderClasses(classes);
        } catch (error) {
            console.error('Error loading classes:', error);
        }
    }

    renderClasses(classes) {
        this.classesContainer.innerHTML = classes.map(classItem => `
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${classItem.name}</h5>
                        <p class="card-text">${classItem.description}</p>
                        <a href="/class/${classItem.id}" class="btn btn-warning">
                            <i class="bi bi-arrow-right"></i> Öffnen
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Initialize the dashboard when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    new DashboardModule();
});