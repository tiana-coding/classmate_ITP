"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const registration = document.getElementById('registration');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
// Überprüfen, ob die Felder nicht null sind.
if (registration && nameInput && emailInput && passwordInput) {
    registration.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        try {
            const response = yield fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });
            const data = yield response.json();
            if (response.ok) {
                alert("Erfolgreich registriert!");
                window.location.href = "login.html"; // Weiterleitung zum Login
            }
            else {
                alert(data.error || "Fehler bei der Registrierung");
            }
        }
        catch (error) {
            console.error("Fehler:", error);
            alert("Ein Fehler ist aufgetreten.");
        }
    }));
}
else {
    console.error("Ein oder mehrere Eingabefelder fehlen.");
    alert("Fehlende Eingabefelder.");
}
