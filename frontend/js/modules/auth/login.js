"use strict";

// Add API health check function
const API_BASE_URL = 'http://localhost:3000'; // zentrale Definition

async function checkApiHealth() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/health`);
        if (res.ok) {
            console.log('API is running');
            return true;
        }
        console.error('API is not responding properly');
        return false;
    } catch (err) {
        console.error('API is not available:', err);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('login');
    if (!form) return;

    // Check API health when page loads
    const isApiRunning = await checkApiHealth();
    if (!isApiRunning) {
        alert('API-Server ist nicht erreichbar. Bitte versuchen Sie es später erneut.');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password })
            });

            const data = await res.json();
            console.log('Response Login:', res.status, data);

            if (!res.ok) {
                alert('Login fehlgeschlagen:\n' + (data.error || res.statusText));
                return;
            }

            localStorage.setItem('authToken', data.token);
            alert('Login erfolgreich!');
            window.location.href = 'dashboard.html';
        }
        catch (err) {
            console.error('Netzwerkfehler beim Login', err);
            alert('Netzwerkfehler beim Login');
        }
    });
});
