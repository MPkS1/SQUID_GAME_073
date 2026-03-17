// Content script that runs on all web pages
// Detects phishing links and highlights them

// Get BACKEND_URL from Chrome storage (fallback to localhost)
let BACKEND_URL = 'http://localhost:8000';
let API_ENDPOINT = `${BACKEND_URL}/analyze`;

// Load custom backend URL from settings
chrome.storage.sync.get('backendUrl', (items) => {
    if (items.backendUrl) {
        BACKEND_URL = items.backendUrl;
        API_ENDPOINT = `${BACKEND_URL}/analyze`;
    }
});

// Store analysis cache
let linkAnalysisCache = {};

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPhishingDetection);
} else {
    initPhishingDetection();
}

// Track analysis stats
let analysisStats = {
    totalLinks: 0,
    analyzed: 0,
    highRisk: 0,
    mediumRisk: 0,
    safe: 0
};

function initPhishingDetection() {
    // Add warning styles to page
    injectStyles();
    
    // Create notification banner
    createNotificationBanner();
    
    // Create link panel
    createLinkPanel();
    
    // Scan all links on page
    scanPageLinks();
    
    // Watch for new links added dynamically
    observeDOMChanges();
}

// Inject CSS for warning overlays and link panel
function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .qshield-phishing-warning {
            position: relative;
        }
        
        .qshield-phishing-tooltip {
            position: absolute;
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            display: none;
            animation: slideUp 0.3s ease;
            pointer-events: none;
        }
        
        .qshield-phishing-tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 6px solid transparent;
            border-top-color: #333;
        }
        
        .qshield-phishing-warning:hover .qshield-phishing-tooltip {
            display: block;
        }
        
        a.qshield-phishing-link {
            border-bottom: 3px dashed #ef4444 !important;
            background-color: #fee2e2 !important;
            padding: 2px 4px;
            border-radius: 3px;
        }
        
        a.qshield-medium-risk {
            border-bottom: 3px dashed #f59e0b !important;
            background-color: #fef3c7 !important;
            padding: 2px 4px;
            border-radius: 3px;
        }
        
        a.qshield-safe-link {
            border-bottom: 3px solid #10b981 !important;
            padding: 2px 4px;
        }
        
        .qshield-risk-badge {
            display: inline-block;
            background: #ef4444;
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 700;
            margin-left: 4px;
            vertical-align: middle;
            white-space: nowrap;
        }
        
        .qshield-risk-badge.medium {
            background: #f59e0b;
        }
        
        .qshield-risk-badge.safe {
            background: #10b981;
        }
        
        /* Link Panel */
        #qshield-link-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 380px;
            max-height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            z-index: 99998;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            border: 2px solid #667eea;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        #qshield-panel-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            font-weight: 700;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        #qshield-panel-close {
            background: rgba(255, 255, 255, 0.3);
            border: none;
            color: white;
            cursor: pointer;
            font-size: 18px;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background 0.3s;
        }
        
        #qshield-panel-close:hover {
            background: rgba(255, 255, 255, 0.5);
        }
        
        #qshield-links-list {
            overflow-y: auto;
            flex: 1;
            padding: 10px;
        }
        
        .qshield-link-item {
            padding: 10px;
            margin-bottom: 8px;
            border-radius: 6px;
            background: #f9fafb;
            border-left: 4px solid #667eea;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 12px;
        }
        
        .qshield-link-item:hover {
            background: #eff6ff;
            transform: translateX(4px);
        }
        
        .qshield-link-item.high-risk {
            border-left-color: #ef4444;
            background: #fee2e2;
        }
        
        .qshield-link-item.medium-risk {
            border-left-color: #f59e0b;
            background: #fef3c7;
        }
        
        .qshield-link-item.safe {
            border-left-color: #10b981;
            background: #f0fdf4;
        }
        
        .qshield-link-url {
            font-weight: 600;
            color: #111;
            margin-bottom: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .qshield-link-risk {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: #666;
        }
        
        .qshield-score {
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 8px;
            background: white;
            color: #111;
        }
        
        .qshield-score.high {
            color: #ef4444;
            background: #fee2e2;
        }
        
        .qshield-score.medium {
            color: #f59e0b;
            background: #fef3c7;
        }
        
        .qshield-score.safe {
            color: #10b981;
            background: #f0fdf4;
        }
        
        /* Notification Banner */
        #qshield-notification-banner {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 20px;
            z-index: 99999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            font-size: 13px;
            font-weight: 600;
        }
        
        #qshield-banner-content {
            display: flex;
            gap: 20px;
            flex: 1;
            align-items: center;
        }
        
        .qshield-banner-stat {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .qshield-banner-stat .number {
            font-size: 16px;
            font-weight: 700;
        }
        
        #qshield-banner-close {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            cursor: pointer;
            font-size: 20px;
            padding: 4px 8px;
            border-radius: 4px;
            transition: background 0.3s;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #qshield-banner-close:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        
        body.qshield-banner-active {
            margin-top: 50px;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Create floating link panel
function createLinkPanel() {
    const panel = document.createElement('div');
    panel.id = 'qshield-link-panel';
    panel.innerHTML = `
        <div id="qshield-panel-header">
            <span>🛡️ QShield - Page Links</span>
            <button id="qshield-panel-close">✕</button>
        </div>
        <div id="qshield-links-list"></div>
    `;
    document.body.appendChild(panel);
    
    // Close button handler
    document.getElementById('qshield-panel-close').addEventListener('click', () => {
        panel.style.display = 'none';
    });
    
    // Make panel draggable
    makePanelDraggable(panel);
}

// Create notification banner at top
function createNotificationBanner() {
    const banner = document.createElement('div');
    banner.id = 'qshield-notification-banner';
    banner.innerHTML = `
        <div id="qshield-banner-content">
            <div class="qshield-banner-stat">
                <span>🔍</span>
                <span>Links: <span class="number" id="total-links">0</span></span>
            </div>
            <div class="qshield-banner-stat">
                <span>🚨</span>
                <span>High Risk: <span class="number" id="high-risk-count">0</span></span>
            </div>
            <div class="qshield-banner-stat">
                <span>⚠️</span>
                <span>Medium: <span class="number" id="medium-risk-count">0</span></span>
            </div>
            <div class="qshield-banner-stat">
                <span>✅</span>
                <span>Safe: <span class="number" id="safe-count">0</span></span>
            </div>
        </div>
        <button id="qshield-banner-close">✕</button>
    `;
    document.body.insertBefore(banner, document.body.firstChild);
    document.body.classList.add('qshield-banner-active');
    
    // Close button handler
    document.getElementById('qshield-banner-close').addEventListener('click', () => {
        banner.remove();
        document.body.classList.remove('qshield-banner-active');
    });
}

// Update notification banner stats
function updateNotificationBanner() {
    document.getElementById('total-links').textContent = analysisStats.totalLinks;
    document.getElementById('high-risk-count').textContent = analysisStats.highRisk;
    document.getElementById('medium-risk-count').textContent = analysisStats.mediumRisk;
    document.getElementById('safe-count').textContent = analysisStats.safe;
}

// Make panel draggable
function makePanelDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = element.querySelector('#qshield-panel-header');
    
    header.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Scan all links on the page
async function scanPageLinks() {
    const links = document.querySelectorAll('a[href]');
    
    // Get unique domains to analyze
    const uniqueLinks = new Set();
    links.forEach(link => {
        if (link.href.startsWith('http')) {
            uniqueLinks.add(link.href);
        }
    });
    
    analysisStats.totalLinks = uniqueLinks.size;
    updateNotificationBanner();

    // Analyze links in batches
    for (const linkHref of uniqueLinks) {
        if (linkAnalysisCache[linkHref]) {
            // Use cached result
            updateLinkUI(linkHref, linkAnalysisCache[linkHref]);
        } else {
            // Analyze with backend
            analyzeLink(linkHref);
        }
    }
}

// Analyze single link
async function analyzeLink(linkHref) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Check this link: ${linkHref}`,
                message_type: 'url'
            })
        });

        if (response.ok) {
            const result = await response.json();
            linkAnalysisCache[linkHref] = result;
            updateLinkUI(linkHref, result);
        }
    } catch (error) {
        console.log('Link analysis error (non-critical):', error);
    }
}

// Update link UI based on risk
function updateLinkUI(linkHref, analysis) {
    const riskScore = analysis.final_risk_score || 0;
    const riskLevel = analysis.risk_level || 'MEDIUM';
    
    // Track stats for banner
    analysisStats.analyzed++;
    if (riskScore >= 70) {
        analysisStats.highRisk++;
    } else if (riskScore >= 40) {
        analysisStats.mediumRisk++;
    } else {
        analysisStats.safe++;
    }
    updateNotificationBanner();
    
    // Store in allLinksData
    allLinksData[linkHref] = { riskScore, riskLevel, analysis };
    
    // Find all links with this href
    const links = document.querySelectorAll(`a[href="${linkHref}"]`);
    
    links.forEach(link => {
        if (link.classList.contains('qshield-phishing-warning')) {
            return; // Already processed
        }
        
        // Determine risk class
        let riskClass = 'qshield-safe-link';
        let riskText = '✅ Safe';
        let bgColor = '#10b981';
        let riskLabel = 'SAFE';
        let badgeClass = 'safe';
        
        if (riskScore >= 70) {
            riskClass = 'qshield-phishing-link';
            riskText = '🚨 PHISHING LINK - DO NOT CLICK';
            bgColor = '#ef4444';
            riskLabel = 'HIGH RISK';
            badgeClass = 'high';
        } else if (riskScore >= 40) {
            riskClass = 'qshield-medium-risk';
            riskText = '⚠️ SUSPICIOUS - VERIFY BEFORE CLICKING';
            bgColor = '#f59e0b';
            riskLabel = 'MEDIUM RISK';
            badgeClass = 'medium';
        }
        
        // Add class to link
        link.classList.add('qshield-phishing-warning', riskClass);
        
        // Add risk badge to link text
        const badge = document.createElement('span');
        badge.className = `qshield-risk-badge ${badgeClass}`;
        badge.textContent = `${riskScore}/100`;
        badge.style.marginLeft = '4px';
        link.appendChild(badge);
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'qshield-phishing-tooltip';
        tooltip.style.backgroundColor = bgColor;
        tooltip.innerHTML = `
            ${riskText}<br>
            Risk: ${riskScore}/100 | ${riskLevel}
        `;
        link.appendChild(tooltip);
        
        // Add event listeners
        link.addEventListener('click', (e) => {
            if (riskScore >= 70) {
                e.preventDefault();
                showPhishingWarning(linkHref, riskScore);
            }
        });
        
        // Add to panel
        addLinkToPanel(linkHref, riskScore, riskLabel, link.textContent.substring(0, 30));
    });
}

// Add link to floating panel
function addLinkToPanel(linkHref, riskScore, riskLabel, linkText) {
    const listContainer = document.getElementById('qshield-links-list');
    if (!listContainer) return;
    
    // Determine risk class for styling
    let riskClass = 'safe';
    let icon = '✅';
    if (riskScore >= 70) {
        riskClass = 'high-risk';
        icon = '🚨';
    } else if (riskScore >= 40) {
        riskClass = 'medium-risk';
        icon = '⚠️';
    }
    
    // Check if link already in panel
    const existingItem = listContainer.querySelector(`[data-url="${linkHref}"]`);
    if (existingItem) {
        existingItem.remove();
    }
    
    // Create link item
    const linkItem = document.createElement('div');
    linkItem.className = `qshield-link-item ${riskClass}`;
    linkItem.setAttribute('data-url', linkHref);
    linkItem.innerHTML = `
        <div class="qshield-link-url" title="${linkHref}">
            ${icon} ${linkText || 'Link'}
        </div>
        <div class="qshield-link-risk">
            <span>${linkHref.substring(0, 40)}...</span>
            <span class="qshield-score ${riskClass}">${riskScore}/100</span>
        </div>
    `;
    
    // Click handler to scroll to link
    linkItem.addEventListener('click', () => {
        const link = document.querySelector(`a[href="${linkHref}"]`);
        if (link) {
            link.scrollIntoView({ behavior: 'smooth', block: 'center' });
            link.style.boxShadow = '0 0 10px rgba(102, 126, 234, 0.8)';
            setTimeout(() => {
                link.style.boxShadow = '';
            }, 2000);
        }
    });
    
    // Add to top of list
    listContainer.insertBefore(linkItem, listContainer.firstChild);
}

// Show blocking warning for high-risk links
function showPhishingWarning(url, riskScore) {
    const warning = document.createElement('div');
    warning.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 16px;
        padding: 30px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 100000;
        max-width: 500px;
        text-align: center;
        font-family: 'Segoe UI', sans-serif;
    `;
    
    warning.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 15px;">🚨</div>
        <h2 style="color: #ef4444; margin-bottom: 10px;">PHISHING LINK DETECTED</h2>
        <p style="color: #666; margin-bottom: 15px;">
            This link has been flagged as a potential phishing attempt.
        </p>
        <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #991b1b; font-size: 12px; word-break: break-all;">
                <strong>URL:</strong> ${url}
            </p>
            <p style="color: #991b1b; margin-top: 8px;">
                <strong>Risk Score:</strong> ${riskScore}/100
            </p>
        </div>
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
            <strong>Do not click this link or provide personal information.</strong>
        </p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <button id="closeWarning" style="
                background: #e5e7eb;
                color: #333;
                border: none;
                padding: 12px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
            ">Go Back</button>
            <button id="reportPhishing" style="
                background: #667eea;
                color: white;
                border: none;
                padding: 12px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
            ">Report to QShield</button>
        </div>
    `;
    
    document.body.appendChild(warning);
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 99999;
    `;
    document.body.appendChild(overlay);
    
    // Button handlers
    document.getElementById('closeWarning').addEventListener('click', () => {
        warning.remove();
        overlay.remove();
    });
    
    document.getElementById('reportPhishing').addEventListener('click', () => {
        chrome.runtime.sendMessage({
            action: 'reportPhishing',
            url: url,
            riskScore: riskScore
        });
        warning.remove();
        overlay.remove();
    });
}

// Observe DOM for dynamically added links
function observeDOMChanges() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        let newLinks = node.querySelectorAll ? Array.from(node.querySelectorAll('a[href]')) : [];
                        if (node.tagName === 'A' && node.href) {
                            newLinks.push(node);
                        }
                        newLinks.forEach(link => {
                            if (!link.classList.contains('qshield-phishing-warning')) {
                                analyzeLink(link.href);
                            }
                        });
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
