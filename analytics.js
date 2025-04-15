// Dummy analytics data (can be fetched from a backend API later)
const analyticsData = {
    week: {
        avgSpeed: 65,
        speedChange: 5,
        avgAccuracy: 92,
        accuracyChange: 3,
        testsCompleted: 12,
        testsChange: 4,
        practiceTime: 85,
        timeChange: 20,
        recentTests: [
            { date: '2025-04-13', type: 'Typing', wpm: 67, accuracy: 91, time: '1 min' },
            { date: '2025-04-12', type: 'Voice', wpm: 60, accuracy: 93, time: '2 min' },
            { date: '2025-04-11', type: 'Typing', wpm: 69, accuracy: 94, time: '1 min' },
        ],
        highestSpeed: 73,
        highestSpeedDate: '2025-04-09',
        currentSpeed: 65,
        speedGoal: 80,
        highestAccuracy: 96,
        highestAccuracyDate: '2025-04-10',
        currentAccuracy: 92,
        accuracyGoal: 98,
        selfComparison: 12,
        percentile: 85,
        growthRate: 6,
    }
};

let currentPeriod = "week";

// Handle tab switching
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const tab = button.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(tabContent => {
            tabContent.classList.remove('active');
        });
        document.getElementById(`${tab}-tab`).classList.add('active');
    });
});

// Handle date filter buttons
document.querySelectorAll('.date-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.date-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentPeriod = button.dataset.period;
        renderAnalytics();
    });
});

function renderAnalytics() {
    const data = analyticsData[currentPeriod];

    document.getElementById('avg-speed').textContent = data.avgSpeed;
    document.getElementById('speed-change').textContent = data.speedChange;
    document.getElementById('avg-accuracy').textContent = data.avgAccuracy;
    document.getElementById('accuracy-change').textContent = data.accuracyChange;
    document.getElementById('tests-completed').textContent = data.testsCompleted;
    document.getElementById('tests-change').textContent = data.testsChange;
    document.getElementById('practice-time').textContent = data.practiceTime;
    document.getElementById('time-change').textContent = data.timeChange;

    const tableBody = document.getElementById('recent-tests-body');
    tableBody.innerHTML = '';
    data.recentTests.forEach(test => {
        const row = `<tr>
            <td>${test.date}</td>
            <td>${test.type}</td>
            <td>${test.wpm}</td>
            <td>${test.accuracy}%</td>
            <td>${test.time}</td>
            <td><button class="view-btn">View</button></td>
        </tr>`;
        tableBody.innerHTML += row;
    });

    // Speed Tab
    document.getElementById('highest-speed').textContent = data.highestSpeed;
    document.getElementById('highest-speed-date').textContent = data.highestSpeedDate;
    document.getElementById('current-speed').textContent = data.currentSpeed;
    document.getElementById('speed-goal').textContent = data.speedGoal;
    document.getElementById('speed-goal-progress').style.width = `${(data.currentSpeed / data.speedGoal) * 100}%`;

    // Accuracy Tab
    document.getElementById('highest-accuracy').textContent = data.highestAccuracy;
    document.getElementById('highest-accuracy-date').textContent = data.highestAccuracyDate;
    document.getElementById('current-accuracy').textContent = data.currentAccuracy;
    document.getElementById('accuracy-goal').textContent = data.accuracyGoal;
    document.getElementById('accuracy-goal-progress').style.width = `${(data.currentAccuracy / data.accuracyGoal) * 100}%`;

    // Comparison Tab
    document.getElementById('self-comparison').textContent = data.selfComparison;
    document.getElementById('percentile').textContent = data.percentile;
    document.getElementById('growth-rate').textContent = data.growthRate;

    renderCharts(data);
}

function renderCharts(data) {
    renderLineChart('overview-chart', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [58, 62, 64, 66, 67, 70, data.avgSpeed]);
    renderLineChart('speed-chart', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [55, 60, 64, 66, 69, 73, data.avgSpeed]);
    renderLineChart('accuracy-chart', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [88, 90, 91, 92, 93, 94, data.avgAccuracy]);
    renderBarChart('speed-distribution', ['<40', '40-50', '50-60', '60-70', '70+'], [1, 2, 3, 4, 1]);
    renderBarChart('error-analysis', ['a/s', 't/h', 'e/r', 'l/k'], [5, 3, 4, 2]);
    renderComparisonChart();
}

function renderLineChart(id, labels, data) {
    const ctx = document.getElementById(id).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Performance',
                data: data,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function renderBarChart(id, labels, data) {
    const ctx = document.getElementById(id).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Count',
                data: data,
                backgroundColor: '#2196F3'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function renderComparisonChart() {
    const ctx = document.getElementById('comparison-chart').getContext('2d');
    const metric = document.getElementById('comparison-metric').value;
    const labels = ['You', 'Average', 'Top 10%'];
    const data = metric === 'speed' ? [65, 55, 80] : [92, 85, 98];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: metric === 'speed' ? 'Speed (WPM)' : 'Accuracy (%)',
                data: data,
                backgroundColor: ['#4CAF50', '#FFC107', '#F44336']
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Event listeners for comparison filters
document.getElementById('comparison-type').addEventListener('change', renderComparisonChart);
document.getElementById('comparison-metric').addEventListener('change', renderComparisonChart);

// Initial render
renderAnalytics();
