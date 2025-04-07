const signup = document.getElementById('signup') as HTMLFormElement | null;
const nameInput = document.getElementById('name') as HTMLInputElement | null;
const emailInput = document.getElementById('email') as HTMLInputElement | null;
const passwordInput = document.getElementById('password') as HTMLInputElement | null;
const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement | null;

// Überprüfen, ob die Felder nicht null sind.
if (signup && nameInput && emailInput && passwordInput && confirmPasswordInput) {
    signup.addEventListener('submit', async (e: Event) => {
        e.preventDefault();

        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Überprüfen, ob die Passwörter übereinstimmen
        if (password !== confirmPassword) {
            alert('Passwörter stimmen nicht überein');
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Erfolgreich registriert!");
                // Weiterleitung zur Login-Seite
                window.location.href = "login.html"; 
            } 
            else {
                alert(data.error || "Fehler bei der Registrierung");
            }
        } 
        catch (error) {
            console.error("Fehler:", error);
            alert("Ein Fehler ist aufgetreten.");
        }
    });
} 
else {
    console.error("Ein oder mehrere Eingabefelder fehlen.");
    alert("Fehlende Eingabefelder.");
}