document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('feedbackForm');
    const starRating = document.getElementById('starRating');
    
    // Handle star rating
    starRating.addEventListener('click', (e) => {
        if (e.target.dataset.rating) {
            const rating = parseInt(e.target.dataset.rating);
            document.getElementById('rating').value = rating;
            
            // Update stars visual
            const stars = document.querySelectorAll('#starRating i');
            stars.forEach((star, index) => {
                star.className = index < rating ? 'bi bi-star-fill' : 'bi bi-star';
            });
        }
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const feedbackData = {
            rating: document.getElementById('rating').value,
            message: document.getElementById('feedbackText')?.value || ''
        };

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(feedbackData)
            });

            if (!response.ok) {
                throw new Error('Feedback konnte nicht gesendet werden');
            }

            alert('Vielen Dank für dein Feedback!');
            form.reset();
            // Reset stars
            document.querySelectorAll('#starRating i').forEach(star => {
                star.className = 'bi bi-star';
            });
            document.getElementById('rating').value = '';

        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Fehler beim Senden des Feedbacks. Bitte versuche es später erneut.');
        }
    });
});