// Routen für Registrierung & Login, sichere Verschlüsselung der Passwörter mit bcryptjs
import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from './userModel';

const router = express.Router();

// Registrierung Route
router.post('/signup', async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Bitte alle Felder ausfüllen' });
    }

    // Überprüfen, ob der Benutzer bereits existiert
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).json({ error: 'Benutzer existiert bereits' });
    }

    // Passwort verschlüsseln
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        name,
        email,
        password: hashedPassword,
    });

    try {
        await newUser.save();
        // Session erstellen
        req.session.user = newUser; 
        return res.status(201).json({ message: 'Erfolgreich registriert' });
    } 
    catch (error) {
        return res.status(500).json({ error: 'Fehler bei der Registrierung' });
    }
});

// Login Route
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Bitte alle Felder ausfüllen' });
    }

    // Benutzer aus der Datenbank finden
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ error: 'Benutzer existiert nicht' });
    }

    // Passwort überprüfen
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
        req.session.user = user; // Session erstellen
        return res.status(200).json({ message: 'Erfolgreich eingeloggt' });
    } 
    else {
        return res.status(400).json({ error: 'Ungültige Anmeldedaten' });
    }
});

// Logout Route
router.post('/logout', (req: Request, res: Response) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({ error: 'Fehler beim Abmelden' });
        }
        res.status(200).json({ message: 'Erfolgreich abgemeldet' });
    });
});

export default router;