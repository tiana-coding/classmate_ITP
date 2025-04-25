const login = document.getElementById('login') as HTMLFormElement | null;
const emailInput1 = document.getElementById('email') as HTMLInputElement | null;
const passwordInput1 = document.getElementById('password') as HTMLInputElement | null;

// Überprüfen, ob die Felder nicht null sind.
if (login && emailInput1 && passwordInput1) {
    login.addEventListener('submit', async (e: Event) => {
        e.preventDefault();

        const email = emailInput1.value;
        const password = passwordInput1.value;

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

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
    });
} 
else {
    console.error("Ein oder mehrere Eingabefelder fehlen.");
    alert("Fehlende Eingabefelder.");
}