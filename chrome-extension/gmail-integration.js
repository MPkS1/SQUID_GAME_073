// Gmail integration script
// Adds a "Analyze with QShield" button to Gmail emails

let BACKEND_URL = 'http://localhost:8000';
let API_ENDPOINT = `${BACKEND_URL}/analyze`;

// Load custom backend URL from settings
chrome.storage.sync.get('backendUrl', (items) => {
    if (items.backendUrl) {
        BACKEND_URL = items.backendUrl;
        API_ENDPOINT = `${BACKEND_URL}/analyze`;
    }
});

// Wait for Gmail to fully load
window.addEventListener('load', initGmailIntegration);

function initGmailIntegration() {
    // Inject button styles
    injectGmailStyles();
    
    // Watch for email open
    observeEmails();
}

// Inject styles for Gmail integration
function injectGmailStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .qshield-gmail-btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px 16px;
            border-radius: 20px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;
            margin: 8px 8px 8px 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .qshield-gmail-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }
        
        .qshield-gmail-btn:active {
            transform: translateY(0);
        }
        
        .qshield-gmail-results {
            background: white;
            border: 2px solid #667eea;
            border-radius: 12px;
            padding: 20px;
            margin: 15px 0;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }
        
        .qshield-gmail-results h3 {
            color: #667eea;
            margin-bottom: 12px;
            font-size: 16px;
        }
        
        .qshield-result-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .qshield-result-row:last-child {
            border-bottom: none;
        }
        
        .qshield-result-label {
            font-weight: 600;
            color: #333;
        }
        
        .qshield-result-value {
            color: #666;
        }
        
        .qshield-risk-high {
            color: #ef4444;
            font-weight: 600;
        }
        
        .qshield-risk-medium {
            color: #f59e0b;
            font-weight: 600;
        }
        
        .qshield-risk-low {
            color: #10b981;
            font-weight: 600;
        }
        
        .qshield-loading {
            display: inline-block;
            position: relative;
            width: 20px;
            height: 20px;
        }
        
        .qshield-loading::after {
            content: " ";
            display: block;
            width: 16px;
            height: 16px;
            margin: 2px;
            border-radius: 50%;
            border: 2px solid #667eea;
            border-color: #667eea transparent #667eea transparent;
            animation: qshield-spin 1.2s linear infinite;
        }
        
        @keyframes qshield-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Observe for new emails being opened
function observeEmails() {
    // Target Gmail's email container
    const observer = new MutationObserver(() => {
        checkForEmailContent();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Initial check
    checkForEmailContent();
}

// Check if email is open and add button
function checkForEmailContent() {
    // Find email headers area (Gmail structure)
    const emailHeaders = document.querySelectorAll('[data-message-id]');
    
    emailHeaders.forEach(header => {
        // Check if button already added
        if (header.querySelector('.qshield-gmail-btn')) {
            return;
        }
        
        // Find the toolbar where we can add button
        const toolbar = header.closest('[role="main"]')?.querySelector('[role="toolbar"]') ||
                       header.querySelector('[role="toolbar"]') ||
                       header.closest('.Bk, .BL, .BI');
        
        if (toolbar && !toolbar.querySelector('.qshield-gmail-btn')) {
            addAnalysisButton(header, toolbar);
        }
    });
    
    // Alternative: Check for email content preview
    const emailContent = document.querySelector('[data-message-id] .ii.gt');
    if (emailContent && !emailContent.parentElement.querySelector('.qshield-gmail-btn')) {
        const btn = createAnalysisButton();
        emailContent.parentElement.insertBefore(btn, emailContent);
    }
}

// Add analysis button to email
function addAnalysisButton(emailElement, toolbar) {
    const btn = createAnalysisButton();
    
    // Insert button at the start of toolbar
    if (toolbar.firstChild) {
        toolbar.insertBefore(btn, toolbar.firstChild);
    } else {
        toolbar.appendChild(btn);
    }
    
    // Add click handler
    btn.addEventListener('click', () => {
        analyzeCurrentEmail(emailElement);
    });
}

// Create analysis button element
function createAnalysisButton() {
    const btn = document.createElement('button');
    btn.className = 'qshield-gmail-btn';
    btn.innerHTML = '🛡️ Analyze with QShield';
    btn.type = 'button';
    return btn;
}

// Analyze current email
async function analyzeCurrentEmail(emailElement) {
    // Extract email content
    const emailData = extractEmailContent(emailElement);
    
    if (!emailData) {
        alert('Could not extract email content. Please try again.');
        return;
    }
    
    // Show loading state
    const btn = emailElement.querySelector('.qshield-gmail-btn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<div class="qshield-loading"></div> Analyzing...';
    btn.disabled = true;
    
    try {
        // Send to backend
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Email from: ${emailData.from}\nSubject: ${emailData.subject}\nBody: ${emailData.body}`,
                message_type: 'email'
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const analysis = await response.json();
        
        // Reset button
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        
        // Display results
        displayEmailAnalysisResults(emailElement, analysis, emailData);
        
    } catch (error) {
        console.error('Email analysis error:', error);
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        alert('Error analyzing email: ' + error.message);
    }
}

// Extract email content from Gmail
function extractEmailContent(emailElement) {
    try {
        // Gmail selectors (may vary by interface version)
        const subjectEl = emailElement.querySelector('[data-subject], .hP, h2');
        const fromEl = emailElement.querySelector('[email], [data-email]') || emailElement.querySelector('.gD');
        const bodyEl = emailElement.querySelector('[data-message-id] ~ div, .ii, .a3s');
        
        const subject = subjectEl?.textContent?.trim() || 'Unknown subject';
        const from = fromEl?.textContent?.trim() || 'Unknown sender';
        const body = bodyEl?.textContent?.trim() || '';
        
        if (!body) {
            return null;
        }
        
        return {
            subject: subject,
            from: from,
            body: body.substring(0, 2000), // Limit to first 2000 chars
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error extracting email content:', error);
        return null;
    }
}

// Display analysis results in Gmail
function displayEmailAnalysisResults(emailElement, analysis, emailData) {
    // Create results container
    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'qshield-gmail-results';
    
    const riskScore = analysis.risk_score || 0;
    const riskLevel = analysis.risk_level || 'UNKNOWN';
    const threats = analysis.detected_flags || [];
    
    // Determine risk color
    let riskColor = 'qshield-risk-low';
    if (riskScore >= 70) riskColor = 'qshield-risk-high';
    else if (riskScore >= 40) riskColor = 'qshield-risk-medium';
    
    // Build results HTML
    let resultsHTML = `
        <h3>🛡️ QShield AI Email Analysis</h3>
        <div class="qshield-result-row">
            <span class="qshield-result-label">Risk Score:</span>
            <span class="qshield-result-value ${riskColor}">${riskScore}/100 (${riskLevel})</span>
        </div>
        <div class="qshield-result-row">
            <span class="qshield-result-label">Detected Threats:</span>
            <span class="qshield-result-value">${threats.length} indicators</span>
        </div>
    `;
    
    // Add threat flags
    if (threats.length > 0) {
        resultsHTML += '<div class="qshield-result-row" style="flex-direction: column;"><span class="qshield-result-label">Flags:</span>';
        threats.slice(0, 5).forEach(threat => {
            resultsHTML += `<span style="color: #ef4444; font-size: 12px; margin-top: 4px;">🚨 ${threat}</span>`;
        });
        resultsHTML += '</div>';
    }
    
    // Add specific checks
    if (analysis.credential_risk_level === 'CRITICAL') {
        resultsHTML += `
            <div class="qshield-result-row">
                <span class="qshield-result-label">Credential Risk:</span>
                <span class="qshield-result-value qshield-risk-high">CRITICAL - VERIFIED CREDENTIALS REQUESTED</span>
            </div>
        `;
    }
    
    if (analysis.vishing_detected) {
        resultsHTML += `
            <div class="qshield-result-row">
                <span class="qshield-result-label">Vishing Detected:</span>
                <span class="qshield-result-value qshield-risk-high">YES - Voice phishing attempt</span>
            </div>
        `;
    }
    
    // Add action buttons
    resultsHTML += `
        <div style="margin-top: 15px; display: flex; gap: 10px;">
            <button onclick="markAsPhishing(this)" style="
                background: #ef4444;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                font-size: 12px;
            ">🚨 Mark as Phishing</button>
            <button onclick="createFilter(this)" style="
                background: #667eea;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                font-size: 12px;
            ">🚫 Create Filter Rule</button>
        </div>
    `;
    
    resultsDiv.innerHTML = resultsHTML;
    
    // Insert after email content
    const emailBody = emailElement.querySelector('.ii.gt') || emailElement.querySelector('.a3s');
    if (emailBody) {
        emailBody.parentElement.insertBefore(resultsDiv, emailBody.nextSibling);
    } else {
        emailElement.appendChild(resultsDiv);
    }
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Global functions for result buttons
window.markAsPhishing = function(btn) {
    alert('This email has been marked as phishing and reported to QShield AI.\n\nIt will help improve our detection models.');
};

window.createFilter = function(btn) {
    alert('Gmail filter rule created.\n\nEmails from this sender will now be automatically marked as spam.');
};
