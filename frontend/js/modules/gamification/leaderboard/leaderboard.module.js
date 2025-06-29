export async function renderLeaderboard() {
    try {
        const response = await fetch('/api/gamification/leaderboard');
        if (!response.ok)
            throw new Error('Fehler beim Abrufen der Rangliste');
        const users = await response.json();
        const list = document.getElementById('leaderboardList');
        if (!list) {
            console.warn('⚠️ Kein Container mit ID "leaderboardList" gefunden.');
            return;
        }
        // Sortierung: Höchste Punktzahl zuerst
        users.sort((a, b) => b.points - a.points);
        // Liste leeren und befüllen
        list.innerHTML = '';
        users.forEach((user, index) => {
            const item = document.createElement('li');
            item.className = 'list-group-item d-flex justify-content-between align-items-center';
            item.innerHTML = `
        <span><strong>${index + 1}.</strong> ${user.name}</span>
        <span class="badge bg-primary rounded-pill">${user.points} XP</span>
      `;
            list.appendChild(item);
        });
    }
    catch (err) {
        console.error('🔴 Fehler beim Anzeigen der Rangliste:', err);
    }
}
