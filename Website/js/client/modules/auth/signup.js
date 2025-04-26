"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup');
    if (!form)
        return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirmPassword').value;
        if (!username || !email || !password) {
            alert('Bitte alle Felder ausfüllen');
            return;
        }
        if (password !== confirm) {
            alert('Passwörter stimmen nicht überein');
            return;
        }
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password, role: 'student' })
            });
            console.log('Response Register:', res.status, await res.json());
            if (!res.ok) {
                const err = await res.json();
                alert('Registrierung fehlgeschlagen:\n' + (err.error || res.statusText));
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
