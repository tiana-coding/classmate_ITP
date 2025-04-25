// Benutzer-Modell für die Datenbank, um den Benutzer zuspeichern und abzurufen.
import mongoose, { Schema, Document } from 'mongoose';

// Benutzer-Modell
interface IUser extends Document {
    name: string;
    email: string;
    password: string;
}

const userSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;