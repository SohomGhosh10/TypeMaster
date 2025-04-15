// DOM Elements
const voiceTextDisplay = document.getElementById('voice-text-display');
const recognizedText = document.getElementById('voice-recognized-text');
const startVoiceBtn = document.getElementById('start-voice-btn');
const stopVoiceBtn = document.getElementById('stop-voice-btn');
const resetVoiceBtn = document.getElementById('reset-voice-btn');
const wpmElement = document.getElementById('v-wpm');
const accuracyElement = document.getElementById('v-accuracy');
const charactersElement = document.getElementById('v-characters');
const errorsElement = document.getElementById('v-errors');
const minutesElement = document.getElementById('v-minutes');
const secondsElement = document.getElementById('v-seconds');
const loginBtn = document.getElementById('login-btn');
const loginPopup = document.getElementById('login-popup');
const registerPopup = document.getElementById('register-popup');
const voiceResultsPopup = document.getElementById('voice-results-popup');
const registerLink = document.getElementById('register-link');
const loginLink = document.getElementById('login-link');
const closeBtns = document.querySelectorAll('.close');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

// Text samples for voice typing
const voiceTextSamples = [
    "The ability to use your voice for typing can greatly enhance productivity for many people. Voice recognition technology has improved significantly in recent years.",
    "Please speak clearly and at a consistent pace when using voice typing. This helps the system recognize your words more accurately.",
    "Digital assistants and voice typing technology are making computing more accessible to everyone, including people with disabilities or injuries.",
    "Voice recognition systems improve over time as they learn your speech patterns and vocabulary. Regular use can lead to better accuracy.",
    "When practicing voice typing, try to maintain a natural speaking rhythm rather than pausing between each word."
];

// Variables for speech recognition
let recognition;
let recognizing = false;
let timer;
let timeLeft = 60; // 1 minute
let currentText = '';
let startTime;
let testActive = false;
let testCompleted = false;
let typedCharacters = 0;
let correctCharacters = 0;
let errors = 0;
let userData = {
    username: '',
    isLoggedIn: false,
    testHistory: []
};

// Initialize the application
function init() {
    // Check for SpeechRecognition API support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Your browser doesn\'t support Speech Recognition. Please try Chrome or Edge.');
        startVoiceBtn.disabled = true;
        return;
    }

    // Initialize SpeechRecognition
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Get saved user data from localStorage
    const savedUserData = localStorage.getItem('typeMasterUserData');
    if (savedUserData) {
        userData = JSON.parse(savedUserData);
        if (userData.isLoggedIn) {
            updateLoginButton();
        }
    }

    // Set up the initial text
    setRandomText();

    // Event listeners
    startVoiceBtn.addEventListener('click', startVoiceTest);
    stopVoiceBtn.addEventListener('click', stopVoiceTest);
    resetVoiceBtn.addEventListener('click', resetVoiceTest);

    // Recognition event listeners
    recognition.onresult = handleRecognitionResult;
    recognition.onend = handleRecognitionEnd;
    recognition.onerror = handleRecognitionError;

    // Navigation and popup event listeners
    loginBtn.addEventListener('click', toggleLoginPopup);
    registerLink.addEventListener('click', showRegisterPopup);
    loginLink.addEventListener('click', showLoginPopup);
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', closePopups);
    });

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('save-voice-result').addEventListener('click', saveResult);
    document.getElementById('try-voice-again').addEventListener('click', () => {
        closePopups();
        resetVoiceTest();
    });
    document.getElementById('share-voice-result').addEventListener('click', shareResult);
}

// Set a random text for voice typing
function setRandomText() {
    const randomIndex = Math.floor(Math.random() * voiceTextSamples.length);
    currentText = voiceTextSamples[randomIndex];
    displayText();
}

// Display the text for voice typing test
function displayText() {
    voiceTextDisplay.innerHTML = '';
    currentText.split('').forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.innerText = char;
        voiceTextDisplay.appendChild(charSpan);
    });
}

// Start the voice typing test
function startVoiceTest() {
    if (testActive) return;
    
    resetVoiceTest();
    testActive = true;
    recognizing = true;
    startVoiceBtn.disabled = true;
    stopVoiceBtn.disabled = false;
    
    // Start recognition
    try {
        recognition.start();
        recognizedText.textContent = 'Listening...';
    } catch (error) {
        console.error('Speech recognition error:', error);
        alert('Error starting speech recognition. Please try again.');
        resetVoiceTest();
        return;
    }
    
    startTime = new Date().getTime();
    
    // Reset timer
    timeLeft = 60;
    updateTimerDisplay();
    
    // Start countdown
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            endVoiceTest();
        }
    }, 1000);
}

// Stop the voice typing test
function stopVoiceTest() {
    if (!testActive) return;
    
    recognition.stop();
    endVoiceTest();
}

// Reset the voice typing test
function resetVoiceTest() {
    clearInterval(timer);
    if (recognizing) {
        recognition.stop();
        recognizing = false;
    }
    
    testActive = false;
    testCompleted = false;
    recognizedText.textContent = 'Your speech will appear here...';
    typedCharacters = 0;
    correctCharacters = 0;
    errors = 0;
    timeLeft = 60;
    updateTimerDisplay();
    startVoiceBtn.disabled = false;
    stopVoiceBtn.disabled = true;
    updateStats();
    setRandomText();
}

// Update the timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesElement.textContent = minutes;
    secondsElement.textContent = seconds < 10 ? `0${seconds}` : seconds;
}

// Handle speech recognition results
function handleRecognitionResult(event) {
    if (!testActive) return;
    
    let interimTranscript = '';
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
            finalTranscript += transcript;
        } else {
            interimTranscript += transcript;
        }
    }
    
    const fullTranscript = finalTranscript + interimTranscript;
    recognizedText.textContent = fullTranscript;
    
    // Compare recognized text with target text
    compareText(fullTranscript);
}

// Compare recognized text with target text
function compareText(recognizedText) {
    typedCharacters = recognizedText.length;
    
    // Reset correct characters and errors count
    correctCharacters = 0;
    errors = 0;
    
    // Check each character against the target text
    const textSpans = voiceTextDisplay.querySelectorAll('span');
    
    for (let i = 0; i < recognizedText.length; i++) {
        if (i >= textSpans.length) break;
        
        const char = recognizedText[i].toLowerCase();
        const correctChar = currentText[i].toLowerCase();
        
        if (char === correctChar) {
            textSpans[i].className = 'correct';
            correctCharacters++;
        } else {
            textSpans[i].className = 'incorrect';
            errors++;
        }
    }
    
    // Mark the current character
    for (let i = 0; i < textSpans.length; i++) {
        textSpans[i].classList.remove('current');
    }
    
    if (typedCharacters < textSpans.length) {
        textSpans[typedCharacters].classList.add('current');
    }
    
    // Update statistics
    updateStats();
    
    // Check if the test is complete (approximate match)
    if (recognizedText.length >= currentText.length * 0.9 && errors < currentText.length * 0.2) {
        endVoiceTest();
    }
}

// Handle recognition end event
function handleRecognitionEnd() {
    recognizing = false;
    
    // If test is still active but recognition ended unexpectedly, restart it
    if (testActive && !testCompleted) {
        try {
            recognition.start();
            recognizing = true;
        } catch (error) {
            console.error('Error restarting speech recognition:', error);
        }
    }
}

// Handle recognition error event
function handleRecognitionError(event) {
    console.error('Speech recognition error:', event.error);
    
    if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access to use voice typing.');
        resetVoiceTest();
    }
}

// Update the statistics display
function updateStats() {
    const elapsedTime = testActive ? (new Date().getTime() - startTime) / 60000 : 0; // in minutes
    
    // Calculate WPM: (characters typed / 5) / time in minutes
    const wpm = elapsedTime > 0 ? Math.round((typedCharacters / 5) / elapsedTime) : 0;
    
    // Calculate accuracy: (correct characters / total characters) * 100
    const accuracy = typedCharacters > 0 ? Math.round((correctCharacters / typedCharacters) * 100) : 0;
    
    // Update the display
    wpmElement.textContent = wpm;
    accuracyElement.textContent = accuracy;
    charactersElement.textContent = typedCharacters;
    errorsElement.textContent = errors;
}

// End the voice typing test
function endVoiceTest() {
    clearInterval(timer);
    if (recognizing) {
        recognition.stop();
        recognizing = false;
    }
    
    testActive = false;
    testCompleted = true;
    startVoiceBtn.disabled = false;
    stopVoiceBtn.disabled = true;
    
    // Final stats calculation
    updateStats();
    
    // Show results popup
    showResultsPopup();
}

// Show the results popup
function showResultsPopup() {
    // Update results in popup
    document.getElementById('v-result-wpm').textContent = wpmElement.textContent;
    document.getElementById('v-result-accuracy').textContent = accuracyElement.textContent;
    document.getElementById('v-result-characters').textContent = charactersElement.textContent;
    document.getElementById('v-result-errors').textContent = errorsElement.textContent;
    
    // Create result chart
    createResultChart();
    
    // Show popup
    voiceResultsPopup.style.display = 'flex';
}

// Create the result chart
function createResultChart() {
    const ctx = document.getElementById('voice-result-chart').getContext('2d');
    const resultChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Speed (WPM)', 'Accuracy (%)', 'Errors'],
            datasets: [{
                label: 'Your Result',
                data: [
                    parseInt(wpmElement.textContent),
                    parseInt(accuracyElement.textContent),
                    parseInt(errorsElement.textContent)
                ],
                backgroundColor: [
                    'rgba(67, 97, 238, 0.7)',
                    'rgba(76, 201, 240, 0.7)',
                    'rgba(248, 113, 113, 0.7)'
                ],
                borderColor: [
                    'rgba(67, 97, 238, 1)',
                    'rgba(76, 201, 240, 1)',
                    'rgba(248, 113, 113, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Toggle login popup
function toggleLoginPopup() {
    if (userData.isLoggedIn) {
        // If user is logged in, log them out
        userData.isLoggedIn = false;
        userData.username = '';
        saveUserData();
        updateLoginButton();
        resetVoiceTest();
    } else {
        // If user is not logged in, show login popup
        loginPopup.style.display = 'flex';
    }
}

// Show register popup
function showRegisterPopup() {
    loginPopup.style.display = 'none';
    registerPopup.style.display = 'flex';
}

// Show login popup
function showLoginPopup() {
    registerPopup.style.display = 'none';
    loginPopup.style.display = 'flex';
}

// Close all popups
function closePopups() {
    loginPopup.style.display = 'none';
    registerPopup.style.display = 'none';
    voiceResultsPopup.style.display = 'none';
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // In a real application, you would verify credentials with a backend
    // For this demo, we'll simulate successful login
    userData.username = username;
    userData.isLoggedIn = true;
    
    // Check if user already exists in localStorage
    const existingData = localStorage.getItem(`typeMaster_${username}`);
    if (existingData) {
        const userData = JSON.parse(existingData);
        userData.testHistory = userData.testHistory || [];
        saveUserData();
    } else {
        userData.testHistory = [];
        saveUserData();
    }
    
    updateLoginButton();
    closePopups();
}

// Handle register form submission
function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // In a real application, you would validate and send this to a backend
    // For this demo, we'll simulate successful registration
    userData.username = username;
    userData.isLoggedIn = true;
    userData.testHistory = [];
    
    saveUserData();
    updateLoginButton();
    closePopups();
}

// Save user data to localStorage
function saveUserData() {
    localStorage.setItem('typeMasterUserData', JSON.stringify(userData));
    if (userData.username) {
        localStorage.setItem(`typeMaster_${userData.username}`, JSON.stringify(userData));
    }
}

// Update login button based on login status
function updateLoginButton() {
    if (userData.isLoggedIn) {
        loginBtn.innerHTML = `<i class="fas fa-user"></i> ${userData.username}`;
    } else {
        loginBtn.innerHTML = `<i class="fas fa-user"></i> Login`;
    }
}

// Save test result
function saveResult() {
    if (!testCompleted) return;
    
    if (!userData.isLoggedIn) {
        alert('Please login to save your results.');
        closePopups();
        toggleLoginPopup();
        return;
    }
    
    const testResult = {
        date: new Date().toISOString(),
        wpm: parseInt(wpmElement.textContent),
        accuracy: parseInt(accuracyElement.textContent),
        characters: parseInt(charactersElement.textContent),
        errors: parseInt(errorsElement.textContent),
        type: 'voice'
    };
    
    userData.testHistory.push(testResult);
    saveUserData();
    
    alert('Test result saved successfully!');
    closePopups();
}

// Share test result
function shareResult() {
    if (!testCompleted) return;
    
    // In a real application, this would generate a shareable link or allow social sharing
    const wpm = wpmElement.textContent;
    const accuracy = accuracyElement.textContent;
    
    const shareText = `I just scored ${wpm} WPM with ${accuracy}% accuracy on TypeMaster Voice Typing! Try to beat my score.`;
    
    // For this demo, we'll just copy to clipboard
    navigator.clipboard.writeText(shareText)
        .then(() => {
            alert('Result copied to clipboard! You can now paste and share it.');
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text. Please try again.');
        });
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);