document.addEventListener('DOMContentLoaded', () => {
    // Handle token from Google OAuth redirect
    if (window.location.hash.startsWith('#token=')) {
        const token = window.location.hash.substring(7); // Remove '#token='
        localStorage.setItem('accessToken', token);
        // Explicitly update auth state and route immediately after setting token
        checkAuth();
        router();
        window.location.hash = ''; // Clean up the URL after processing
    } else {
        // Normal load without a token in hash
        checkAuth();
        router();
    }