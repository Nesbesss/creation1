// Quotes page functionality
document.addEventListener('DOMContentLoaded', () => {
    initQuotesPage();
});

function initQuotesPage() {
    // Set up quote buttons
    const newQuoteBtn = document.getElementById('new-quote-btn');
    const speakQuoteBtn = document.getElementById('speak-quote-btn');
    
    newQuoteBtn.addEventListener('click', requestNewQuote);
    speakQuoteBtn.addEventListener('click', speakCurrentQuote);
}

// Request a new inspirational quote
function requestNewQuote() {
    if (!window.PluginMessageHandler) {
        simulateQuoteResponse();
        return;
    }
    
    updateStatus('Requesting quote...');
    
    // Send request to LLM for an inspirational quote
    const payload = {
        message: 'Give me an inspirational quote with its author. Return ONLY valid JSON in this exact format: {"quote":{"text":"quote text here","author":"author name here"}}',
        useLLM: true
    };
    
    window.PluginMessageHandler.postMessage(JSON.stringify(payload));
}

// Speak the current quote using TTS
function speakCurrentQuote() {
    const quoteText = document.getElementById('quote-text').textContent;
    const quoteAuthor = document.getElementById('quote-author').textContent;
    
    if (quoteText === 'Tap "New Quote" to get inspired!' || !quoteText) {
        updateStatus('No quote to speak');
        return;
    }
    
    updateStatus('Speaking quote...');
    
    // Only speak if we have the SDK available
    if (window.PluginMessageHandler) {
        const payload = {
            message: `${quoteText} ${quoteAuthor}`,
            useLLM: false,
            wantsR1Response: true  // Speaks through R1 speaker
        };
        
        window.PluginMessageHandler.postMessage(JSON.stringify(payload));
    }
}

// Display quote on the page
function displayQuote(text, author) {
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    
    quoteText.textContent = text;
    quoteAuthor.textContent = author ? `- ${author}` : '';
    
    updateStatus('New quote loaded');
}

// Fallback for testing outside the R1 device
function simulateQuoteResponse() {
    const quotes = [
        { text: 'Be yourself; everyone else is already taken.', author: 'Oscar Wilde' },
        { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
        { text: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon' },
        { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
        { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' }
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    displayQuote(randomQuote.text, randomQuote.author);
}
