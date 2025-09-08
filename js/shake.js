// Shake and see page functionality
document.addEventListener('DOMContentLoaded', () => {
    initShakePage();
});

let sensorActive = false;
let lastShakeTime = 0;
const shakeThreshold = 1.2; // Sensitivity for shake detection

function initShakePage() {
    // Set up sensor toggle button
    const toggleSensorBtn = document.getElementById('toggle-sensor-btn');
    toggleSensorBtn.addEventListener('click', toggleAccelerometer);
    
    // Initialize accelerometer values
    updateAccelerometerDisplay({ x: 0, y: 0, z: 0 });
}

// Toggle accelerometer on/off
function toggleAccelerometer() {
    const toggleBtn = document.getElementById('toggle-sensor-btn');
    
    if (!sensorActive) {
        // Check if accelerometer is available
        if (!window.creationSensors || !window.creationSensors.accelerometer) {
            updateStatus('Accelerometer not available');
            simulateAccelerometer();
            return;
        }
        
        // Start accelerometer
        window.creationSensors.accelerometer.start((data) => {
            updateAccelerometerDisplay(data);
            detectShake(data);
        }, { frequency: 60 });
        
        sensorActive = true;
        toggleBtn.textContent = 'Stop Sensor';
        updateStatus('Accelerometer started');
    } else {
        // Stop accelerometer
        if (window.creationSensors && window.creationSensors.accelerometer) {
            window.creationSensors.accelerometer.stop();
        }
        
        sensorActive = false;
        toggleBtn.textContent = 'Start Sensor';
        updateStatus('Accelerometer stopped');
    }
}

// Update accelerometer display
function updateAccelerometerDisplay(data) {
    document.getElementById('x-value').textContent = data.x.toFixed(2);
    document.getElementById('y-value').textContent = data.y.toFixed(2);
    document.getElementById('z-value').textContent = data.z.toFixed(2);
}

// Detect shake gesture
function detectShake(data) {
    const now = new Date().getTime();
    
    // Calculate magnitude of movement
    const magnitude = Math.sqrt(
        Math.pow(data.x, 2) + 
        Math.pow(data.y, 2) + 
        Math.pow(data.z, 2)
    );
    
    // Check if movement exceeds threshold and enough time has passed since last shake
    if (magnitude > shakeThreshold && now - lastShakeTime > 1000) {
        lastShakeTime = now;
        requestSurprise();
    }
}

// Request a surprise from the LLM
function requestSurprise() {
    updateStatus('Generating surprise...');
    
    // Show surprise container
    const surpriseContainer = document.getElementById('surprise-container');
    surpriseContainer.classList.remove('hidden');
    
    if (!window.PluginMessageHandler) {
        simulateSurpriseResponse();
        return;
    }
    
    // Send request to LLM for a random surprise
    const payload = {
        message: 'Give me a short, surprising, interesting, or fun fact. Return ONLY valid JSON in this exact format: {"surprise":"your fun fact here"}',
        useLLM: true
    };
    
    window.PluginMessageHandler.postMessage(JSON.stringify(payload));
}

// Display surprise
function displaySurprise(surpriseText) {
    const surpriseElement = document.getElementById('surprise-text');
    surpriseElement.textContent = surpriseText;
    updateStatus('Surprise revealed!');
}

// Fallback for testing outside the R1 device
function simulateAccelerometer() {
    let x = 0, y = 0, z = 0;
    
    // Simulate accelerometer by updating values randomly
    const interval = setInterval(() => {
        if (!sensorActive) {
            clearInterval(interval);
            return;
        }
        
        // Simulate some movement
        x = Math.sin(Date.now() / 1000) * 0.5;
        y = Math.cos(Date.now() / 1000) * 0.5;
        z = 0.8 + Math.sin(Date.now() / 500) * 0.2;
        
        updateAccelerometerDisplay({ x, y, z });
        
        // Randomly trigger shake event
        if (Math.random() < 0.01) {
            requestSurprise();
        }
    }, 100);
    
    sensorActive = true;
    document.getElementById('toggle-sensor-btn').textContent = 'Stop Sensor';
    updateStatus('Simulating accelerometer');
}

// Fallback for testing outside the R1 device
function simulateSurpriseResponse() {
    const surprises = [
        'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly good to eat.',
        'A day on Venus is longer than a year on Venus. It takes 243 Earth days to rotate once on its axis, but only 225 Earth days to go around the Sun.',
        'The shortest war in history was between Britain and Zanzibar on August 27, 1896. Zanzibar surrendered after 38 minutes.',
        'Octopuses have three hearts: two pump blood through the gills, while the third pumps it through the body.',
        'Crows can recognize human faces and remember if that specific human is a threat.'
    ];
    
    const randomSurprise = surprises[Math.floor(Math.random() * surprises.length)];
    displaySurprise(randomSurprise);
}
