"use strict";
// Beispiel User-Daten
let users = [
    { id: 'user01', name: 'student01', points: 10, classID: 'A' },
    { id: 'user02', name: 'student02', points: 15, classID: 'A' },
    { id: 'user03', name: 'student03', points: 5, classID: 'B' },
    { id: 'user02', name: 'student04', points: 0, classID: 'B' }
];
//Beispiel-Aufgaben
let tasks = [
    {
        id: 'task1',
        title: 'Web Übung9',
        deadline: new Date('2025-05-07'),
        submissions: []
    },
    {
        id: 'task2',
        title: 'AlgoDat Aufgabe 3',
        deadline: new Date('2025-05-27'),
        submissions: []
    },
    {
        id: 'task3',
        title: 'Abgabe Projektarbeit',
        deadline: new Date('2025-06-14'),
        submissions: []
    }
];
// Punkte berechnen
function calculatePoints(deadline, submissionTime) {
    const base = 10;
    const earlyBonus = submissionTime < deadline ? 5 : 0;
    return base + earlyBonus;
}
// Abgabe der Aufgabe 
function submitTask(user, task, submissionTime) {
    // Validierung -> keine doppelten Abgaben oder keine Einreichung der Aufgaben nach Deadline
    if (submissionTime > task.deadline) {
        alert('Die Deadline für diese Aufgabe ist bereits abgelaufen!');
        return;
    }
    const points = calculatePoints(task.deadline, submissionTime);
    user.points += points;
    // Abgabe in Task-Objet einfügen
    task.submissions.push({ userID: user.id, timestamp: submissionTime });
    // Feedback anzeigen, Rangliste nach Abgabe updaten & Benutzerdaten speichern
    showFeedback(user, task, points);
    renderLeaderBoard(users);
    saveData(users);
}
// Feedback anzeigen
function showFeedback(user, task, points) {
    const feedbackContainer = document.createElement('div');
    feedbackContainer.classList.add('feedback');
    if (points > 0) {
        feedbackContainer.innerHTML = `<p>${user.name} hat die Aufgabe '${task.title}' abgegeben und ${points} Punkte erhalten!</p>`;
    }
    else {
        feedbackContainer.innerHTML = `<p>${user.name} konnte die Aufgabe '${task.title}' nicht abgeben, da die Deadline bereits abgelaufen ist!</p>`;
    }
    document.body.appendChild(feedbackContainer);
    // Feedback nach 3 Sekunden entfernen
    setTimeout(() => {
        feedbackContainer.remove();
    }, 3000);
}
// Rangliste anzeigen
function renderLeaderBoard(userList) {
    const board = document.getElementById('leaderboard');
    // alte Rangliste leeren
    board.innerHTML = '';
    // Benutzer nach Punkten sortieren
    userList.sort((a, b) => b.points - a.points)
        .forEach((u, i) => {
        const listItem = document.createElement('li');
        // Level für Benutzer berechnen
        const userLevel = calculateLevel(u);
        // Level in die Rangliste einfügen
        listItem.textContent = `${i + 1}. ${u.name} (Level ${userLevel}) - ${u.points} Punkte`;
        board.appendChild(listItem);
    });
}
// Level berechnen
function calculateLevel(user) {
    // Hoher Rang
    if (user.points >= 100) {
        return 3;
    }
    // Mittlerer Rang
    else if (user.points >= 50) {
        return 2;
    }
    else {
        // Niedriger Rang
        return 1;
    }
}
// Punkte manuell hinzufügen
function addPoints(userID) {
    const user = users.find((u) => u.id === userID);
    if (user) {
        user.points += 5;
        // Anzeige der Bestätigung
        alert(`${user.name} hat 5 Punkte erhalten!`);
        // Update der Rangliste & Daten
        renderLeaderBoard(users);
        saveData(users);
    }
}
// Buttons für Punkte dynamisch erstellen
function createPointsButtons() {
    const container = document.getElementById('point-buttons');
    container.innerHTML = '';
    users.forEach(user => {
        const button = document.createElement('button');
        button.textContent = `+5 Punkte für ${user.name}`;
        button.onclick = () => addPoints(user.id);
        container.appendChild(button);
    });
}
// Aufgaben dynamisch anzeigen
function displayTask() {
    const taskContainer = document.getElementById('tasks-list');
    taskContainer.innerHTML = '';
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task-item');
        // Abgabe-Button für jede Aufgabe dynamisch erstellen
        taskElement.innerHTML = `
            <h3>${task.title}</h3>
            <p>Deadline: ${task.deadline.toLocaleDateString()}</p>
        `;
        // Buttons für jeden Benutzer dynamisch erstellen
        users.forEach(user => {
            const submitButton = document.createElement('button');
            submitButton.textContent = `Abgabe von ${user.name}`;
            // submitTask-Aufruf muss den richtigen Benutzer und die Aufgabe übergeben
            submitButton.onclick = function () {
                submitTask(user, task, new Date());
            };
            taskElement.appendChild(submitButton);
        });
        taskContainer.appendChild(taskElement);
    });
}
function resetAllData() {
    // Sicherheitsabfrage 
    if (!confirm("Möchtest du wirklich alle Daten zurücksetzen?")) {
        return;
    }
    // Punkte aller User zurücksetzen
    users.forEach(user => user.points = 0);
    // Alle Abgaben löschen
    tasks.forEach(task => task.submissions = []);
    // Local Storage leeren
    localStorage.removeItem('users');
    // Daten neu speichern, damit 0-Punkte gespeichert sind
    saveData(users);
    // UI neu aufbauen
    renderLeaderBoard(users);
    createPointsButtons();
    displayTask();
    alert("Alle Daten wurden erfolgreich zurückgesetzt.");
}
// Benutzerdaten speichern
function saveData(userList) {
    localStorage.setItem('users', JSON.stringify(userList));
}
// Daten laden
function loadData() {
    const data = localStorage.getItem('users');
    return data ? JSON.parse(data) : [];
}
// Initialisierung
users = loadData().length > 0 ? loadData() : users;
renderLeaderBoard(users);
createPointsButtons();
displayTask();
