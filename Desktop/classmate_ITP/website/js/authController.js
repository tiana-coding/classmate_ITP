import jwt from 'jsonwebtoken';
export const login = (req, res) => {
    const { email, password } = req.body;
    // Passwort mit einer Datenbank validieren
    if (email === "test@example.com" && password === "password123") {
        // Beispiel für das Erstellen eines JWT-Tokens
        const token = jwt.sign({ email }, 'dein-geheimnis', { expiresIn: '1h' });
        return res.json({ token });
    }
    else {
        return res.status(400).json({ error: "Ungültige E-Mail oder Passwort" });
    }
};
export const register = (req, res) => {
    const { name, email, password } = req.body;
    // Benutzer in der Datenbank speichern
    if (email && password) {
        return res.status(200).json({ message: "Benutzer erfolgreich registriert!" });
    }
    else {
        return res.status(400).json({ error: "Bitte alle Felder ausfüllen" });
    }
};
