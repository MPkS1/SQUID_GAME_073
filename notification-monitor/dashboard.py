"""
QShield AI Notification Monitor - Web Dashboard
Flask app to display analyzed notifications and statistics
"""

from flask import Flask, render_template_string, jsonify, request
from notification_listener import NotificationMonitor
import asyncio
import logging
from datetime import datetime, timedelta
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

# Initialize monitor
monitor = NotificationMonitor(backend_url="http://localhost:8000")

# ============= ROUTES =============

@app.route('/')
def dashboard():
    """Main dashboard page"""
    return render_template_string(DASHBOARD_HTML)


@app.route('/api/stats')
def get_stats():
    """Get statistics API"""
    return jsonify(monitor.get_dashboard_data()["statistics"])


@app.route('/api/notifications')
def get_notifications():
    """Get recent notifications"""
    limit = request.args.get('limit', 20, type=int)
    notifications = monitor.db.get_recent_notifications(limit)
    
    # Format for display
    formatted = []
    for n in notifications:
        risk_emoji = {
            "RED": "🔴",
            "ORANGE": "🟠",
            "GREEN": "🟢"
        }.get(n.get('risk_level', 'UNKNOWN'), '⚪')
        
        formatted.append({
            'id': n['id'],
            'timestamp': n['timestamp'],
            'source': n['source'],
            'text': n['text'][:100] + ('...' if len(n['text']) > 100 else ''),
            'risk_score': n['risk_score'],
            'risk_level': n['risk_level'],
            'risk_emoji': risk_emoji,
            'explanation': n.get('explanation', 'Analyzing...'),
            'flags': n.get('flags', '').split(',') if n.get('flags') else []
        })
    
    return jsonify(formatted)


@app.route('/api/notification/<int:notif_id>')
def get_notification_detail(notif_id):
    """Get detailed analysis for a notification"""
    with monitor.db:
        import sqlite3
        conn = sqlite3.connect(monitor.db.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT n.*, a.*
            FROM notifications n
            LEFT JOIN analysis_details a ON n.id = a.notification_id
            WHERE n.id = ?
        """, (notif_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return jsonify({"error": "Not found"}), 404
        
        return jsonify({
            'id': row['id'],
            'timestamp': row['timestamp'],
            'source': row['source'],
            'text': row['text'],
            'risk_score': row['risk_score'],
            'risk_level': row['risk_level'],
            'explanation': row['explanation'],
            'flags': row['flags'].split(',') if row['flags'] else [],
            'credential_harvesting': json.loads(row['credential_harvesting'] or '{}'),
            'anomaly_detection': json.loads(row['anomaly_detection'] or '{}'),
            'attack_pattern': json.loads(row['attack_pattern'] or '{}')
        })


@app.route('/api/test-notification', methods=['POST'])
def test_notification():
    """API to test with a sample notification"""
    data = request.json or {}
    source = data.get('source', 'Test')
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    # Process notification asynchronously
    try:
        asyncio.run(monitor.process_notification(source, text))
        return jsonify({
            "status": "success",
            "message": f"Notification from {source} queued for analysis"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/clear-database', methods=['POST'])
def clear_database():
    """Clear all notifications (BE CAREFUL!)"""
    import os
    try:
        os.remove(monitor.db.db_path)
        monitor.db.init_database()
        return jsonify({"status": "success", "message": "Database cleared"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============= HTML DASHBOARD =============

DASHBOARD_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QShield AI - Notification Monitor</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header {
            color: white;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            text-align: center;
            transition: transform 0.3s;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
            margin: 10px 0;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .stat-card.high-risk .stat-value {
            color: #ff4444;
        }
        
        .stat-card.medium-risk .stat-value {
            color: #ff9800;
        }
        
        .stat-card.safe .stat-value {
            color: #4caf50;
        }
        
        .section {
            background: white;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .section h2 {
            color: #667eea;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .test-form {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .test-form input,
        .test-form select,
        .test-form button {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1em;
        }
        
        .test-form input {
            flex: 1;
            min-width: 300px;
        }
        
        .test-form button {
            background: #667eea;
            color: white;
            border: none;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.3s;
        }
        
        .test-form button:hover {
            background: #764ba2;
        }
        
        .notification-item {
            background: #f9f9f9;
            padding: 15px;
            margin-bottom: 10px;
            border-left: 5px solid #667eea;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .notification-item:hover {
            background: #f0f0f0;
            transform: translateX(5px);
        }
        
        .notification-item.high-risk {
            border-left-color: #ff4444;
        }
        
        .notification-item.medium-risk {
            border-left-color: #ff9800;
        }
        
        .notification-item.safe {
            border-left-color: #4caf50;
        }
        
        .notification-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .notification-source {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: bold;
        }
        
        .notification-score {
            font-size: 1.3em;
            font-weight: bold;
        }
        
        .notification-text {
            color: #333;
            margin-bottom: 8px;
            font-size: 0.95em;
        }
        
        .notification-meta {
            display: flex;
            gap: 15px;
            font-size: 0.85em;
            color: #999;
        }
        
        .notification-flags {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
            margin-top: 8px;
        }
        
        .flag {
            background: #fff3cd;
            color: #856404;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 0.8em;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: #999;
        }
        
        .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .no-data {
            text-align: center;
            color: #999;
            padding: 40px;
        }
        
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        }
        
        .modal-content {
            background-color: white;
            margin: 5% auto;
            padding: 30px;
            border-radius: 10px;
            width: 90%;
            max-width: 700px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        
        .close-btn {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }
        
        .close-btn:hover {
            color: #000;
        }
        
        .detail-label {
            font-weight: bold;
            color: #667eea;
            margin-top: 15px;
            margin-bottom: 5px;
        }
        
        .detail-value {
            background: #f9f9f9;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 10px;
            font-family: monospace;
            font-size: 0.9em;
        }
        
        .action-buttons {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
        
        .action-buttons button {
            padding: 10px 15px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        }
        
        .btn-primary {
            background: #667eea;
            color: white;
        }
        
        .btn-danger {
            background: #ff4444;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ QShield AI</h1>
            <p>Real-Time Notification Phishing Detection Monitor</p>
        </div>
        
        <!-- STATISTICS -->
        <div class="stats-grid" id="statsGrid">
            <div class="stat-card">
                <div class="stat-label">Total Notifications</div>
                <div class="stat-value" id="totalNotifications">-</div>
            </div>
            <div class="stat-card high-risk">
                <div class="stat-label">🔴 High Risk</div>
                <div class="stat-value" id="highRiskCount">-</div>
            </div>
            <div class="stat-card medium-risk">
                <div class="stat-label">🟠 Medium Risk</div>
                <div class="stat-value" id="mediumRiskCount">-</div>
            </div>
            <div class="stat-card safe">
                <div class="stat-label">🟢 Safe</div>
                <div class="stat-value" id="safeCount">-</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Average Risk Score</div>
                <div class="stat-value" id="avgRiskScore">-</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Analysis Rate</div>
                <div class="stat-value" id="analysisRate">-</div>
            </div>
        </div>
        
        <!-- TEST FORM -->
        <div class="section">
            <h2>🧪 Test Notification Analysis</h2>
            <div class="test-form">
                <select id="sourceSelect">
                    <option value="Gmail">📧 Gmail</option>
                    <option value="Outlook">📧 Outlook</option>
                    <option value="Teams">💬 Teams</option>
                    <option value="Slack">💬 Slack</option>
                    <option value="Windows">🪟 Windows</option>
                    <option value="SMS">📱 SMS</option>
                </select>
                <input type="text" id="notificationText" placeholder="Paste notification text here..." />
                <button onclick="testNotification()">Analyze</button>
            </div>
            <p style="color: #999; font-size: 0.9em; margin-top: 10px;">
                💡 Tip: Paste phishing emails, SMS, or any suspicious notification to see the risk analysis
            </p>
        </div>
        
        <!-- NOTIFICATIONS LIST -->
        <div class="section">
            <h2>📋 Recent Notifications</h2>
            <div id="notificationsList" class="loading">
                <div class="loader"></div>
                <p>Loading notifications...</p>
            </div>
        </div>
    </div>
    
    <!-- DETAIL MODAL -->
    <div id="detailModal" class="modal">
        <div class="modal-content">
            <span class="close-btn" onclick="closeModal()">&times;</span>
            <div id="detailContent"></div>
        </div>
    </div>
    
    <script>
        // Load data on page load
        window.addEventListener('load', () => {
            loadStatistics();
            loadNotifications();
            // Refresh every 5 seconds
            setInterval(() => {
                loadStatistics();
                loadNotifications();
            }, 5000);
        });
        
        async function loadStatistics() {
            try {
                const response = await fetch('/api/stats');
                const stats = await response.json();
                
                document.getElementById('totalNotifications').textContent = stats.total_notifications;
                document.getElementById('highRiskCount').textContent = stats.high_risk;
                document.getElementById('mediumRiskCount').textContent = stats.medium_risk;
                document.getElementById('safeCount').textContent = stats.safe;
                document.getElementById('avgRiskScore').textContent = (stats.average_risk_score || 0).toFixed(1);
                document.getElementById('analysisRate').textContent = stats.analysis_rate;
            } catch (e) {
                console.error('Failed to load statistics:', e);
            }
        }
        
        async function loadNotifications() {
            try {
                const response = await fetch('/api/notifications?limit=30');
                const notifications = await response.json();
                
                if (!notifications || notifications.length === 0) {
                    document.getElementById('notificationsList').innerHTML = 
                        '<div class="no-data">No notifications yet. Try testing with sample notifications above.</div>';
                    return;
                }
                
                let html = '';
                notifications.forEach(notif => {
                    const riskClass = notif.risk_level?.toLowerCase() || '';
                    const riskEmoji = notif.risk_emoji || '⚪';
                    
                    html += `
                        <div class="notification-item ${riskClass}" onclick="viewDetail(${notif.id})">
                            <div class="notification-header">
                                <span class="notification-source">${notif.source}</span>
                                <span class="notification-score">${notif.risk_score}/100 ${riskEmoji}</span>
                            </div>
                            <div class="notification-text">${notif.text}</div>
                            <div class="notification-meta">
                                <span>⏰ ${new Date(notif.timestamp).toLocaleString()}</span>
                            </div>
                            ${notif.flags && notif.flags.length > 0 ? `
                                <div class="notification-flags">
                                    ${notif.flags.map(f => f.trim()).filter(f => f).map(f => 
                                        `<span class="flag">${f}</span>`
                                    ).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `;
                });
                
                document.getElementById('notificationsList').innerHTML = html;
            } catch (e) {
                console.error('Failed to load notifications:', e);
                document.getElementById('notificationsList').innerHTML = 
                    '<div class="no-data">Error loading notifications</div>';
            }
        }
        
        async function testNotification() {
            const source = document.getElementById('sourceSelect').value;
            const text = document.getElementById('notificationText').value.trim();
            
            if (!text) {
                alert('Please enter notification text');
                return;
            }
            
            try {
                const response = await fetch('/api/test-notification', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({source, text})
                });
                
                const result = await response.json();
                if (response.ok) {
                    alert('✅ Notification queued for analysis. It will appear in the list shortly.');
                    document.getElementById('notificationText').value = '';
                    // Refresh after a second
                    setTimeout(() => {
                        loadStatistics();
                        loadNotifications();
                    }, 1500);
                } else {
                    alert('❌ Error: ' + result.error);
                }
            } catch (e) {
                alert('❌ Failed to send notification: ' + e.message);
            }
        }
        
        async function viewDetail(notifId) {
            try {
                const response = await fetch(`/api/notification/${notifId}`);
                const detail = await response.json();
                
                let html = `
                    <h2>📊 Notification Details</h2>
                    
                    <div class="detail-label">Source</div>
                    <div class="detail-value">${detail.source}</div>
                    
                    <div class="detail-label">Risk Analysis</div>
                    <div class="detail-value">
                        Score: <strong>${detail.risk_score}/100</strong> | Level: <strong>${detail.risk_level}</strong>
                    </div>
                    
                    <div class="detail-label">Message</div>
                    <div class="detail-value">${detail.text}</div>
                    
                    <div class="detail-label">Explanation</div>
                    <div class="detail-value">${detail.explanation || 'No explanation available'}</div>
                    
                    ${detail.flags && detail.flags.length > 0 ? `
                        <div class="detail-label">Detected Flags</div>
                        <div class="detail-value">
                            ${detail.flags.map(f => f.trim()).filter(f => f).map(f => 
                                `<span class="flag" style="display: inline-block; margin-right: 5px;">${f}</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                    
                    ${detail.credential_harvesting && Object.keys(detail.credential_harvesting).length > 0 ? `
                        <div class="detail-label">Credential Harvesting</div>
                        <div class="detail-value">${JSON.stringify(detail.credential_harvesting, null, 2)}</div>
                    ` : ''}
                    
                    ${detail.anomaly_detection && Object.keys(detail.anomaly_detection).length > 0 ? `
                        <div class="detail-label">Anomaly Detection</div>
                        <div class="detail-value">${JSON.stringify(detail.anomaly_detection, null, 2)}</div>
                    ` : ''}
                    
                    ${detail.attack_pattern && Object.keys(detail.attack_pattern).length > 0 ? `
                        <div class="detail-label">Attack Pattern</div>
                        <div class="detail-value">${JSON.stringify(detail.attack_pattern, null, 2)}</div>
                    ` : ''}
                    
                    <div class="detail-label">Timestamp</div>
                    <div class="detail-value">${new Date(detail.timestamp).toLocaleString()}</div>
                `;
                
                document.getElementById('detailContent').innerHTML = html;
                document.getElementById('detailModal').style.display = 'block';
            } catch (e) {
                alert('Error loading details: ' + e.message);
            }
        }
        
        function closeModal() {
            document.getElementById('detailModal').style.display = 'none';
        }
        
        window.onclick = function(event) {
            const modal = document.getElementById('detailModal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        }
    </script>
</body>
</html>
"""

if __name__ == '__main__':
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║     QShield AI - Notification Monitor Web Dashboard         ║
    ║              Starting on http://localhost:5000              ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    app.run(debug=True, port=5000, host='0.0.0.0')
