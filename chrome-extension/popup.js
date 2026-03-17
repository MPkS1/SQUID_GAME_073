// Configuration
let BACKEND_URL = 'http://localhost:8000';
let API_ENDPOINT = `${BACKEND_URL}/analyze`;

// Load custom backend URL from settings
chrome.storage.sync.get('backendUrl', (items) => {
    if (items.backendUrl) {
        BACKEND_URL = items.backendUrl;
        API_ENDPOINT = `${BACKEND_URL}/analyze`;
    }
});

// DOM elements
const analyzeBtn = document.getElementById('analyzeBtn');
const reportBtn = document.getElementById('reportBtn');
const settingsBtn = document.getElementById('settingsBtn');
const statusDiv = document.getElementById('status');
const resultsDiv = document.getElementById('results');
const serverStatus = document.getElementById('serverStatus');
const gmailStatus = document.getElementById('gmailStatus');

// Check server connection on popup open
window.addEventListener('load', () => {
    checkServerStatus();
    detectPageType();
});

// Check if backend server is online
async function checkServerStatus() {
    try {
        const response = await fetch(`${BACKEND_URL}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            serverStatus.textContent = '🟢 Online';
            serverStatus.className = 'online';
        } else {
            serverStatus.textContent = '🔴 Offline';
            serverStatus.className = 'offline';
        }
    } catch (error) {
        serverStatus.textContent = '🔴 Offline';
        serverStatus.className = 'offline';
    }
}

// Detect if on Gmail
function detectPageType() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0].url;
        if (currentUrl.includes('mail.google.com')) {
            gmailStatus.textContent = '✅ Detected';
            gmailStatus.style.color = '#10b981';
        } else {
            gmailStatus.textContent = '❌ Not on Gmail';
        }
    });
}

// Analyze button click
analyzeBtn.addEventListener('click', async () => {
    statusDiv.style.display = 'block';
    resultsDiv.style.display = 'none';
    statusDiv.innerHTML = '<p>🔍 Analyzing page for phishing links...</p>';
    
    // Get current tab information
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const tabUrl = tabs[0].url;
        const tabTitle = tabs[0].title;
        
        // Inject content script to extract links
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: extractPageData
        }, async (results) => {
            if (results && results[0]) {
                const pageData = results[0].result;
                await analyzePageData(pageData, tabUrl, tabTitle);
            }
        });
    });
});

// Extract all links from the page
function extractPageData() {
    const links = [];
    document.querySelectorAll('a[href]').forEach(link => {
        links.push({
            text: link.innerText.substring(0, 50),
            href: link.href,
            visible: link.offsetParent !== null
        });
    });

    const pageText = document.body.innerText.substring(0, 1000);
    
    return {
        links: links,
        pageTitle: document.title,
        pageText: pageText,
        pageUrl: window.location.href
    };
}

// Analyze page data
async function analyzePageData(pageData, tabUrl, tabTitle) {
    try {
        // Combine page info into analysis message
        const analysisMessage = `
Website: ${tabUrl}
Page Title: ${tabTitle}
Total Links: ${pageData.links.length}

Page Content:
${pageData.pageText}
        `.trim();

        // Send to backend for analysis
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: analysisMessage,
                message_type: 'email'  // Use valid message_type
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API error: ${response.status} - ${error}`);
        }

        const analysisResult = await response.json();
        displayResults(pageData, analysisResult);

    } catch (error) {
        console.error('Analysis error:', error);
        statusDiv.innerHTML = `<p style="color: #ef4444;">❌ Error: ${error.message}</p>`;
    }
}

// Display analysis results
function displayResults(pageData, analysisResult) {
    statusDiv.style.display = 'none';
    resultsDiv.style.display = 'block';
    reportBtn.style.display = 'inline-block';

    // Extract correct field names from backend response
    const riskLevel = analysisResult.risk_level || 'UNKNOWN';
    const riskScore = analysisResult.final_risk_score || 0;
    const allFlags = analysisResult.all_flags || [];
    const credentialRisk = analysisResult.credential_harvesting?.credential_risk_level || 'NONE';
    const urlScanner = analysisResult.url_scanner || {};
    const malwareStatus = urlScanner.malware_status || 'CLEAN';

    // Risk score display
    const riskColor = riskScore > 70 ? '#ef4444' : riskScore > 40 ? '#f59e0b' : '#10b981';
    document.getElementById('pageRiskScore').innerHTML = 
        `Risk Score: <span style="color: ${riskColor}; font-weight: bold;">${riskScore}/100 (${riskLevel})</span>`;

    // Links analyzed
    document.getElementById('linksAnalyzed').innerHTML = 
        `Links analyzed: <strong>${pageData.links.length}</strong>`;

    // Threats found
    const threatCount = allFlags.length;
    document.getElementById('threatsFound').innerHTML = 
        `Threats detected: <strong style="color: ${threatCount > 0 ? '#ef4444' : '#10b981'};">${threatCount}</strong>`;

    // Links list
    let linksHTML = '';
    const urlRisks = urlScanner.url_risks || {};
    
    pageData.links.forEach((link, idx) => {
        if (link.href.startsWith('http')) {
            const linkRiskData = urlRisks[link.href] || {};
            const isSuspicious = linkRiskData.risk_level === 'HIGH';
            const riskClass = isSuspicious ? 'high-risk' : 'low-risk';
            
            linksHTML += `
                <div class="link-item ${riskClass}">
                    <div class="link-url">🔗 ${link.text || link.href.substring(0, 40)}</div>
                    <div style="font-size: 0.75em; color: #666; margin-top: 2px;">${link.href.substring(0, 50)}...</div>
                    <span class="link-risk ${isSuspicious ? 'risk-high' : 'risk-low'}">
                        ${isSuspicious ? '⚠️ SUSPICIOUS' : '✅ Safe'}
                    </span>
                </div>
            `;
        }
    });
    document.getElementById('linksList').innerHTML = linksHTML || '<p style="color: #999;">No external links found</p>';

    // Warnings
    let warningsHTML = '';
    
    if (credentialRisk === 'CRITICAL') {
        warningsHTML += '<div class="warning-item">🚨 CRITICAL: Credential harvesting detected</div>';
    }
    
    if (analysisResult.attack_pattern?.attack_framework_detected.includes('Vishing')) {
        warningsHTML += '<div class="warning-item">⚠️ Vishing (voice phishing) patterns detected</div>';
    }
    
    if (malwareStatus === 'DETECTED') {
        warningsHTML += '<div class="warning-item">🚨 Potential malware detected</div>';
    }
    
    if (allFlags.length > 3) {
        warningsHTML += '<div class="warning-item">⚠️ Multiple threat indicators present</div>';
    }
    
    if (riskScore > 70) {
        warningsHTML += '<div class="warning-item">🚨 HIGH RISK: Do not click suspicious links</div>';
    }
    
    if (warningsHTML === '') {
        warningsHTML = '<p style="color: #666;">✅ No major warnings detected</p>';
    }
    
    document.getElementById('warningsList').innerHTML = warningsHTML;
}

// Report button
reportBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabUrl = tabs[0].url;
        // Open full report in new tab
        chrome.tabs.create({
            url: `http://localhost:5174/?report=${encodeURIComponent(tabUrl)}`
        });
    });
});

// Settings button
settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});

// Periodically check server status
setInterval(checkServerStatus, 30000); // Every 30 seconds
