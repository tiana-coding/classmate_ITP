console.log("⚙️ feedback.module.ts geladen");

export function initFeedback() {
  const form = document.getElementById('feedbackForm') as HTMLFormElement;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const rating = formData.get('rating');
    const feedbackText = formData.get('feedbackText');

    const payload = {
      rating: Number(rating),
      feedbackText: String(feedbackText),
      createdAt: new Date().toISOString()
    };

    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert('Danke für dein Feedback!');
      form.reset();
    } else {
      alert('Fehler beim Senden des Feedbacks.');
    }
  });
}

document.addEventListener('DOMContentLoaded', initFeedback);