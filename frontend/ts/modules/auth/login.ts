document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login') as HTMLFormElement;
    if (!form) return;
  
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const email    = (document.getElementById('email') as HTMLInputElement).value.trim();
      const password = (document.getElementById('password') as HTMLInputElement).value;
  
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ username: email, password })
        });
        console.log('Response Login:', res.status, await res.json());
        if (!res.ok) {
          const err = await res.json();
          alert('Login fehlgeschlagen:\n' + (err.error || res.statusText));
          return;
        }
        const { token } = await res.json() as { token: string };
        localStorage.setItem('authToken', token);
        alert('Login erfolgreich!');
        window.location.href = 'dashboard.html';
      } catch (err) {
        console.error('Netzwerkfehler beim Login', err);
        alert('Netzwerkfehler beim Login');
      }
    });
  });
  