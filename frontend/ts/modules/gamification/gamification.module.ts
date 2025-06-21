import { getBadges, Badge } from './badges/badges.module.js';

document.addEventListener('DOMContentLoaded', () => {
    loadGamificationData();
});

async function loadGamificationData() {
    try {
        const statsResponse = await fetch('/api/gamification/stats', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!statsResponse.ok) throw new Error(`Status ${statsResponse.status}`);
        const stats = await statsResponse.json();
        updatePointsDisplay(stats);
        displayAchievements(stats.level);
    } catch (error) {
        console.warn('Stats-Fetch fehlgeschlagen, teste Anzeige mit Level 5:', error);
        // Fallback-Test-Level
        updatePointsDisplay({ points: 0, level: 5 });
        displayAchievements(5);
    }
}

function updatePointsDisplay(stats: any): void {
    document.getElementById('totalPoints')!.textContent       = stats.points;
    document.getElementById('currentLevel')!.textContent       = stats.level;
    document.getElementById('nextLevel')!.textContent          = (stats.level + 1).toString();

    const pointsInCurrentLevel = stats.points % 100;
    document.getElementById('pointsToNextLevel')!.textContent = (100 - pointsInCurrentLevel).toString();

    (document.getElementById('levelProgress') as HTMLElement)
      .style.width = `${pointsInCurrentLevel}%`;
}

function displayAchievements(currentLevel: number): void {
    const container = document.getElementById('achievementsList')!;
    container.innerHTML = '';

    const badges: Badge[] = getBadges(currentLevel);
    badges.forEach(badge => {
        const col = document.createElement('div');
        col.className = 'col-md-2 col-sm-4 text-center';

        const img = document.createElement('img');
        img.src       = badge.unlocked ? badge.image : badge.lockedImage;
        img.alt       = badge.title;
        img.title     = badge.unlockMessage;
        img.className = 'img-fluid';

        col.append(img);
        container.append(col);
    });
}

function showError(message: string): void {
    const container = document.querySelector('.container')!;
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `${message}<button type='button' class='btn-close' data-bs-dismiss='alert'></button>`;
    container.prepend(alert);
}
