// DOM Elements
const textDisplay = document.getElementById('text-display');
const typingInput = document.getElementById('typing-input');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');
const charactersElement = document.getElementById('characters');
const errorsElement = document.getElementById('errors');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const loginBtn = document.getElementById('login-btn');
const loginPopup = document.getElementById('login-popup');
const registerPopup = document.getElementById('register-popup');
const resultsPopup = document.getElementById('results-popup');
const registerLink = document.getElementById('register-link');
const loginLink = document.getElementById('login-link');
const closeBtns = document.querySelectorAll('.close');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

// Text samples for different difficulty levels
const textSamples = {
    easy: [
        "The quick brown fox jumps over the lazy dog. This simple sentence contains all the letters of the English alphabet. Typing practice helps improve your speed and accuracy over time.",
        "Learning to type quickly can save you a lot of time. Good typing skills are essential in today's digital world. Practice regularly to build muscle memory for each key.",
        "Typing is a skill that requires practice. The more you type, the better you will become. Focus on accuracy first, then work on increasing your speed gradually."
    ],
    medium: [
        "The ability to type quickly and accurately is an essential skill in our modern, technology-driven world. Whether you're writing emails, creating documents, or communicating online, efficient typing can significantly enhance your productivity.",
        "JavaScript is a programming language commonly used to create interactive effects within web browsers. It was originally developed by Netscape as a means to add dynamic and interactive elements to websites.",
        "In typography, the readability of text depends on various factors including font style, size, line height, and letter spacing. Good typographic design enhances the reader's experience and makes content more accessible."
    ],
    hard: [
        "The intricate relationship between quantum mechanics and general relativity presents one of the most profound challenges in theoretical physics. While quantum theory successfully describes the behavior of particles at the microscopic level, and relativity accurately predicts gravitational phenomena at large scales, reconciling these frameworks remains elusive.",
        "Cryptocurrencies operate on a technology called blockchain, which is a decentralized ledger of all transactions across a peer-to-peer network. Using this technology, participants can confirm transactions without the need for a central clearing authority. Potential applications include fund transfers, settling trades, voting, and many other issues.",
        "The development of artificial intelligence raises numerous ethical considerations regarding privacy, autonomy, transparency, and bias. As machine learning algorithms become increasingly sophisticated and are deployed in sensitive domains such as healthcare, criminal justice, and financial services, ensuring they operate fairly and responsibly becomes paramount."
    ]
};

// State variables
let timer;
let timeLeft = 60; // 1 minute
let currentText = '';
let typedCharacters = 0;
let correctCharacters = 0;
let errors = 0;
let testActive = false;
let testCompleted = false;
let startTime;
let currentDifficulty = 'easy';
let userData = {
    username: '',
    isLoggedIn: false,
    testHistory: []
};

// Initialize the application
function init() {
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
    
    // Disable input initially
    typingInput.disabled = true;

    // Event listeners
    startBtn.addEventListener('click', startTest);
    resetBtn.addEventListener('click', resetTest);
    typingInput.addEventListener('input', checkInput);

    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDifficulty = btn.dataset.difficulty;
            setRandomText();
        });
    });

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
    document.getElementById('save-result').addEventListener('click', saveResult);
    document.getElementById('try-again').addEventListener('click', () => {
        closePopups();
        resetTest();
    });
    document.getElementById('share-result').addEventListener('click', shareResult);

    // Initialize recent performance chart
    initRecentPerformanceChart();
}

// Set a random text based on the selected difficulty
function setRandomText() {
    const samples = textSamples[currentDifficulty];
    const randomIndex = Math.floor(Math.random() * samples.length);
    currentText = samples[randomIndex];
    displayText();
}

// Display the text for typing test
function displayText() {
    textDisplay.innerHTML = '';
    currentText.split('').forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.innerText = char;
        textDisplay.appendChild(charSpan);
    });
}

// Start the typing test
function startTest() {
    if (testActive) return;
    
    resetTest();
    testActive = true;
    testCompleted = false;
    typingInput.disabled = false;
    typingInput.focus();
    startBtn.disabled = true;
    
    startTime = new Date().getTime();
    
    // Reset timer
    timeLeft = 60;
    updateTimerDisplay();
    
    // Start countdown
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            endTest();
        }
    }, 1000);
}

// Update the timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesElement.textContent = minutes;
    secondsElement.textContent = seconds < 10 ? `0${seconds}` : seconds;
}

// Reset the typing test
function resetTest() {
    clearInterval(timer);
    testActive = false;
    testCompleted = false;
    typedCharacters = 0;
    correctCharacters = 0;
    errors = 0;
    timeLeft = 60;
    updateTimerDisplay();
    typingInput.value = '';
    typingInput.disabled = true;
    startBtn.disabled = false;
    updateStats();
    setRandomText();
}

// Check the input against the current text
function checkInput() {
    if (!testActive) return;
    
    const inputValue = typingInput.value;
    typedCharacters = inputValue.length;
    
    // Reset correct characters and errors count
    correctCharacters = 0;
    errors = 0;
    
    // Check each character against the displayed text
    const textSpans = textDisplay.querySelectorAll('span');
    for (let i = 0; i < inputValue.length; i++) {
        if (i >= textSpans.length) break;
        
        const char = inputValue[i];
        const correctChar = currentText[i];
        
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
    
    // Check if the test is complete
    if (inputValue === currentText) {
        endTest();
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

// End the typing test
function endTest() {
    clearInterval(timer);
    testActive = false;
    testCompleted = true;
    typingInput.disabled = true;
    startBtn.disabled = false;
    
    // Final stats calculation
    updateStats();
    
    // Show results popup
    showResultsPopup();
}

// Show the results popup
function showResultsPopup() {
    // Update results in popup
    document.getElementById('result-wpm').textContent = wpmElement.textContent;
    document.getElementById('result-accuracy').textContent = accuracyElement.textContent;
    document.getElementById('result-characters').textContent = charactersElement.textContent;
    document.getElementById('result-errors').textContent = errorsElement.textContent;
    
    // Create result chart
    createResultChart();
    
    // Show popup
    resultsPopup.style.display = 'flex';
}

// Create the result chart
function createResultChart() {
    const ctx = document.getElementById('result-chart').getContext('2d');
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

// Initialize recent performance chart
function initRecentPerformanceChart() {
    const ctx = document.getElementById('recent-performance').getContext('2d');
    
    // Get recent test data if user is logged in
    let labels = ['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5'];
    let wpmData = [0, 0, 0, 0, 0];
    let accuracyData = [0, 0, 0, 0, 0];
    
    if (userData.isLoggedIn && userData.testHistory.length > 0) {
        const recentTests = userData.testHistory.slice(-5);
        labels = recentTests.map((_, index) => `Test ${index + 1}`);
        wpmData = recentTests.map(test => test.wpm);
        accuracyData = recentTests.map(test => test.accuracy);
    }
    
    const recentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'WPM',
                    data: wpmData,
                    borderColor: 'rgba(67, 97, 238, 1)',
                    backgroundColor: 'rgba(67, 97, 238, 0.2)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Accuracy (%)',
                    data: accuracyData,
                    borderColor: 'rgba(76, 201, 240, 1)',
                    backgroundColor: 'rgba(76, 201, 240, 0.2)',
                    tension: 0.4,
                    fill: true
                }
            ]
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
        resetTest();
        initRecentPerformanceChart();
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
    resultsPopup.style.display = 'none';
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
    initRecentPerformanceChart();
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
        difficulty: currentDifficulty,
        type: 'keyboard'
    };
    
    userData.testHistory.push(testResult);
    saveUserData();
    
    alert('Test result saved successfully!');
    closePopups();
    initRecentPerformanceChart();
}

// Share test result
function shareResult() {
    if (!testCompleted) return;
    
    // In a real application, this would generate a shareable link or allow social sharing
    const wpm = wpmElement.textContent;
    const accuracy = accuracyElement.textContent;
    
    const shareText = `I just scored ${wpm} WPM with ${accuracy}% accuracy on TypeMaster! Try to beat my score.`;
    
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