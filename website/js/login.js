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
const login = document.getElementById('login');
const emailInput1 = document.getElementById('email');
const passwordInput1 = document.getElementById('password');
// Überprüfen, ob die Felder nicht null sind.
if (login && emailInput1 && passwordInput1) {
    login.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        const email = emailInput1.value;
        const password = passwordInput1.value;
        try {
            const response = yield fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });
            const data = yield response.json();
            if (response.ok) {
                alert("Erfolgreich eingeloggt!");
                // Token speichern
                localStorage.setItem("token", data.token);
                // Weiterleitung zur Dashboard-Seite 
                window.location.href = "index.html";
            }
            else {
                alert(data.error || "Fehler beim Login");
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
