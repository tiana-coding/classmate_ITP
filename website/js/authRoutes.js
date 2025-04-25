// Endpunkte für Login & Registrierung
import express from 'express';
// Authentifizierungsrouten
const router = express.Router();
// Daten für Benutzer aus der Datenbank
const users = [
    { email: 'user@example.com', password: 'password' }
];
// Signup Route
router.post('/signup', (req, res) => {
    const { email, password } = req.body;
    // Überprüfen, ob der Benutzer bereits existiert
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'Benutzer existiert bereits' });
    }
    // Benutzer in der "Datenbank" speichern (in diesem Fall im Array)
    const newUser = { email, password };
    users.push(newUser);
    // Session für den Benutzer erstellen
    req.session.user = newUser; // Session wird erstellt
    return res.status(201).json({ message: 'Erfolgreich registriert' });
});
// Login-Route
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    // Überprüfen, ob der Benutzer existiert.
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        // Speichern des Benutzers in der Session
        req.session.user = user; // Session wird erstellt
        return res.status(200).json({ message: 'Erfolgreich eingeloggt' });
    }
    return res.status(400).json({ error: 'Ungültige Anmeldedaten' });
});
// Logout-Route
router.post('/logout', (req, res) => {
    // Benutzer abmelden, indem die Session gelöscht wird
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Fehler beim Abmelden' });
        }
        res.status(200).json({ message: 'Erfolgreich abgemeldet' });
    });
});
export default router;
