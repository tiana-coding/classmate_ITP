class CalendarComponent {
    constructor() {
        this.calendar = null;
        this.events = [];
    }

    init() {
        this.initializeCalendar();
        this.initializeEventForm();
    }

    initializeCalendar() {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;

        this.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'de',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
            },
            eventClick: (info) => this.handleEventClick(info.event),
            eventDidMount: (info) => {
                new bootstrap.Tooltip(info.el, {
                    title: info.event.extendedProps.description || 'Keine Beschreibung',
                    placement: 'top',
                    trigger: 'hover',
                    container: 'body'
                });
            }
        });

        this.calendar.render();
        this.loadEvents();
    }

    initializeEventForm() {
        const addButton = document.getElementById('addEvent');
        if (!addButton) return;

        addButton.addEventListener('click', async (e) => {
            e.preventDefault();
            await this.handleAddEvent();
        });
    }

    async handleAddEvent() {
        const title = document.getElementById('title')?.value;
        const date = document.getElementById('date')?.value;
        const desc = document.getElementById('desc')?.value;

        if (!title || !date) {
            this.showAlert('Bitte fülle alle Pflichtfelder aus.', 'danger');
            return;
        }

        try {
            const response = await fetch('/api/calendar/events', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ title, date, description: desc })
            });

            if (!response.ok) throw new Error('Failed to add event');

            const newEvent = await response.json();
            this.calendar.addEvent({
                title: newEvent.title,
                start: newEvent.date,
                description: newEvent.description,
                id: newEvent.id
            });

            this.resetForm();
            this.showAlert('Event erfolgreich hinzugefügt!', 'success');

        } catch (error) {
            console.error('Error adding event:', error);
            this.showAlert('Fehler beim Hinzufügen des Events.', 'danger');
        }
    }

    async loadEvents() {
        try {
            const response = await fetch('/api/calendar/events', {
                headers: this.getHeaders()
            });

            if (!response.ok) throw new Error('Failed to load events');

            this.events = await response.json();
            this.events.forEach(event => {
                this.calendar.addEvent({
                    title: event.title,
                    start: event.date,
                    description: event.description,
                    id: event.id
                });
            });

        } catch (error) {
            console.error('Error loading events:', error);
            this.showAlert('Fehler beim Laden der Events.', 'danger');
        }
    }

    handleEventClick(event) {
        if (confirm(`Möchtest du "${event.title}" löschen?`)) {
            this.deleteEvent(event);
        }
    }

    async deleteEvent(event) {
        try {
            const response = await fetch(`/api/calendar/events/${event.id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (!response.ok) throw new Error('Failed to delete event');

            event.remove();
            this.showAlert('Event erfolgreich gelöscht!', 'success');

        } catch (error) {
            console.error('Error deleting event:', error);
            this.showAlert('Fehler beim Löschen des Events.', 'danger');
        }
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        };
    }

    resetForm() {
        ['title', 'date', 'desc'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const cardBody = document.querySelector('.card-body');
        const form = document.getElementById('form');
        if (cardBody && form) {
            cardBody.insertBefore(alertDiv, form);
            
            setTimeout(() => {
                alertDiv.classList.remove('show');
                setTimeout(() => alertDiv.remove(), 150);
            }, 3000);
        }
    }
}

// Initialize the calendar component
const calendarComponent = new CalendarComponent();
document.addEventListener('DOMContentLoaded', () => calendarComponent.init());

export { calendarComponent };