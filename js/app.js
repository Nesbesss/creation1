// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    // Initialize app
    initApp();

    // Set up message handler for plugin responses
    window.onPluginMessage = handlePluginMessage;
    
    // Set up hardware event listeners
    setupHardwareEvents();
});

// App initialization
function initApp() {
    // Menu toggle functionality
    const menuBtn = document.getElementById('menu-btn');
    const menu = document.getElementById('menu');
    
    menuBtn.addEventListener('click', () => {
        menu.classList.toggle('active');
    });
    
    // Menu navigation
    const menuItems = document.querySelectorAll('#menu li');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            navigateToPage(page);
            menu.classList.remove('active');
        });
    });
    
    // Load saved settings if available
    loadSettings();
}

// Load settings from storage
async function loadSettings() {
    try {
        if (window.creationStorage && window.creationStorage.plain) {
            const stored = await window.creationStorage.plain.getItem('inspiration_settings');
            if (stored) {
                const settings = JSON.parse(atob(stored));
                if (settings.theme) {
                    applyTheme(settings.theme);
                }
                updateStatus('Settings loaded');
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Save settings to storage
async function saveSettings(settings) {
    try {
        if (window.creationStorage && window.creationStorage.plain) {
            await window.creationStorage.plain.setItem(
                'inspiration_settings',
                btoa(JSON.stringify(settings))
            );
            updateStatus('Settings saved');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// Navigate to a specific page
function navigateToPage(pageName) {
    // Update active page in menu
    const menuItems = document.querySelectorAll('#menu li');
    menuItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-page') === pageName);
    });
    
    // Update active page in content
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.toggle('active', page.id === `${pageName}-page`);
    });
    
    // Update page title
    const pageTitle = document.getElementById('page-title');
    switch (pageName) {
        case 'quote':
            pageTitle.textContent = 'Daily Inspiration';
            break;
        case 'weather':
            pageTitle.textContent = 'Weather Mood';
            break;
        case 'shake':
            pageTitle.textContent = 'Shake & See';
            break;
    }
}

// Set up hardware event listeners
function setupHardwareEvents() {
    // Scroll wheel events
    window.addEventListener('scrollUp', () => {
        const currentPage = document.querySelector('.page.active').id;
        if (currentPage === 'quote-page') {
            document.getElementById('new-quote-btn').click();
        }
        updateStatus('Scrolled Up');
    });
    
    window.addEventListener('scrollDown', () => {
        const currentPage = document.querySelector('.page.active').id;
        if (currentPage === 'quote-page') {
            document.getElementById('speak-quote-btn').click();
        }
        updateStatus('Scrolled Down');
    });
    
    // Side button (PTT) events
    window.addEventListener('sideClick', () => {
        const menu = document.getElementById('menu');
        menu.classList.toggle('active');
        updateStatus('Side Button Clicked');
    });
}

// Handle plugin messages
function handlePluginMessage(data) {
    console.log('Received plugin message:', data);
    
    // Check if response is in data.data (JSON) or data.message (text)
    if (data.data) {
        try {
            const parsed = JSON.parse(data.data);
            processJsonResponse(parsed);
        } catch (error) {
            console.error('Error parsing JSON response:', error);
            updateStatus('Error parsing response');
        }
    } else if (data.message) {
        processTextResponse(data.message);
    }
}

// Process JSON responses
function processJsonResponse(data) {
    if (data.quote) {
        // Handle quote response
        displayQuote(data.quote.text, data.quote.author);
    } else if (data.mood) {
        // Handle mood response
        displayMoodResponse(data.mood);
    } else if (data.theme) {
        // Handle theme response
        applyTheme(data.theme);
    } else if (data.surprise) {
        // Handle surprise response
        displaySurprise(data.surprise);
    }
}

// Process text responses
function processTextResponse(message) {
    updateStatus('Received: ' + message.substring(0, 20) + '...');
}

// Apply theme to app
function applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme.primary) {
        root.style.setProperty('--primary-color', theme.primary);
    }
    
    if (theme.secondary) {
        root.style.setProperty('--secondary-color', theme.secondary);
    }
    
    if (theme.background) {
        root.style.setProperty('--background-color', theme.background);
    }
    
    if (theme.text) {
        root.style.setProperty('--text-color', theme.text);
    }
    
    if (theme.border) {
        root.style.setProperty('--border-color', theme.border);
    }
    
    // Save theme settings
    saveSettings({ theme });
    updateStatus('Theme applied');
}

// Update status message
function updateStatus(message) {
    const statusElement = document.getElementById('status-message');
    statusElement.textContent = message;
    
    // Clear status after 3 seconds
    setTimeout(() => {
        statusElement.textContent = 'Ready';
    }, 3000);
}
