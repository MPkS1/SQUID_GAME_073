// Background Service Worker - Manifest V3
// Handles message routing and phishing reports

let BACKEND_URL = 'http://localhost:8000';

// Load custom backend URL from settings
chrome.storage.sync.get('backendUrl', (items) => {
    if (items.backendUrl) {
        BACKEND_URL = items.backendUrl;
        console.log('🔗 Backend URL updated:', BACKEND_URL);
    }
});

console.log('🛡️ QShield AI Background Service Worker loaded');

// ============= MESSAGE HANDLING =============

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received:', request.action);
    
    try {
        if (request.action === 'reportPhishing') {
            reportPhishingLink(request.url, request.risk_score);
            sendResponse({ success: true, message: 'Phishing reported' });
        } else if (request.action === 'analyzeLink') {
            analyzeLink(request.url).then(result => {
                sendResponse({ 
                    success: true, 
                    result: result 
                });
            }).catch(error => {
                sendResponse({ 
                    success: false, 
                    error: error.message 
                });
            });
            return true; // Keep channel open for async response
        } else if (request.action === 'getAnalysis') {
            getAnalysis(request.message).then(result => {
                sendResponse({ 
                    success: true, 
                    result: result 
                });
            }).catch(error => {
                sendResponse({ 
                    success: false, 
                    error: error.message 
                });
            });
            return true; // Keep channel open for async response
        }
    } catch (error) {
        console.error('Message handler error:', error);
        sendResponse({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============= ANALYSIS FUNCTIONS =============

async function analyzeLink(url) {
    console.log('Analyzing link:', url);
    try {
        const response = await fetch(`${BACKEND_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Check this link: ${url}`,
                message_type: 'website'
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Link analysis error:', error);
        throw error;
    }
}

async function getAnalysis(message) {
    console.log('Getting analysis for message');
    try {
        const response = await fetch(`${BACKEND_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                message_type: 'email'
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Analysis error:', error);
        throw error;
    }
}

// ============= REPORTING FUNCTIONS =============

async function reportPhishingLink(url, riskScore) {
    console.log('Reporting phishing link:', url, 'Risk:', riskScore);
    try {
        const response = await fetch(`${BACKEND_URL}/report-phishing`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: url,
                risk_score: riskScore,
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            console.error('Report failed:', response.status);
            return;
        }
        
        console.log('Phishing reported successfully');
    } catch (error) {
        console.error('Report error:', error);
    }
}

// ============= INITIALIZATION =============

// Only set up health check if chrome.alarms is available
try {
    if (typeof chrome !== 'undefined' && chrome.alarms) {
        chrome.alarms.create('checkBackendHealth', { periodInMinutes: 5 });
        
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === 'checkBackendHealth') {
                checkBackendHealth();
            }
        });
    }
} catch (error) {
    console.warn('Could not set up alarms:', error);
}

async function checkBackendHealth() {
    try {
        const response = await fetch(`${BACKEND_URL}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const status = response.ok ? 'online' : 'offline';
        chrome.storage.local.set({ backendStatus: status });
        console.log('Backend status:', status);
    } catch (error) {
        chrome.storage.local.set({ backendStatus: 'offline' });
        console.log('Backend offline:', error.message);
    }
}

// Check health on startup
chrome.runtime.onInstalled.addListener(() => {
    console.log('🛡️ QShield AI extension installed/updated');
    checkBackendHealth();
});
