"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup');
    if (!(form instanceof HTMLFormElement))
        return;
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    // Null‐Checks und konkrete Typisierung
    if (!(nameInput instanceof HTMLInputElement) ||
        !(emailInput instanceof HTMLInputElement) ||
        !(passwordInput instanceof HTMLInputElement) ||
        !(confirmPasswordInput instanceof HTMLInputElement)) {
        console.error('Form inputs not found or of wrong type');
        return;
    }
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        if (!username || !email || !password) {
            alert('Bitte alle Felder ausfüllen');
            return;
        }
        if (password !== confirmPassword) {
            alert('Passwörter stimmen nicht überein');
            return;
        }
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password, role: 'student' })
            });
            const data = await res.json();
            console.log('Response Register:', res.status, data);
            if (!res.ok) {
                alert('Registrierung fehlgeschlagen:\n' + (data.error || res.statusText));
                return;
            }
            alert('Registrierung erfolgreich – bitte jetzt einloggen');
            window.location.href = 'login.html';
        }
        catch (err) {
            console.error('Netzwerkfehler bei der Registrierung', err);
            alert('Netzwerkfehler bei der Registrierung');
        }
    });
});
