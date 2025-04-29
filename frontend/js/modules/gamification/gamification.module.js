document.addEventListener('DOMContentLoaded', () => {
    loadGamificationData();
    initializeTemplates();
});

async function loadGamificationData() {
    try {
        // Load user stats
        const statsResponse = await fetch('/api/gamification/stats', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        const stats = await statsResponse.json();
        updatePointsDisplay(stats);

        // Load recent activities
        const activitiesResponse = await fetch('/api/gamification/activities?limit=5', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        const activities = await activitiesResponse.json();
        displayActivities(activities);

        // Load achievements
        const achievementsResponse = await fetch('/api/gamification/achievements', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        const achievements = await achievementsResponse.json();
        displayAchievements(achievements);

    } catch (error) {
        console.error('Error loading gamification data:', error);
        showError('Fehler beim Laden der Daten');
    }
}

function updatePointsDisplay(stats) {
    document.getElementById('totalPoints').textContent = stats.points;
    document.getElementById('currentLevel').textContent = stats.level;
    document.getElementById('nextLevel').textContent = stats.level + 1;
    
    const pointsInCurrentLevel = stats.points % 100;
    const pointsToNextLevel = 100 - pointsInCurrentLevel;
    document.getElementById('pointsToNextLevel').textContent = pointsToNextLevel;
    
    const progressPercentage = pointsInCurrentLevel + '%';
    document.getElementById('levelProgress').style.width = progressPercentage;
}

function displayActivities(activities) {
    const template = document.getElementById('activityTemplate');
    const container = document.createElement('div');
    container.className = 'list-group list-group-flush';

    activities.forEach(activity => {
        const activityElement = template.content.cloneNode(true);
        activityElement.querySelector('h6').textContent = activity.description;
        activityElement.querySelector('small').textContent = formatDate(activity.date);
        activityElement.querySelector('.badge').textContent = `+${activity.points} XP`;
        container.appendChild(activityElement);
    });

    // Replace loading spinner with activities
    const achievementsList = document.getElementById('achievementsList');
    achievementsList.innerHTML = '';
    achievementsList.appendChild(container);
}

function displayAchievements(achievements) {
    const achievementsList = document.getElementById('achievementsList');
    achievementsList.innerHTML = achievements.map(achievement => `
        <div class="col-md-3 col-sm-6">
            <div class="card ${achievement.unlocked ? 'border-warning' : 'bg-light'} h-100">
                <div class="card-body text-center">
                    <i class="bi bi-${achievement.icon} fs-1 ${achievement.unlocked ? 'text-warning' : 'text-muted'}"></i>
                    <h6 class="card-title mt-3">${achievement.title}</h6>
                    <p class="card-text small">${achievement.description}</p>
                    ${achievement.unlocked ? 
                        `<span class="badge bg-warning">+${achievement.points} XP</span>` : 
                        `<span class="badge bg-secondary">Gesperrt</span>`}
                </div>
            </div>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Heute';
    } else if (diffDays === 1) {
        return 'Gestern';
    } else if (diffDays < 7) {
        return `Vor ${diffDays} Tagen`;
    } else {
        return date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

function showError(message) {
    const container = document.querySelector('.container');
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    container.insertBefore(alert, container.firstChild);
}