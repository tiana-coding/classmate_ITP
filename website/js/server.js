// Start Express-Server & Zusammenführen der Routen
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import session from 'express-session';
import authRoutes from './authRoutes';
import path from 'path';
const app = express();
const port = 5000;
// Middleware, um JSON-Daten zu verarbeiten
app.use(bodyParser.json());
// Session-Middleware einrichten
app.use(session({
    // Geheimer Schlüssel für die Session
    secret: 'deinGeheimerSchlüssel',
    // Keine Sitzung zurückschreiben, wenn sie unverändert ist. 
    resave: false,
    // Session wird auch dann erstellt, wenn sie leer ist
    saveUninitialized: true,
    cookie: {
        // 'true' für HTTPS & 'false' für HTTP
        secure: false,
        // Cookies sind nur über HTTP zugänglich, nicht über JavaScript.
        httpOnly: true,
        // Sitzung läuft nach 1 Stunde ab 
        maxAge: 1000 * 60 * 60
    }
}));
// Statische Dateien (HTML, CSS, JS) aus dem 'webseite' Ordner ausliefern
app.use(express.static(path.join(__dirname, '../webseite')));
// Verbindung zur MongoDB-Datenbank
mongoose.connect('mongodb://localhost:27017/deineDatenbank', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("Datenbank verbunden"))
    .catch(error => console.log("Fehler bei der Datenbankverbindung:", error));
// Authentifizierungsrouten einbinden
app.use('/api/auth', authRoutes);
// Wenn man andere statische Seiten bedient (z.B. HTML)
app.use(express.static('public'));
// Standard-Route für das Testen
app.get('/', (req, res) => {
    res.send("API läuft!");
});
// GET-Route für Login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../webseite', 'login.html'));
});
// GET-Route für signup
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../webseite', 'signup.html'));
});
// Geschützte-Route für authentifizierte Benutzer
app.get('/api/protected', (req, res) => {
    // Überprüfen, ob der Benutzer eingeloggt ist (ob die Session existiert)
    if (req.session.user) {
        res.status(200).json({ message: 'Geschützte Daten', user: req.session.user });
    }
    else {
        res.status(403).json({ error: 'Du bist nicht eingeloggt' });
    }
});
// Server starten
app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
