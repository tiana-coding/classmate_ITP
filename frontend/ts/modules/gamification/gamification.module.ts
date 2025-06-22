import { getBadges, Badge } from './badges/badges.module.js';
import { renderLeaderboard } from './leaderboard/leaderboard.module.js';

document.addEventListener('DOMContentLoaded', () => {
  loadGamificationData();
  renderLeaderboard();
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
    updatePointsDisplay({ points: 0, level: 5 });
    displayAchievements(5);
  }
}

function updatePointsDisplay(stats: any): void {
    const level = stats.level;
    const points = stats.points;
    const pointsInCurrentLevel = points % 100;
    const pointsToNextLevel = 100 - pointsInCurrentLevel;

    // Text-Updates
    document.getElementById('totalPoints')!.textContent       = points;
    document.getElementById('currentLevel')!.textContent      = level;
    document.getElementById('nextLevel')!.textContent         = (level + 1).toString();
    document.getElementById('pointsToNextLevel')!.textContent = pointsToNextLevel.toString();

    // Fortschrittsbalken
    const barEl = document.getElementById('levelProgress') as HTMLElement;
    barEl.style.width = `${pointsInCurrentLevel}%`;
    barEl.textContent = `${pointsInCurrentLevel}%`;

    // Zusätzliche Level-Anzeige über der Fortschrittsleiste
    const levelDisplay = document.getElementById('levelDisplay');
    if (levelDisplay) {
        levelDisplay.textContent = `Level ${level}`;
    }
}

function displayAchievements(currentLevel: number): void {
  const container = document.getElementById('achievementsList');
  if (!container) return;
  container.innerHTML = '';

  const badges: Badge[] = getBadges(currentLevel);
  badges.forEach(badge => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center justify-content-between';

    li.innerHTML = `
      <div class="d-flex align-items-center">
        <img src="${badge.unlocked ? badge.image : badge.lockedImage}" 
             alt="${badge.title}" 
             class="me-3" style="width: 50px; height: auto;" />
        <div>
          <h6 class="mb-1">${badge.title}</h6>
          <small class="text-muted">${badge.unlockMessage}</small>
        </div>
      </div>
      <i class="bi ${badge.unlocked ? 'bi-trophy-fill text-warning' : 'bi-trophy text-muted'} fs-4"></i>
    `;
    container.appendChild(li);
  });
}
