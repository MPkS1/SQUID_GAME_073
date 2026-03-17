// Default settings
const DEFAULT_SETTINGS = {
    backendUrl: 'http://localhost:8000',
    enableLinkScanning: true,
    enableGmailIntegration: true,
    blockHighRiskLinks: true,
    enableNotifications: true,
    notificationLevel: 'high',
    highRiskThreshold: 70,
    mediumRiskThreshold: 40,
    cacheAnalyses: true,
    sendStatistics: true
};

// DOM elements
const settingsForm = document.getElementById('settingsForm');
const resetBtn = document.getElementById('resetBtn');
const statusMessage = document.getElementById('statusMessage');

// Input elements
const backendUrl = document.getElementById('backendUrl');
const enableLinkScanning = document.getElementById('enableLinkScanning');
const enableGmailIntegration = document.getElementById('enableGmailIntegration');
const blockHighRiskLinks = document.getElementById('blockHighRiskLinks');
const enableNotifications = document.getElementById('enableNotifications');
const notificationLevel = document.getElementById('notificationLevel');
const highRiskThreshold = document.getElementById('highRiskThreshold');
const mediumRiskThreshold = document.getElementById('mediumRiskThreshold');
const cacheAnalyses = document.getElementById('cacheAnalyses');
const sendStatistics = document.getElementById('sendStatistics');

// Load settings on page load
document.addEventListener('DOMContentLoaded', loadSettings);

// Load settings from Chrome storage
function loadSettings() {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
        backendUrl.value = settings.backendUrl;
        enableLinkScanning.checked = settings.enableLinkScanning;
        enableGmailIntegration.checked = settings.enableGmailIntegration;
        blockHighRiskLinks.checked = settings.blockHighRiskLinks;
        enableNotifications.checked = settings.enableNotifications;
        notificationLevel.value = settings.notificationLevel;
        highRiskThreshold.value = settings.highRiskThreshold;
        mediumRiskThreshold.value = settings.mediumRiskThreshold;
        cacheAnalyses.checked = settings.cacheAnalyses;
        sendStatistics.checked = settings.sendStatistics;
    });
}

// Save settings
settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate thresholds
    const highThreshold = parseInt(highRiskThreshold.value);
    const mediumThreshold = parseInt(mediumRiskThreshold.value);

    if (highThreshold <= mediumThreshold) {
        showStatus('High risk threshold must be greater than medium risk threshold', 'error');
        return;
    }

    if (highThreshold < 0 || highThreshold > 100 || mediumThreshold < 0 || mediumThreshold > 100) {
        showStatus('Thresholds must be between 0 and 100', 'error');
        return;
    }

    // Validate backend URL
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(backendUrl.value.trim())) {
        showStatus('Invalid backend URL. Must start with http:// or https://', 'error');
        return;
    }

    // Collect settings
    const settings = {
        backendUrl: backendUrl.value.trim(),
        enableLinkScanning: enableLinkScanning.checked,
        enableGmailIntegration: enableGmailIntegration.checked,
        blockHighRiskLinks: blockHighRiskLinks.checked,
        enableNotifications: enableNotifications.checked,
        notificationLevel: notificationLevel.value,
        highRiskThreshold: highThreshold,
        mediumRiskThreshold: mediumThreshold,
        cacheAnalyses: cacheAnalyses.checked,
        sendStatistics: sendStatistics.checked,
        lastSaved: new Date().toISOString()
    };

    // Save to Chrome storage
    chrome.storage.sync.set(settings, () => {
        showStatus('✅ Settings saved successfully!', 'success');
        console.log('Settings saved:', settings);

        // Notify all active tabs about the settings change
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'SETTINGS_UPDATED',
                    settings: settings
                }).catch(() => {
                    // Tab may not have content script, that's ok
                });
            });
        });
    });
});

// Reset to defaults
resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
        chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
            loadSettings();
            showStatus('✅ Settings reset to defaults!', 'success');
        });
    }
});

// Show status message
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;

    // Hide after 4 seconds
    setTimeout(() => {
        statusMessage.className = 'status-message';
    }, 4000);
}

// Test backend connection
document.addEventListener('DOMContentLoaded', () => {
    // Optional: Add "Test Connection" button functionality
    const testBtn = document.createElement('button');
    testBtn.type = 'button';
    testBtn.textContent = '🧪 Test Backend Connection';
    testBtn.style.cssText = `
        width: 100%;
        padding: 10px;
        margin-top: 10px;
        background: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.3s;
    `;

    testBtn.onmouseover = () => {
        testBtn.style.background = '#e0e0e0';
    };
    testBtn.onmouseout = () => {
        testBtn.style.background = '#f0f0f0';
    };

    testBtn.onclick = async () => {
        const url = backendUrl.value.trim();
        testBtn.textContent = '⏳ Testing...';
        testBtn.disabled = true;

        try {
            const response = await fetch(`${url}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                showStatus(`✅ Connected! Backend is ${data.status}`, 'success');
            } else {
                showStatus(`❌ Connection failed (${response.status})`, 'error');
            }
        } catch (error) {
            showStatus(`❌ Cannot connect to backend: ${error.message}`, 'error');
        }

        testBtn.textContent = '🧪 Test Backend Connection';
        testBtn.disabled = false;
    };

    // Insert after backend URL input
    const backendGroup = document.querySelector('.settings-group');
    backendGroup.parentNode.insertBefore(testBtn, backendGroup.nextSibling);
});
