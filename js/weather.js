// Weather mood page functionality
document.addEventListener('DOMContentLoaded', () => {
    initWeatherPage();
});

function initWeatherPage() {
    // Set up mood buttons
    const moodBtns = document.querySelectorAll('.mood-btn');
    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mood = btn.getAttribute('data-mood');
            requestMoodResponse(mood);
        });
    });
    
    // Set up theme change button
    const changeThemeBtn = document.getElementById('change-theme-btn');
    changeThemeBtn.addEventListener('click', applyMoodTheme);
}

// Request a mood-based response
function requestMoodResponse(mood) {
    updateStatus(`Processing ${mood} mood...`);
    
    // Show mood result container
    const moodResult = document.getElementById('mood-result');
    moodResult.classList.remove('hidden');
    
    if (!window.PluginMessageHandler) {
        simulateMoodResponse(mood);
        return;
    }
    
    // Send request to LLM for a mood-based response and theme
    const payload = {
        message: `I'm feeling ${mood} today. Give me a short message and a color theme that matches this mood. Return ONLY valid JSON in this exact format: {"mood":{"message":"your message here","theme":{"primary":"#hexcode","secondary":"#hexcode","background":"#hexcode","text":"#hexcode","border":"#hexcode"}}}`,
        useLLM: true
    };
    
    window.PluginMessageHandler.postMessage(JSON.stringify(payload));
}

// Display mood response
function displayMoodResponse(moodData) {
    const moodMessage = document.getElementById('mood-message');
    
    if (moodData && moodData.message) {
        moodMessage.textContent = moodData.message;
        
        // Store theme data for later application
        window.currentMoodTheme = moodData.theme;
        
        updateStatus('Mood response received');
    } else {
        moodMessage.textContent = 'Error processing mood response';
        updateStatus('Error with mood data');
    }
}

// Apply the current mood theme
function applyMoodTheme() {
    if (window.currentMoodTheme) {
        applyTheme(window.currentMoodTheme);
    } else {
        updateStatus('No theme available');
    }
}

// Fallback for testing outside the R1 device
function simulateMoodResponse(mood) {
    let message = '';
    let theme = {};
    
    switch (mood) {
        case 'happy':
            message = 'Your happiness brightens the world around you! Embrace the joy and share it with others.';
            theme = {
                primary: '#FFD700',    // Gold
                secondary: '#FFA500',  // Orange
                background: '#003366', // Dark Blue
                text: '#FFFFFF',       // White
                border: '#FFD700'      // Gold
            };
            break;
        case 'sad':
            message = 'It\'s okay to feel down sometimes. Take a moment for yourself and remember that brighter days are ahead.';
            theme = {
                primary: '#4682B4',    // Steel Blue
                secondary: '#B0C4DE',  // Light Steel Blue
                background: '#2C3E50', // Dark Blue Gray
                text: '#E0E0E0',       // Light Gray
                border: '#4682B4'      // Steel Blue
            };
            break;
        case 'energetic':
            message = 'Your energy is contagious! Channel it into something amazing today.';
            theme = {
                primary: '#FF4500',    // Orange Red
                secondary: '#FF8C00',  // Dark Orange
                background: '#1A1A1A', // Very Dark Gray
                text: '#FFFFFF',       // White
                border: '#FF4500'      // Orange Red
            };
            break;
        case 'tired':
            message = 'Rest is important. Take it slow, be kind to yourself, and recharge when needed.';
            theme = {
                primary: '#6A5ACD',    // Slate Blue
                secondary: '#9370DB',  // Medium Purple
                background: '#232323', // Dark Gray
                text: '#E6E6FA',       // Lavender
                border: '#6A5ACD'      // Slate Blue
            };
            break;
    }
    
    displayMoodResponse({
        message: message,
        theme: theme
    });
}
